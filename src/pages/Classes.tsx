
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddClassDialog } from "@/components/classes/AddClassDialog";
import { ClassActionsMenu } from "@/components/classes/ClassActionsMenu";
import { EditClassDialog } from "@/components/classes/EditClassDialog";
import { ClassDetailsDialog } from "@/components/classes/ClassDetailsDialog";

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
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    setEditDialogOpen(true);
  };

  const handleDelete = async (classItem: Class) => {
    if (!confirm(`Are you sure you want to delete "${classItem.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class deleted successfully",
      });

      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (classItem: Class) => {
    setSelectedClass(classItem);
    setDetailsDialogOpen(true);
  };

  const handleManageStreams = (classItem: Class) => {
    toast({
      title: "Coming Soon",
      description: "Stream management functionality will be available soon",
    });
  };

  const handlePrintStreamList = (classItem: Class) => {
    toast({
      title: "Coming Soon",
      description: "Print functionality will be available soon",
    });
  };

  const handleViewPerformance = (classItem: Class) => {
    toast({
      title: "Coming Soon",
      description: "Performance analytics will be available soon",
    });
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
          <AddClassDialog onClassAdded={fetchClasses} />
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
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.description || 'No description'}</TableCell>
                    <TableCell>{cls.student_count} students</TableCell>
                    <TableCell>{new Date(cls.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <ClassActionsMenu
                        classItem={cls}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                        onManageStreams={handleManageStreams}
                        onPrintStreamList={handlePrintStreamList}
                        onViewPerformance={handleViewPerformance}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No classes found</p>
              {profile?.role === 'admin' && (
                <div className="mt-4">
                  <AddClassDialog onClassAdded={fetchClasses} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EditClassDialog
        classItem={selectedClass}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onClassUpdated={fetchClasses}
      />

      <ClassDetailsDialog
        classItem={selectedClass}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}
