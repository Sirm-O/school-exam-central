import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, BookOpen, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddSubjectDialog } from "@/components/subjects/AddSubjectDialog";
import { EditSubjectDialog } from "@/components/subjects/EditSubjectDialog";
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

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  created_at: string;
}

export default function Subjects() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowEditDialog(true);
  };

  const handleDelete = (subject: Subject) => {
    setSubjectToDelete(subject);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });

      fetchSubjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSubjectToDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center">Loading subjects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Subjects Management
          </h1>
          <p className="text-muted-foreground">Manage academic subjects and curriculum</p>
        </div>
        {profile?.role === 'admin' && (
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        )}
      </div>

      <Card className="glass border-primary/20 shadow-ambient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            All Subjects
          </CardTitle>
          <CardDescription>
            Total: {subjects.length} subjects registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  <TableHead className="text-primary">Subject Code</TableHead>
                  <TableHead className="text-primary">Subject Name</TableHead>
                  <TableHead className="text-primary">Description</TableHead>
                  <TableHead className="text-primary">Created</TableHead>
                  {profile?.role === 'admin' && (
                    <TableHead className="text-primary">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id} className="border-primary/10 hover:bg-primary/5">
                    <TableCell className="font-medium text-primary-light">
                      {subject.code}
                    </TableCell>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.description || 'No description'}</TableCell>
                    <TableCell>{new Date(subject.created_at).toLocaleDateString()}</TableCell>
                    {profile?.role === 'admin' && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subject)}
                            className="hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subject)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No subjects found</p>
              <p className="text-muted-foreground/60">Add your first subject to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddSubjectDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubjectAdded={fetchSubjects}
      />

      <EditSubjectDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        subject={selectedSubject}
        onSubjectUpdated={fetchSubjects}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass border-primary/20 shadow-ambient">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subjectToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary/30 text-primary hover:bg-primary/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}