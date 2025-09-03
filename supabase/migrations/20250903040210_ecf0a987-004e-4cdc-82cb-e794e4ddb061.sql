-- Create user_follows table for follow functionality
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for user follows
CREATE POLICY "Users can follow others" 
ON public.user_follows 
FOR INSERT 
WITH CHECK (
  auth.uid() = follower_id AND 
  follower_id <> following_id AND
  -- Only allow following vendors and dispatchers, not regular users
  EXISTS (
    SELECT 1 FROM user_types ut
    WHERE ut.user_id = following_id 
    AND ut.user_type IN ('vendor', 'dispatch')
    AND ut.is_active = true
  )
);

CREATE POLICY "Users can unfollow others" 
ON public.user_follows 
FOR DELETE 
USING (auth.uid() = follower_id);

CREATE POLICY "Users can view all follows" 
ON public.user_follows 
FOR SELECT 
USING (true);

-- Add index for performance
CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);