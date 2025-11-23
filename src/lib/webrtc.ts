export class WebRTCStreamer {
  private ws: WebSocket | null = null;
  private pc: RTCPeerConnection | null = null;
  private clientId: string | null = null;
  private onStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onStatusCallback: ((status: string) => void) | null = null;

  constructor() {
    console.log("WebRTC Streamer initialized");
  }

  connect(projectId: string) {
    return new Promise<void>((resolve, reject) => {
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/stream-signaling`;
      console.log("Connecting to signaling server:", wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.updateStatus("connected");
        
        // Register as viewer
        this.ws?.send(JSON.stringify({ type: "register-viewer" }));
        resolve();
      };

      this.ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Received message:", message.type);
          
          await this.handleSignalingMessage(message);
        } catch (error) {
          console.error("Error handling message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.updateStatus("error");
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket closed");
        this.updateStatus("disconnected");
        this.cleanup();
      };
    });
  }

  private async handleSignalingMessage(message: any) {
    switch (message.type) {
      case "registered":
        this.clientId = message.clientId;
        console.log("Registered with ID:", this.clientId);
        
        if (message.streamAvailable) {
          this.updateStatus("stream-available");
          // Request stream
          this.requestStream();
        } else {
          this.updateStatus("waiting-for-stream");
        }
        break;

      case "stream-available":
        this.updateStatus("stream-available");
        this.requestStream();
        break;

      case "offer":
        await this.handleOffer(message.offer, message.from);
        break;

      case "ice-candidate":
        await this.handleIceCandidate(message.candidate);
        break;

      case "stream-ended":
        this.updateStatus("stream-ended");
        this.cleanup();
        break;

      case "error":
        console.error("Server error:", message.message);
        this.updateStatus("error");
        break;
    }
  }

  private requestStream() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not ready");
      return;
    }

    console.log("Requesting stream");
    this.ws.send(JSON.stringify({ type: "request-stream" }));
    this.updateStatus("connecting");
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, streamerId: string) {
    console.log("Received offer from streamer");
    
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
      if (event.candidate && this.ws?.readyState === WebSocket.OPEN) {
        console.log("Sending ICE candidate");
        this.ws.send(JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate,
          to: streamerId
        }));
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
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("Sending answer");
      this.ws.send(JSON.stringify({
        type: "answer",
        answer: answer,
        to: streamerId
      }));
    }
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
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  private cleanup() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}
