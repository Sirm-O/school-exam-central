import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Class {
  id: string;
  name: string;
  description: string;
  created_at: string;
  student_count?: number;
}

export default function Classes() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          students(count)
        `)
        .order('name');

      if (error) throw error;
      
      const classesWithCount = data?.map(cls => ({
        ...cls,
        student_count: cls.students?.[0]?.count || 0
      })) || [];
      
      setClasses(classesWithCount);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading classes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">Manage academic classes and grade levels</p>
        </div>
        {profile?.role === 'admin' && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            All Classes
          </CardTitle>
          <CardDescription>
            Total: {classes.length} classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.description || 'No description'}</TableCell>
                    <TableCell>{cls.student_count} students</TableCell>
                    <TableCell>{new Date(cls.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No classes found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}