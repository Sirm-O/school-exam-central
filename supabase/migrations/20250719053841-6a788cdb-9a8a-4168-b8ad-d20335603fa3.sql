-- Create enhanced student and parent information tables
-- First, create parent information table
CREATE TABLE public.parent_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  address TEXT,
  occupation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on parent_info table
ALTER TABLE public.parent_info ENABLE ROW LEVEL SECURITY;

-- Create policies for parent_info
CREATE POLICY "Admins can manage parent info" 
ON public.parent_info 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "All can view parent info" 
ON public.parent_info 
FOR SELECT 
USING (true);

-- Add new columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS stream_id UUID,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.parent_info(id);

-- Create function to auto-generate student IDs
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.student_id IS NULL OR NEW.student_id = '' THEN
    NEW.student_id := 'STU' || LPAD((
      SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM 4) AS INTEGER)), 0) + 1
      FROM students 
      WHERE student_id ~ '^STU[0-9]+$'
    )::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating student IDs
DROP TRIGGER IF EXISTS trigger_generate_student_id ON public.students;
CREATE TRIGGER trigger_generate_student_id
  BEFORE INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION generate_student_id();

-- Create updated_at trigger for parent_info
CREATE TRIGGER update_parent_info_updated_at
  BEFORE UPDATE ON public.parent_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();