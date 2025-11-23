import { supabase } from "@/integrations/supabase/client";

export class WebRTCRealtimeBroadcaster {
  private channel: any = null;
  private pcMap: Map<string, RTCPeerConnection> = new Map();
  private stream: MediaStream | null = null;
  private streamerId: string = crypto.randomUUID();

  constructor() {
    console.log("WebRTC Realtime Broadcaster initialized with ID:", this.streamerId);
  }

  async startBroadcast(stream: MediaStream) {
    this.stream = stream;
    console.log("Starting broadcast with stream");

    this.channel = supabase.channel('webrtc_signaling');

    // Listen for viewer requests and answers
    this.channel
      .on('broadcast', { event: 'request-stream' }, async (payload: any) => {
        console.log("Viewer requested stream:", payload.payload.viewerId);
        if (payload.payload.streamerId === this.streamerId) {
          await this.createPeerConnection(payload.payload.viewerId);
        }
      })
      .on('broadcast', { event: 'answer' }, async (payload: any) => {
        console.log("Received answer from viewer:", payload.payload.from);
        if (payload.payload.to === this.streamerId) {
          await this.handleAnswer(payload.payload.answer, payload.payload.from);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async (payload: any) => {
        console.log("Received ICE candidate from viewer:", payload.payload.from);
        if (payload.payload.to === this.streamerId) {
          await this.handleIceCandidate(payload.payload.candidate, payload.payload.from);
        }
      })
      .on('broadcast', { event: 'viewer-online' }, (payload: any) => {
        console.log("Viewer came online:", payload.payload.viewerId);
        // Broadcast that streamer is online
        this.channel.send({
          type: 'broadcast',
          event: 'streamer-online',
          payload: { streamerId: this.streamerId }
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Broadcaster subscribed to signaling channel");
          // Announce streamer is online
          this.channel.send({
            type: 'broadcast',
            event: 'streamer-online',
            payload: { streamerId: this.streamerId }
          });
        }
      });
  }

  private async createPeerConnection(viewerId: string) {
    console.log("Creating peer connection for viewer:", viewerId);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add stream tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        console.log("Adding track to peer connection:", track.kind);
        pc.addTrack(track, this.stream!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate to viewer:", viewerId);
        this.channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            to: viewerId,
            from: this.streamerId
          }
        });
      }
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      console.log(`Viewer ${viewerId} connection state:`, pc.connectionState);
      
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this.pcMap.delete(viewerId);
        pc.close();
      }
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    console.log("Sending offer to viewer:", viewerId);
    this.channel.send({
      type: 'broadcast',
      event: 'offer',
      payload: {
        offer: offer,
        to: viewerId,
        from: this.streamerId
      }
    });

    this.pcMap.set(viewerId, pc);
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit, viewerId: string) {
    const pc = this.pcMap.get(viewerId);
    if (pc) {
      console.log("Setting remote description for viewer:", viewerId);
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit, viewerId: string) {
    const pc = this.pcMap.get(viewerId);
    if (pc && candidate) {
      console.log("Adding ICE candidate for viewer:", viewerId);
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  stopBroadcast() {
    console.log("Stopping broadcast");

    // Announce streamer is going offline
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'streamer-offline',
        payload: { streamerId: this.streamerId }
      });
    }

    // Close all peer connections
    this.pcMap.forEach(pc => pc.close());
    this.pcMap.clear();

    // Close channel
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.stream = null;
  }

  getViewerCount() {
    return this.pcMap.size;
  }
}
