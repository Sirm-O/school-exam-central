import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Trophy, BookOpen, Target } from "lucide-react";

interface Student {
  id: string;
  student_id: string;
  student_name?: string;
  classes?: { name: string } | null;
  streams?: { name: string } | null;
}

interface Result {
  id: string;
  marks_obtained: number;
  grade?: string;
  remarks?: string;
  exams?: {
    title: string;
    total_marks: number;
    subject_id: string;
    subjects?: {
      name: string;
      code: string;
    };
  };
}

interface StudentPerformanceDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentPerformanceDialog({ 
  student, 
  open, 
  onOpenChange 
}: StudentPerformanceDialogProps) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && student) {
      fetchPerformance();
    }
  }, [open, student]);

  const fetchPerformance = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          exams(title, total_marks, subject_id)
        `)
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (results.length === 0) return { average: 0, totalExams: 0, passedExams: 0 };
    
    const totalMarks = results.reduce((sum, result) => sum + result.marks_obtained, 0);
    const totalPossible = results.reduce((sum, result) => sum + (result.exams?.total_marks || 100), 0);
    const average = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;
    const passedExams = results.filter(result => {
      const percentage = result.exams?.total_marks ? (result.marks_obtained / result.exams.total_marks) * 100 : 0;
      return percentage >= 50;
    }).length;
    
    return {
      average: Math.round(average),
      totalExams: results.length,
      passedExams
    };
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
      case 'A+':
        return 'bg-green-500/20 text-green-500 border-green-500/20';
      case 'B':
      case 'B+':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
      case 'C':
      case 'C+':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
      case 'D':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
      case 'F':
        return 'bg-red-500/20 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
    }
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage >= 60) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  if (!student) return null;

  const stats = calculateStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            Student Performance
          </DialogTitle>
          <DialogDescription>
            Academic performance for {student.student_name || student.student_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Overall Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.average}%</div>
                <Progress value={stats.average} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="glass border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Total Exams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalExams}</div>
                <p className="text-sm text-muted-foreground">Examinations taken</p>
              </CardContent>
            </Card>

            <Card className="glass border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Pass Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {stats.totalExams > 0 ? Math.round((stats.passedExams / stats.totalExams) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.passedExams} of {stats.totalExams} passed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results List */}
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Examination Results
              </CardTitle>
              <CardDescription>
                {results.length > 0 ? `${results.length} exam results found` : 'No exam results available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading performance data...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => {
                    const percentage = result.exams?.total_marks 
                      ? Math.round((result.marks_obtained / result.exams.total_marks) * 100)
                      : 0;
                    
                    return (
                      <div 
                        key={result.id} 
                        className="flex items-center justify-between p-4 border border-primary/10 rounded-lg glass hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getPerformanceIcon(percentage)}
                            <h4 className="font-medium">{result.exams?.title || 'Unknown Exam'}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.marks_obtained} / {result.exams?.total_marks || 'N/A'} marks
                          </p>
                          {result.remarks && (
                            <p className="text-sm text-secondary mt-1">{result.remarks}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold">{percentage}%</div>
                            <Progress value={percentage} className="w-20 mt-1" />
                          </div>
                          
                          {result.grade && (
                            <Badge className={getGradeColor(result.grade)}>
                              Grade {result.grade}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">No exam results found</p>
                  <p className="text-muted-foreground/60">Results will appear here once exams are graded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}