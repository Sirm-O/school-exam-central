-- Add principal and class teacher fields to classes table
ALTER TABLE public.classes 
ADD COLUMN principal_id uuid REFERENCES public.profiles(id),
ADD COLUMN class_teacher_id uuid REFERENCES public.profiles(id);

-- Create streams table
CREATE TABLE public.streams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  stream_teacher_id uuid REFERENCES public.profiles(id),
  capacity integer DEFAULT 50,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on streams table
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for streams
CREATE POLICY "All can view streams" 
ON public.streams 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage streams" 
ON public.streams 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create trigger for automatic timestamp updates on streams
CREATE TRIGGER update_streams_updated_at
BEFORE UPDATE ON public.streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();