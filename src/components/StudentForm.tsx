import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const studentSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  class_id: z.string().min(1, "Class is required"),
  enrollment_date: z.string().min(1, "Enrollment date is required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export function StudentForm({ onClose, onStudentAdded }: { onClose: () => void; onStudentAdded: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const onSubmit = async (data: StudentFormValues) => {
    setLoading(true);
    try {
      // First, create user profile
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: data.email,
        password: 'temppassword123', // Temporary password
        options: {
          data: {
            full_name: data.full_name,
            role: 'student'
          }
        }
      });

      if (userError) throw userError;

      // Then create student record
      const { error: studentError } = await supabase
        .from('students')
        .insert([{
          student_id: data.student_id,
          user_id: userData.user!.id,
          class_id: data.class_id,
          enrollment_date: data.enrollment_date,
        }]);

      if (studentError) throw studentError;

      toast({
        title: "Success",
        description: "Student added successfully",
      });

      onStudentAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student_id">Student ID</Label>
        <Input
          id="student_id"
          placeholder="Enter student ID"
          {...register("student_id")}
        />
        {errors.student_id && (
          <p className="text-sm text-destructive">{errors.student_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          placeholder="Enter full name"
          {...register("full_name")}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="class_id">Class</Label>
        <Select {...register("class_id")}>
          <SelectTrigger>
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.class_id && (
          <p className="text-sm text-destructive">{errors.class_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="enrollment_date">Enrollment Date</Label>
        <Input
          id="enrollment_date"
          type="date"
          {...register("enrollment_date")}
        />
        {errors.enrollment_date && (
          <p className="text-sm text-destructive">{errors.enrollment_date.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Student"}
        </Button>
      </div>
    </form>
  );
}
