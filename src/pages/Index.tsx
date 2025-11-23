import StreamPlayer from "@/components/StreamPlayer";
import ChatPanel from "@/components/ChatPanel";
import StreamInfo from "@/components/StreamInfo";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-ambient" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-ambient" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary animate-glow" />
            <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-gradient">
                  StreamVerse
                </h1>
                <p className="text-sm text-muted-foreground">Live Streaming Platform</p>
              </div>
            </div>
            <Link to="/streamer">
              <Button 
                variant="outline"
                className="backdrop-blur-md bg-card/50 border-border hover:bg-gradient-primary hover:text-primary-foreground transition-smooth"
              >
                <Video className="w-4 h-4 mr-2" />
                Streamer Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <StreamInfo />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video player - takes 2 columns */}
          <div className="lg:col-span-2">
            <StreamPlayer />
          </div>

          {/* Chat panel - takes 1 column */}
          <div className="lg:col-span-1 h-[600px]">
            <ChatPanel />
          </div>
        </div>

        {/* Additional info section */}
        <div className="mt-8 p-8 bg-card rounded-2xl border border-border shadow-elevated">
          <h2 className="text-2xl font-bold mb-4">Tentang Stream Ini</h2>
          <p className="text-muted-foreground leading-relaxed">
            Selamat datang di live stream kami! Platform ini memungkinkan Anda untuk menonton
            streaming langsung dengan kualitas tinggi tanpa delay. Bergabunglah dengan ribuan
            penonton lainnya dan nikmati pengalaman streaming yang immersive.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p>© 2024 StreamVerse. Platform streaming live terbaik.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
