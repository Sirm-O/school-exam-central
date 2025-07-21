-- Add foreign key constraints to students table
ALTER TABLE public.students 
ADD CONSTRAINT students_class_id_fkey 
FOREIGN KEY (class_id) REFERENCES public.classes(id);

ALTER TABLE public.students 
ADD CONSTRAINT students_stream_id_fkey 
FOREIGN KEY (stream_id) REFERENCES public.streams(id);

ALTER TABLE public.students 
ADD CONSTRAINT students_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES public.parent_info(id);

-- Add foreign key constraint to streams table for class_id
ALTER TABLE public.streams 
ADD CONSTRAINT streams_class_id_fkey 
FOREIGN KEY (class_id) REFERENCES public.classes(id);