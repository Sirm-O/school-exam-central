import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  FileText, 
  ClipboardCheck,
  TrendingUp,
  Calendar
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalExams: number;
  totalClasses: number;
  totalSubjects: number;
  recentExams: any[];
  upcomingExams: any[];
}

const Index = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalExams: 0,
    totalClasses: 0,
    totalSubjects: 0,
    recentExams: [],
    upcomingExams: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsRes, examsRes, classesRes, subjectsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('exams').select('*').order('created_at', { ascending: false }),
        supabase.from('classes').select('id', { count: 'exact' }),
        supabase.from('subjects').select('id', { count: 'exact' })
      ]);

      if (studentsRes.error || examsRes.error || classesRes.error || subjectsRes.error) {
        throw new Error('Failed to fetch dashboard data');
      }

      const now = new Date();
      const exams = examsRes.data || [];
      const upcomingExams = exams.filter(exam => new Date(exam.exam_date || '') > now);
      const recentExams = exams.slice(0, 5);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalExams: exams.length,
        totalClasses: classesRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        recentExams,
        upcomingExams: upcomingExams.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name}</h1>
        <p className="text-muted-foreground">
          {profile?.role === 'admin' && "Manage your school's academic operations"}
          {profile?.role === 'teacher' && "Track your exams and student performance"}
          {profile?.role === 'student' && "View your academic progress and upcoming exams"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Exams
            </CardTitle>
            <CardDescription>Latest examinations created</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentExams.length > 0 ? (
              <div className="space-y-3">
                {stats.recentExams.map((exam) => (
                  <div key={exam.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(exam.exam_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{exam.total_marks} marks</p>
                      <p className="text-xs text-muted-foreground">{exam.duration_minutes} min</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent exams</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Upcoming Exams
            </CardTitle>
            <CardDescription>Scheduled examinations</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingExams.map((exam) => (
                  <div key={exam.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(exam.exam_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{exam.total_marks} marks</p>
                      <p className="text-xs text-muted-foreground">{exam.duration_minutes} min</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming exams</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
