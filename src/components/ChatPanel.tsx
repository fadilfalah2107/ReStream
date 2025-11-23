import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  username: string;
  message: string;
  timestamp: string;
}

const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Generate or load username
    let savedUsername = localStorage.getItem("chat_username");
    if (!savedUsername) {
      savedUsername = `User${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("chat_username", savedUsername);
    }
    setUsername(savedUsername);

    // Subscribe to live chat channel (temporary, no database)
    channelRef.current = supabase
      .channel('live_chat')
      .on('broadcast', { event: 'message' }, (payload) => {
        console.log('New message received:', payload);
        setMessages((current) => [...current, payload.payload]);
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Auto scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !channelRef.current) return;

    const message: Message = {
      username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Broadcast message to all connected clients (no database storage)
    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: message
    });

    setNewMessage("");
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-2xl border border-border shadow-elevated overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-glass backdrop-blur-md">
        <h3 className="text-xl font-bold">Live Chat</h3>
        <p className="text-sm text-muted-foreground">Hanya tersimpan selama live</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Belum ada pesan. Jadilah yang pertama!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className="group hover:bg-muted/30 rounded-lg p-3 transition-smooth"
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-primary">
                    {message.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-foreground">{message.message}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 border-t border-border bg-gradient-glass backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-background/50 backdrop-blur-sm border-border focus-visible:ring-accent"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground transition-smooth shadow-glow-primary"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
