import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ViewerPresence {
  user_id: string;
  username: string;
  joined_at: string;
}

export const useStreamPresence = (isStreamer: boolean = false) => {
  const [viewerCount, setViewerCount] = useState(0);
  const [viewers, setViewers] = useState<ViewerPresence[]>([]);
  const channelRef = useState<any>(null)[0];

  useEffect(() => {
    // Generate or get username
    let username = localStorage.getItem("chat_username");
    if (!username) {
      username = `User${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("chat_username", username);
    }

    const channel = supabase.channel('stream_presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const allViewers: ViewerPresence[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (!presence.is_streamer) {
              allViewers.push(presence);
            }
          });
        });
        
        setViewers(allViewers);
        setViewerCount(allViewers.length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: crypto.randomUUID(),
            username,
            joined_at: new Date().toISOString(),
            is_streamer: isStreamer
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [isStreamer]);

  return { viewerCount, viewers };
};
