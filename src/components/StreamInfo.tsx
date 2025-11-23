import { Card } from "@/components/ui/card";
import { Radio, Clock, Signal } from "lucide-react";

const StreamInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-card border-border hover:border-primary transition-smooth group">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-primary shadow-glow-primary group-hover:scale-110 transition-bounce">
            <Radio className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-2xl font-bold">Live Now</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border hover:border-secondary transition-smooth group">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary shadow-glow-secondary group-hover:scale-110 transition-bounce">
            <Clock className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Durasi</p>
            <p className="text-2xl font-bold">2:34:12</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border hover:border-accent transition-smooth group">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent shadow-glow-secondary group-hover:scale-110 transition-bounce">
            <Signal className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kualitas</p>
            <p className="text-2xl font-bold">1080p</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StreamInfo;
