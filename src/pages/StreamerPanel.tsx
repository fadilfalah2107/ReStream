import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Radio, Copy, ExternalLink, Users, Clock } from "lucide-react";
import { useStreamPresence } from "@/hooks/useStreamPresence";
import { useStreamDuration } from "@/hooks/useStreamDuration";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WebRTCRealtimeBroadcaster } from "@/lib/webrtc-realtime-broadcaster";

const StreamerPanel = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [quality, setQuality] = useState("high");
  const broadcasterRef = useRef<WebRTCRealtimeBroadcaster | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { viewerCount } = useStreamPresence(true);
  const { formattedDuration } = useStreamDuration(isStreaming);
  const viewerUrl = `${window.location.origin}/`;

  const getQualityConstraints = (quality: string) => {
    switch (quality) {
      case "high":
        return { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } };
      case "medium":
        return { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
      case "low":
        return { width: { ideal: 854 }, height: { ideal: 480 }, frameRate: { ideal: 24 } };
      default:
        return { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
    }
  };

  const startStream = async () => {
    try {
      // Get user media
      let stream: MediaStream;
      
      try {
        const videoConstraints = getQualityConstraints(quality);
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (error) {
        console.log("Selected quality failed, trying basic constraints:", error);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize broadcaster and start broadcasting
      const broadcaster = new WebRTCRealtimeBroadcaster();
      broadcasterRef.current = broadcaster;
      
      await broadcaster.startBroadcast(stream);
      setIsStreaming(true);
      
      toast({
        title: "Streaming Started",
        description: "You are now live!",
      });

    } catch (error) {
      console.error("Error starting stream:", error);
      
      let errorMessage = "Could not access camera/microphone";
      let errorDescription = "Please check your browser permissions";
      
      if (error instanceof Error) {
        if (error.name === "NotFoundError") {
          errorDescription = "No camera or microphone found. Please connect a device and try again.";
        } else if (error.name === "NotAllowedError") {
          errorDescription = "Camera/microphone access was denied. Please allow access in your browser settings.";
        } else if (error.name === "NotReadableError") {
          errorDescription = "Camera/microphone is already in use by another application.";
        }
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
      });
    }
  };

  const stopStream = () => {
    // Stop all tracks
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    // Stop broadcaster
    if (broadcasterRef.current) {
      broadcasterRef.current.stopBroadcast();
      broadcasterRef.current = null;
    }

    setIsStreaming(false);

    toast({
      title: "Stream Ended",
      description: "Your stream has been stopped",
    });
  };

  const copyViewerLink = () => {
    navigator.clipboard.writeText(viewerUrl);
    toast({
      title: "Link Disalin!",
      description: "Link viewer telah disalin ke clipboard",
    });
  };

  const openViewerInNewTab = () => {
    window.open(viewerUrl, '_blank');
  };

  useEffect(() => {
    return () => {
      if (isStreaming) {
        stopStream();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Streamer Panel</h1>
          <p className="text-muted-foreground">Manage your live stream from here</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stream Preview */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Stream Preview</h2>
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
                    <div className="text-center">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-semibold">Camera Off</p>
                      <p className="text-sm text-muted-foreground">Start streaming to preview</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Stream Control</h3>
              
              {!isStreaming && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Video Quality</label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (1080p)</SelectItem>
                      <SelectItem value="medium">Medium (720p)</SelectItem>
                      <SelectItem value="low">Low (480p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {isStreaming && (
                <div className="mb-6 p-4 bg-primary/10 rounded-lg space-y-3 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <p className="font-semibold text-sm">Stream Aktif</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{viewerCount} viewers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formattedDuration}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Link untuk menonton:</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={viewerUrl} 
                        readOnly 
                        className="flex-1 px-3 py-2 text-sm bg-background border rounded-md font-mono"
                      />
                      <Button size="sm" variant="outline" onClick={copyViewerLink} title="Copy link">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={openViewerInNewTab} title="Buka di tab baru">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Buka link ini di tab/browser lain untuk menonton stream Anda
                    </p>
                  </div>
                </div>
              )}
              
              {!isStreaming ? (
                <Button 
                  onClick={startStream}
                  className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground"
                  size="lg"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Start Streaming
                </Button>
              ) : (
                <Button 
                  onClick={stopStream}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <Radio className="w-5 h-5 mr-2 animate-pulse" />
                  Stop Stream
                </Button>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Stream Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-bold ${isStreaming ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {isStreaming ? 'LIVE' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Viewers</span>
                  <span className="font-bold">{viewerCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-bold">{formattedDuration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Quality</span>
                  <span className="font-bold capitalize">{quality}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-glass border-border">
              <h3 className="text-lg font-bold mb-2">Tip</h3>
              <p className="text-sm text-muted-foreground">
                Make sure your camera and microphone permissions are enabled in your browser settings.
              </p>
            </Card>
          </div>
        </div>

        {/* Info */}
        <Card className="mt-6 p-6">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">
              Sistem streaming ini menggunakan WebRTC dan Supabase Realtime untuk koneksi peer-to-peer yang cepat dan efisien.
              Chat dan viewer tracking juga bekerja secara real-time tanpa menyimpan data permanen.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StreamerPanel;
