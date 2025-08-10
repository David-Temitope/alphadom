-- Add is_banned column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false;