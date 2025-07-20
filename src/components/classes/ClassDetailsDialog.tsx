
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Calendar, BookOpen, BarChart3 } from "lucide-react";

interface Class {
  id: string;
  name: string;
  description: string;
  created_at: string;
  student_count?: number;
  streams?: { name: string }[];
}

interface ClassDetailsDialogProps {
  classItem: Class | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassDetailsDialog({ 
  classItem, 
  open, 
  onOpenChange 
}: ClassDetailsDialogProps) {
  if (!classItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {classItem.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information about this class
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {classItem.description || "No description provided"}
            </p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{classItem.student_count || 0}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {new Date(classItem.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-semibold mb-2">Streams</h4>
            <div className="flex flex-wrap gap-2">
              {classItem.streams && classItem.streams.length > 0 ? (
                classItem.streams.map((stream, index) => (
                  <Badge key={index} variant="secondary">{stream.name}</Badge>
                ))
              ) : (
                <Badge variant="outline">No Streams Yet</Badge>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Performance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
