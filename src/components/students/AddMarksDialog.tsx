import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BookOpen, Target } from "lucide-react";

interface Student {
  id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  stream_id?: string;
  classes?: { name: string } | null;
  streams?: { name: string } | null;
}

interface Exam {
  id: string;
  title: string;
  total_marks: number;
  exam_date: string;
  subjects?: {
    name: string;
    code: string;
  };
}

interface AddMarksDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarksAdded: () => void;
}

const formSchema = z.object({
  exam_id: z.string().min(1, "Please select an exam"),
  marks_obtained: z.coerce.number().min(0, "Marks cannot be negative"),
  grade: z.string().optional(),
  remarks: z.string().optional(),
});

export function AddMarksDialog({ 
  student, 
  open, 
  onOpenChange, 
  onMarksAdded 
}: AddMarksDialogProps) {
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam_id: "",
      marks_obtained: 0,
      grade: "",
      remarks: "",
    },
  });

  useEffect(() => {
    if (open && student) {
      fetchExams();
    }
  }, [open, student]);

  const fetchExams = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      // Fetch published exams for the student's class
      const { data, error } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          total_marks,
          exam_date,
          subjects(name, code)
        `)
        .eq('class_id', student.class_id)
        .eq('is_published', true)
        .order('exam_date', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast({
        title: "Error",
        description: "Failed to load available exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (marks: number, totalMarks: number): string => {
    const percentage = (marks / totalMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!student) return;

    setSubmitting(true);
    try {
      // Find the selected exam to get total marks
      const selectedExam = exams.find(exam => exam.id === values.exam_id);
      if (!selectedExam) throw new Error("Selected exam not found");

      // Auto-calculate grade if not provided
      const grade = values.grade || calculateGrade(values.marks_obtained, selectedExam.total_marks);

      // Check if result already exists
      const { data: existingResult } = await supabase
        .from('results')
        .select('id')
        .eq('student_id', student.id)
        .eq('exam_id', values.exam_id)
        .single();

      if (existingResult) {
        // Update existing result
        const { error } = await supabase
          .from('results')
          .update({
            marks_obtained: values.marks_obtained,
            grade,
            remarks: values.remarks || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingResult.id);

        if (error) throw error;
      } else {
        // Insert new result
        const { error } = await supabase
          .from('results')
          .insert({
            student_id: student.id,
            exam_id: values.exam_id,
            marks_obtained: values.marks_obtained,
            grade,
            remarks: values.remarks || null,
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Marks added successfully",
      });

      form.reset();
      onMarksAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add marks",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <PlusCircle className="h-5 w-5" />
            Add Marks
          </DialogTitle>
          <DialogDescription>
            Add examination marks for {student.student_name || student.student_id}
          </DialogDescription>
        </DialogHeader>

        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-4 w-4" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Student ID:</span> {student.student_id}
              </div>
              <div>
                <span className="font-medium">Name:</span> {student.student_name || 'Not provided'}
              </div>
              <div>
                <span className="font-medium">Class:</span> {student.classes?.name || 'Not assigned'}
              </div>
              <div>
                <span className="font-medium">Stream:</span> {student.streams?.name || 'Not assigned'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="exam_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Select Exam
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass border-primary/20">
                        <SelectValue placeholder="Choose an exam" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass border-primary/20">
                      {loading ? (
                        <SelectItem value="loading" disabled>Loading exams...</SelectItem>
                      ) : exams.length > 0 ? (
                        exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            <div className="flex flex-col">
                              <span>{exam.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {exam.subjects?.name} • {exam.total_marks} marks • {new Date(exam.exam_date).toLocaleDateString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No published exams available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marks_obtained"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks Obtained</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter marks"
                        className="glass border-primary/20"
                        {...field}
                        max={exams.find(exam => exam.id === form.watch('exam_id'))?.total_marks || 100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Auto-calculated if empty"
                        className="glass border-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional comments about performance"
                      className="glass border-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-primary/20"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || exams.length === 0}
                className="bg-gradient-primary hover:opacity-90"
              >
                {submitting ? "Adding..." : "Add Marks"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}