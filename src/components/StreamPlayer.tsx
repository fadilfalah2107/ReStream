import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Volume2, VolumeX, Maximize, Play, Users, Clock } from "lucide-react";
import { WebRTCRealtimeStreamer } from "@/lib/webrtc-realtime";
import { useToast } from "@/hooks/use-toast";
import { useStreamPresence } from "@/hooks/useStreamPresence";
import { useStreamDuration } from "@/hooks/useStreamDuration";

const StreamPlayer = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState<string>("disconnected");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamerRef = useRef<WebRTCRealtimeStreamer | null>(null);
  const { toast } = useToast();
  const { viewerCount } = useStreamPresence(false);
  const { formattedDuration } = useStreamDuration(isLive);

  useEffect(() => {
    const streamer = new WebRTCRealtimeStreamer();
    streamerRef.current = streamer;

    streamer.onStatus((newStatus) => {
      setStatus(newStatus);
      console.log("Stream status:", newStatus);
      
      if (newStatus === "streaming") {
        setIsLive(true);
        toast({
          title: "Stream Connected",
          description: "Live stream is now playing",
        });
      } else if (newStatus === "stream-ended") {
        setIsLive(false);
        toast({
          title: "Stream Ended",
          description: "The broadcaster has ended the stream",
        });
      } else if (newStatus === "error") {
        toast({
          title: "Connection Error",
          description: "Failed to connect to stream",
          variant: "destructive",
        });
      }
    });

    streamer.onStream((stream) => {
      console.log("Stream received, attaching to video element");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          toast({
            title: "Playback Error",
            description: "Could not start video playback",
            variant: "destructive",
          });
        });
      }
    });

    // Connect to signaling channel
    streamer.connect().catch(err => {
      console.error("Connection error:", err);
      toast({
        title: "Connection Failed",
        description: "Could not connect to streaming server",
        variant: "destructive",
      });
    });

    return () => {
      streamer.disconnect();
    };
  }, [toast]);

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen().catch(err => {
        console.error("Fullscreen error:", err);
      });
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected": return "Terhubung ke server";
      case "waiting-for-stream": return "Menunggu streamer...";
      case "stream-available": return "Stream tersedia";
      case "connecting": return "Menghubungkan ke stream...";
      case "streaming": return "Live streaming";
      case "disconnected": return "Terputus";
      case "stream-ended": return "Stream berakhir";
      case "error": return "Error koneksi";
      default: return "Menghubungkan...";
    }
  };

  return (
    <div className="relative w-full aspect-video bg-card rounded-2xl overflow-hidden border border-border shadow-elevated">
      {/* Video element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted={isMuted}
      />
      
      {/* Overlay when no stream */}
      {!isLive && (
        <div className="absolute inset-0 bg-gradient-ambient flex items-center justify-center">
          <div className="text-center space-y-4 animate-ambient">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-primary animate-glow flex items-center justify-center">
              <Play className="w-12 h-12 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {getStatusText()}
            </p>
            <p className="text-sm text-muted-foreground">
              {status === "waiting-for-stream" 
                ? "Stream akan segera dimulai" 
                : "Menghubungkan ke server..."}
            </p>
          </div>
        </div>
      )}

      {/* Top overlay - Status and viewers */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLive && (
              <>
                <Badge className="bg-destructive hover:bg-destructive text-destructive-foreground px-4 py-1.5 animate-pulse">
                  <Radio className="w-3 h-3 mr-2" />
                  LIVE
                </Badge>
                <div className="flex items-center gap-2 bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4 text-foreground" />
                  <span className="font-bold text-sm">{viewerCount}</span>
                </div>
                <div className="flex items-center gap-2 bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-foreground" />
                  <span className="font-bold text-sm">{formattedDuration}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Live Stream</h2>
            <p className="text-sm text-muted-foreground">Streaming sekarang</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-md bg-card/50 border-border hover:bg-accent hover:text-accent-foreground transition-smooth"
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-md bg-card/50 border-border hover:bg-accent hover:text-accent-foreground transition-smooth"
              onClick={handleFullscreen}
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPlayer;
