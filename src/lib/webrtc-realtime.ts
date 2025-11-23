import { supabase } from "@/integrations/supabase/client";

export class WebRTCRealtimeStreamer {
  private channel: any = null;
  private pc: RTCPeerConnection | null = null;
  private clientId: string = crypto.randomUUID();
  private onStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onStatusCallback: ((status: string) => void) | null = null;

  constructor() {
    console.log("WebRTC Realtime Streamer initialized with ID:", this.clientId);
  }

  connect() {
    return new Promise<void>((resolve, reject) => {
      console.log("Connecting to realtime signaling channel");
      
      this.channel = supabase.channel('webrtc_signaling');

      // Listen for signaling messages
      this.channel
        .on('broadcast', { event: 'offer' }, async (payload: any) => {
          console.log("Received offer:", payload);
          if (payload.payload.to === this.clientId) {
            await this.handleOffer(payload.payload.offer, payload.payload.from);
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async (payload: any) => {
          console.log("Received ICE candidate:", payload);
          if (payload.payload.to === this.clientId) {
            await this.handleIceCandidate(payload.payload.candidate);
          }
        })
        .on('broadcast', { event: 'streamer-online' }, (payload: any) => {
          console.log("Streamer is online, requesting stream");
          this.updateStatus("stream-available");
          this.requestStream(payload.payload.streamerId);
        })
        .on('broadcast', { event: 'streamer-offline' }, () => {
          console.log("Streamer went offline");
          this.updateStatus("stream-ended");
          this.cleanup();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log("Subscribed to signaling channel");
            this.updateStatus("connected");
            
            // Register as viewer and request streamer status
            this.channel.send({
              type: 'broadcast',
              event: 'viewer-online',
              payload: { viewerId: this.clientId }
            });
            
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            console.error("Channel error");
            reject(new Error("Failed to subscribe to signaling channel"));
          }
        });
    });
  }

  private requestStream(streamerId: string) {
    console.log("Requesting stream from:", streamerId);
    this.updateStatus("connecting");
    
    this.channel.send({
      type: 'broadcast',
      event: 'request-stream',
      payload: {
        viewerId: this.clientId,
        streamerId: streamerId
      }
    });
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, streamerId: string) {
    console.log("Handling offer from streamer:", streamerId);
    
    // Create peer connection
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Handle incoming stream
    this.pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      
      if (event.streams && event.streams[0]) {
        console.log("Stream received, notifying callback");
        this.onStreamCallback?.(event.streams[0]);
        this.updateStatus("streaming");
      }
    };

    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate to streamer");
        this.channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            to: streamerId,
            from: this.clientId
          }
        });
      }
    };

    // Handle connection state changes
    this.pc.onconnectionstatechange = () => {
      console.log("Connection state:", this.pc?.connectionState);
      
      if (this.pc?.connectionState === "connected") {
        this.updateStatus("streaming");
      } else if (this.pc?.connectionState === "disconnected" || 
                 this.pc?.connectionState === "failed") {
        this.updateStatus("disconnected");
        this.cleanup();
      }
    };

    // Set remote description and create answer
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    // Send answer back to streamer
    console.log("Sending answer to streamer");
    this.channel.send({
      type: 'broadcast',
      event: 'answer',
      payload: {
        answer: answer,
        to: streamerId,
        from: this.clientId
      }
    });
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.pc && candidate) {
      console.log("Adding ICE candidate");
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  onStream(callback: (stream: MediaStream) => void) {
    this.onStreamCallback = callback;
  }

  onStatus(callback: (status: string) => void) {
    this.onStatusCallback = callback;
  }

  private updateStatus(status: string) {
    console.log("Status update:", status);
    this.onStatusCallback?.(status);
  }

  disconnect() {
    console.log("Disconnecting");
    this.cleanup();
    
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private cleanup() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}
