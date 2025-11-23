import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const connectedClients = new Map<string, WebSocket>();
let streamerSocket: WebSocket | null = null;
let streamerClientId: string | null = null;

console.log("Stream signaling server started");

serve(async (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const clientId = crypto.randomUUID();
  
  console.log(`New connection: ${clientId}`);

  socket.onopen = () => {
    console.log(`Client ${clientId} connected`);
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log(`Message from ${clientId}:`, message.type);

      switch (message.type) {
        case "register-streamer":
          // Register as streamer
          streamerSocket = socket;
          streamerClientId = clientId;
          connectedClients.set("streamer", socket);
          connectedClients.set(clientId, socket); // Store under clientId for message routing
          socket.send(JSON.stringify({ 
            type: "registered", 
            role: "streamer",
            clientId 
          }));
          console.log(`Streamer registered with ID: ${clientId}`);
          
          // Notify all viewers that stream is available
          connectedClients.forEach((client, id) => {
            if (id !== "streamer" && id !== clientId && client.readyState === WebSocket.OPEN) {
              console.log(`Notifying viewer ${id} that stream is available`);
              client.send(JSON.stringify({ type: "stream-available" }));
            }
          });
          break;

        case "register-viewer":
          // Register as viewer
          connectedClients.set(clientId, socket);
          socket.send(JSON.stringify({ 
            type: "registered", 
            role: "viewer",
            clientId,
            streamAvailable: streamerSocket !== null 
          }));
          console.log(`Viewer ${clientId} registered`);
          break;

        case "offer":
          // Forward offer from streamer to specific viewer
          if (message.to && connectedClients.has(message.to)) {
            const targetSocket = connectedClients.get(message.to);
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
              targetSocket.send(JSON.stringify({
                type: "offer",
                offer: message.offer,
                from: clientId
              }));
              console.log(`Forwarded offer from ${clientId} to ${message.to}`);
            }
          }
          break;

        case "answer":
          // Forward answer from viewer to streamer
          if (message.to && connectedClients.has(message.to)) {
            const targetSocket = connectedClients.get(message.to);
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
              targetSocket.send(JSON.stringify({
                type: "answer",
                answer: message.answer,
                from: clientId
              }));
              console.log(`Forwarded answer from ${clientId} to ${message.to}`);
            }
          } else if (streamerSocket && streamerSocket.readyState === WebSocket.OPEN) {
            // Fallback to streamerSocket if no specific target
            streamerSocket.send(JSON.stringify({
              type: "answer",
              answer: message.answer,
              from: clientId
            }));
            console.log(`Forwarded answer from ${clientId} to streamer (fallback)`);
          }
          break;

        case "ice-candidate":
          // Forward ICE candidates
          if (message.to && connectedClients.has(message.to)) {
            const targetSocket = connectedClients.get(message.to);
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
              targetSocket.send(JSON.stringify({
                type: "ice-candidate",
                candidate: message.candidate,
                from: clientId
              }));
              console.log(`Forwarded ICE candidate from ${clientId} to ${message.to}`);
            }
          }
          break;

        case "request-stream":
          // Viewer requests stream from streamer
          if (streamerSocket && streamerSocket.readyState === WebSocket.OPEN) {
            streamerSocket.send(JSON.stringify({
              type: "viewer-joined",
              viewerId: clientId
            }));
            console.log(`Viewer ${clientId} requested stream`);
          } else {
            socket.send(JSON.stringify({ 
              type: "error", 
              message: "No streamer available" 
            }));
          }
          break;

        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: "Failed to process message" 
      }));
    }
  };

  socket.onclose = () => {
    console.log(`Client ${clientId} disconnected`);
    
    // If streamer disconnected, notify all viewers
    if (socket === streamerSocket) {
      streamerSocket = null;
      streamerClientId = null;
      connectedClients.delete("streamer");
      if (clientId) {
        connectedClients.delete(clientId);
      }
      
      connectedClients.forEach((client, id) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "stream-ended" }));
        }
      });
      console.log("Streamer disconnected, notified all viewers");
    } else {
      connectedClients.delete(clientId);
    }
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
  };

  return response;
});
