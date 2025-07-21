import { useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, User, Users, Phone, MapPin, Briefcase, Calendar, Hash } from "lucide-react";

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

interface StudentDetailsDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentUpdated: () => void;
}

export function StudentDetailsDialog({ 
  student, 
  open, 
  onOpenChange, 
  onStudentUpdated 
}: StudentDetailsDialogProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    toast({
      title: "Edit Student",
      description: "Edit functionality will be implemented soon",
    });
  };

  const handleDelete = async () => {
    if (!student) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      
      onStudentUpdated();
      onOpenChange(false);
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!student) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl glass border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              Student Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {student.student_name || student.student_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Student Information */}
            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Student ID</p>
                      <p className="text-lg font-mono text-primary">{student.student_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-lg">{student.student_name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Class</p>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {student.classes?.name || 'Not assigned'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Stream</p>
                      <Badge variant="outline" className="border-secondary text-secondary">
                        {student.streams?.name || 'Not assigned'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Enrollment Date</p>
                      <p className="text-lg">{new Date(student.enrollment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            {student.parent_info && (
              <Card className="glass border-primary/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Parent Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Parent Name</p>
                        <p className="text-lg">{student.parent_info.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone Number</p>
                        <p className="text-lg font-mono text-secondary">{student.parent_info.phone_number}</p>
                      </div>
                    </div>
                    {student.parent_info.occupation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Occupation</p>
                          <p className="text-lg">{student.parent_info.occupation}</p>
                        </div>
                      </div>
                    )}
                    {student.parent_info.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-lg">{student.parent_info.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="bg-primary/20" />

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button onClick={handleEdit} variant="outline" className="border-primary/20">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </div>
              <Button 
                onClick={() => setShowDeleteDialog(true)} 
                variant="destructive"
                className="bg-destructive/20 text-destructive border-destructive/20 hover:bg-destructive/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {student.student_name || student.student_id}? 
              This action cannot be undone and will remove all associated data including grades and records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}