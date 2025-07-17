
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Printer, 
  BarChart3,
  Plus
} from "lucide-react";

interface Class {
  id: string;
  name: string;
  description: string;
  created_at: string;
  student_count?: number;
}

interface ClassActionsMenuProps {
  classItem: Class;
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
  onViewDetails: (classItem: Class) => void;
  onManageStreams: (classItem: Class) => void;
  onPrintStreamList: (classItem: Class) => void;
  onViewPerformance: (classItem: Class) => void;
}

export function ClassActionsMenu({
  classItem,
  onEdit,
  onDelete,
  onViewDetails,
  onManageStreams,
  onPrintStreamList,
  onViewPerformance,
}: ClassActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onViewDetails(classItem)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onEdit(classItem)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Class
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onManageStreams(classItem)}>
          <Plus className="mr-2 h-4 w-4" />
          Manage Streams
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onViewPerformance(classItem)}>
          <BarChart3 className="mr-2 h-4 w-4" />
          View Performance
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onPrintStreamList(classItem)}>
          <Printer className="mr-2 h-4 w-4" />
          Print Stream List
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onDelete(classItem)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Class
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
