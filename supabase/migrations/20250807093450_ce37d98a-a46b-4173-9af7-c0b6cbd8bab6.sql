-- Create product comments table
CREATE TABLE public.product_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Comments are viewable by everyone" 
ON public.product_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.product_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.product_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.product_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create comment likes table
CREATE TABLE public.comment_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_like boolean NOT NULL, -- true for like, false for dislike
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS for comment likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for comment likes
CREATE POLICY "Comment likes are viewable by everyone"
ON public.comment_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like/dislike comments"
ON public.comment_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own likes"
ON public.comment_likes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.comment_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;