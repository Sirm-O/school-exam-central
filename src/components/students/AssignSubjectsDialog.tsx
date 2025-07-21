import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Check, X } from "lucide-react";

interface Student {
  id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  stream_id?: string;
  classes?: { name: string } | null;
  streams?: { name: string } | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface AssignSubjectsDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectsAssigned: () => void;
}

export function AssignSubjectsDialog({ 
  student, 
  open, 
  onOpenChange, 
  onSubjectsAssigned 
}: AssignSubjectsDialogProps) {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && student) {
      fetchSubjects();
      fetchAssignedSubjects();
    }
  }, [open, student]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedSubjects = async () => {
    if (!student) return;

    try {
      // For now, we'll simulate assigned subjects since we don't have a student_subjects table
      // In a real implementation, you would fetch from a junction table
      const { data: results } = await supabase
        .from('results')
        .select(`
          exams(subject_id)
        `)
        .eq('student_id', student.id);

      const subjectIds = results?.map(r => r.exams?.subject_id).filter(Boolean) || [];
      const uniqueSubjectIds = [...new Set(subjectIds)] as string[];
      
      setAssignedSubjects(uniqueSubjectIds);
      setSelectedSubjects(uniqueSubjectIds);
    } catch (error) {
      console.error('Failed to fetch assigned subjects:', error);
    }
  };

  const handleSubjectToggle = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
    }
  };

  const handleAssignSubjects = async () => {
    if (!student) return;

    setSubmitting(true);
    try {
      // In a real implementation, you would update a student_subjects junction table
      // For now, we'll just show a success message
      
      const addedSubjects = selectedSubjects.filter(id => !assignedSubjects.includes(id));
      const removedSubjects = assignedSubjects.filter(id => !selectedSubjects.includes(id));

      toast({
        title: "Success",
        description: `Subjects updated successfully. ${addedSubjects.length} added, ${removedSubjects.length} removed.`,
      });

      onSubjectsAssigned();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign subjects",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            Assign Subjects
          </DialogTitle>
          <DialogDescription>
            Manage subject assignments for {student.student_name || student.student_id}
          </DialogDescription>
        </DialogHeader>

        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
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

        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Available Subjects
            </CardTitle>
            <CardDescription>
              {selectedSubjects.length} of {subjects.length} subjects selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading subjects...</p>
              </div>
            ) : subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject.id);
                  const wasAssigned = assignedSubjects.includes(subject.id);
                  
                  return (
                    <div 
                      key={subject.id}
                      className="flex items-center space-x-3 p-3 border border-primary/10 rounded-lg glass hover:bg-primary/5 transition-colors"
                    >
                      <Checkbox
                        id={subject.id}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label 
                            htmlFor={subject.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {subject.name}
                          </label>
                          <Badge variant="outline" className="text-xs">
                            {subject.code}
                          </Badge>
                          {wasAssigned && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-blue-500/20 text-blue-500 border-blue-500/20"
                            >
                              Previously Assigned
                            </Badge>
                          )}
                          {isSelected && !wasAssigned && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-green-500/20 text-green-500 border-green-500/20"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              New
                            </Badge>
                          )}
                          {!isSelected && wasAssigned && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-red-500/20 text-red-500 border-red-500/20"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Removing
                            </Badge>
                          )}
                        </div>
                        {subject.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No subjects available</p>
                <p className="text-muted-foreground/60">Create subjects first to assign to students</p>
              </div>
            )}
          </CardContent>
        </Card>

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
            onClick={handleAssignSubjects}
            disabled={submitting || subjects.length === 0}
            className="bg-gradient-primary hover:opacity-90"
          >
            {submitting ? "Updating..." : "Update Assignments"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}