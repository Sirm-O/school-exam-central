import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentForm } from "@/components/StudentForm";

interface Student {
  id: string;
  student_id: string;
  student_name?: string;
  enrollment_date: string;
  user_id: string;
  class_id: string;
  stream_id?: string;
  parent_id?: string;
  classes?: { name: string } | null;
  streams?: { name: string } | null;
  parent_info?: {
    name: string;
    phone_number: string;
    address?: string;
    occupation?: string;
  } | null;
}

export default function Students() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes!inner(name),
          streams(name),
          parent_info(name, phone_number, address, occupation)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents((data as any[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAdded = () => {
    fetchStudents();
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center">Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Students Management
          </h1>
          <p className="text-muted-foreground">Manage student records and parent information</p>
        </div>
        {(profile?.role === 'admin') && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-4">
          <StudentForm onClose={() => setShowForm(false)} onStudentAdded={handleStudentAdded} />
        </div>
      )}

      <Card className="glass border-primary/20 shadow-ambient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            All Students
          </CardTitle>
          <CardDescription>
            Total: {students.length} students registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  <TableHead className="text-primary">Student ID</TableHead>
                  <TableHead className="text-primary">Name</TableHead>
                  <TableHead className="text-primary">Class</TableHead>
                  <TableHead className="text-primary">Stream</TableHead>
                  <TableHead className="text-primary">Parent Name</TableHead>
                  <TableHead className="text-primary">Parent Phone</TableHead>
                  <TableHead className="text-primary">Enrollment Date</TableHead>
                  <TableHead className="text-primary">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="border-primary/10 hover:bg-primary/5">
                    <TableCell className="font-medium text-primary-light">
                      {student.student_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.student_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.classes?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.streams?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.parent_info?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-secondary">
                      {student.parent_info?.phone_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(student.enrollment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-success/20 text-success border-success/20">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No students found</p>
              <p className="text-muted-foreground/60">Add your first student to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}