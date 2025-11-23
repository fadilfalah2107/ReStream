-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read messages
CREATE POLICY "Anyone can read chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert messages (for demo purposes)
CREATE POLICY "Anyone can send chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;