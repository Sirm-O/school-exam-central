import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Users, Search, MoreVertical, Eye, TrendingUp, BookOpen, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentForm } from "@/components/StudentForm";
import { StudentDetailsDialog } from "@/components/students/StudentDetailsDialog";
import { StudentPerformanceDialog } from "@/components/students/StudentPerformanceDialog";
import { AddMarksDialog } from "@/components/students/AddMarksDialog";
import { AssignSubjectsDialog } from "@/components/students/AssignSubjectsDialog";

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
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [showAddMarksDialog, setShowAddMarksDialog] = useState(false);
  const [showAssignSubjectsDialog, setShowAssignSubjectsDialog] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students...');
      
      // First, fetch students data
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) {
        console.error('Students fetch error:', studentsError);
        throw studentsError;
      }

      // Fetch related data separately
      const [classesData, streamsData, parentData] = await Promise.all([
        supabase.from('classes').select('id, name'),
        supabase.from('streams').select('id, name'),
        supabase.from('parent_info').select('id, name, phone_number, address, occupation')
      ]);

      // Combine the data
      const enrichedStudents = studentsData.map(student => ({
        ...student,
        classes: classesData.data?.find(c => c.id === student.class_id) || null,
        streams: streamsData.data?.find(s => s.id === student.stream_id) || null,
        parent_info: parentData.data?.find(p => p.id === student.parent_id) || null
      }));
      
      console.log('Students data enriched:', enrichedStudents);
      setStudents(enrichedStudents);
      setFilteredStudents(enrichedStudents);
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch students",
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student => 
      student.student_id.toLowerCase().includes(term.toLowerCase()) ||
      (student.student_name && student.student_name.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredStudents(filtered);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
  };

  const handleViewPerformance = (student: Student) => {
    setSelectedStudent(student);
    setShowPerformanceDialog(true);
  };

  const handleAddMarks = (student: Student) => {
    setSelectedStudent(student);
    setShowAddMarksDialog(true);
  };

  const handleAssignSubjects = (student: Student) => {
    setSelectedStudent(student);
    setShowAssignSubjectsDialog(true);
  };

  const handleDialogClose = () => {
    setSelectedStudent(null);
    setShowDetailsDialog(false);
    setShowPerformanceDialog(false);
    setShowAddMarksDialog(false);
    setShowAssignSubjectsDialog(false);
  };

  const handleDataUpdate = () => {
    fetchStudents();
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
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                All Students
              </CardTitle>
              <CardDescription>
                Total: {filteredStudents.length} students {searchTerm && `(filtered from ${students.length})`}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student ID or name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 glass border-primary/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length > 0 ? (
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
                  <TableHead className="text-primary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-primary/20">
                          <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewPerformance(student)}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Performance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddMarks(student)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Marks
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignSubjects(student)}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Assign Subjects
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchTerm ? "No students found matching your search" : "No students found"}
              </p>
              <p className="text-muted-foreground/60">
                {searchTerm ? "Try adjusting your search terms" : "Add your first student to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Components */}
      <StudentDetailsDialog
        student={selectedStudent}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onStudentUpdated={handleDataUpdate}
      />
      
      <StudentPerformanceDialog
        student={selectedStudent}
        open={showPerformanceDialog}
        onOpenChange={setShowPerformanceDialog}
      />
      
      <AddMarksDialog
        student={selectedStudent}
        open={showAddMarksDialog}
        onOpenChange={setShowAddMarksDialog}
        onMarksAdded={handleDataUpdate}
      />
      
      <AssignSubjectsDialog
        student={selectedStudent}
        open={showAssignSubjectsDialog}
        onOpenChange={setShowAssignSubjectsDialog}
        onSubjectsAssigned={handleDataUpdate}
      />
    </div>
  );
}