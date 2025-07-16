import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ClipboardCheck, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Result {
  id: string;
  marks_obtained: number;
  grade: string;
  remarks: string;
  exam_id: string;
  student_id: string;
}

export default function Results() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      let query = supabase
        .from('results')
        .select('*')
        .order('created_at', { ascending: false });

      // If student, only show their results
      if (profile?.role === 'student') {
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', profile.user_id)
          .single();
        
        if (studentData) {
          query = query.eq('student_id', studentData.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculatePercentage = (obtained: number, total: number) => {
    return ((obtained / total) * 100).toFixed(1);
  };

  if (loading) {
    return <div className="text-center">Loading results...</div>;
  }

  const averagePercentage = results.length > 0 ? 85.5 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {profile?.role === 'student' ? 'My Results' : 'Results'}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'student' 
              ? 'View your examination results and grades'
              : 'Manage student results and grades'
            }
          </p>
        </div>
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Enter Results
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
A
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Examination Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  {profile?.role !== 'student' && <TableHead>Student</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">Math Exam</TableCell>
                    <TableCell>Mathematics</TableCell>
                    {profile?.role !== 'student' && (
                      <TableCell>Student Name</TableCell>
                    )}
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell>
                      {result.marks_obtained}/100
                    </TableCell>
                    <TableCell>
                      {((result.marks_obtained / 100) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Badge className={getGradeColor(result.grade)}>
                        {result.grade || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{result.remarks || 'No remarks'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}