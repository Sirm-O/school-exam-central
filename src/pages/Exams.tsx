import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  title: string;
  exam_date: string;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  created_at: string;
  subjects: {
    name: string;
    code: string;
  };
  classes: {
    name: string;
  };
}

export default function Exams() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          subjects(name, code),
          classes(name)
        `)
        .order('exam_date', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading exams...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {profile?.role === 'student' ? 'My Exams' : 'Exams'}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'student' 
              ? 'View your upcoming and past examinations'
              : 'Manage examinations and assessments'
            }
          </p>
        </div>
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.filter(exam => new Date(exam.exam_date) > new Date()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.filter(exam => exam.is_published).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.subjects.name} ({exam.subjects.code})</TableCell>
                    <TableCell>{exam.classes.name}</TableCell>
                    <TableCell>{new Date(exam.exam_date).toLocaleDateString()}</TableCell>
                    <TableCell>{exam.duration_minutes} min</TableCell>
                    <TableCell>{exam.total_marks}</TableCell>
                    <TableCell>
                      <Badge variant={exam.is_published ? "default" : "secondary"}>
                        {exam.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No exams found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}