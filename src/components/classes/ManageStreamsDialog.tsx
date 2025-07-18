import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const streamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Stream name is required"),
  description: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  stream_teacher_id: z.string().optional(),
});

const formSchema = z.object({
  streams: z.array(streamSchema),
});

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface Stream {
  id: string;
  name: string;
  description: string;
  capacity: number;
  stream_teacher_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Class {
  id: string;
  name: string;
  description: string;
  created_at: string;
  student_count?: number;
}

interface ManageStreamsDialogProps {
  classItem: Class | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStreamsUpdated: () => void;
}

export function ManageStreamsDialog({ classItem, open, onOpenChange, onStreamsUpdated }: ManageStreamsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      streams: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "streams",
  });

  useEffect(() => {
    if (open && classItem) {
      fetchStreams();
      fetchTeachers();
    }
  }, [open, classItem]);

  const fetchStreams = async () => {
    if (!classItem) return;
    
    try {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          profiles:stream_teacher_id(full_name, email)
        `)
        .eq('class_id', classItem.id)
        .order('name');

      if (error) throw error;
      
      const streamsData = data || [];
      setStreams(streamsData);
      
      // Set form values
      form.reset({
        streams: streamsData.map(stream => ({
          id: stream.id,
          name: stream.name,
          description: stream.description || "",
          capacity: stream.capacity,
          stream_teacher_id: stream.stream_teacher_id || "",
        }))
      });
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch streams",
        variant: "destructive",
      });
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['admin', 'teacher'])
        .order('full_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const addNewStream = () => {
    append({
      name: "",
      description: "",
      capacity: 50,
      stream_teacher_id: "",
    });
  };

  const saveStream = async (index: number) => {
    setLoading(true);
    try {
      const streamData = form.getValues(`streams.${index}`);
      
      if (streamData.id) {
        // Update existing stream
        const { error } = await supabase
          .from('streams')
          .update({
            name: streamData.name,
            description: streamData.description || null,
            capacity: streamData.capacity,
            stream_teacher_id: streamData.stream_teacher_id || null,
          })
          .eq('id', streamData.id);

        if (error) throw error;
      } else {
        // Create new stream
        const { error } = await supabase
          .from('streams')
          .insert({
            name: streamData.name,
            description: streamData.description || null,
            capacity: streamData.capacity,
            class_id: classItem!.id,
            stream_teacher_id: streamData.stream_teacher_id || null,
          });

        if (error) throw error;
      }

      setEditingStreamId(null);
      fetchStreams();
      onStreamsUpdated();

      toast({
        title: "Success",
        description: "Stream saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save stream",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteStream = async (streamId: string, index: number) => {
    if (!confirm("Are you sure you want to delete this stream? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('streams')
        .delete()
        .eq('id', streamId);

      if (error) throw error;

      remove(index);
      fetchStreams();
      onStreamsUpdated();

      toast({
        title: "Success",
        description: "Stream deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete stream",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!classItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Streams - {classItem.name}</DialogTitle>
          <DialogDescription>
            Add, edit, or remove streams for this class.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Streams ({fields.length})</h3>
            <Button onClick={addNewStream} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Stream
            </Button>
          </div>

          <Form {...form}>
            <div className="space-y-4">
              {fields.map((field, index) => {
                const streamData = form.getValues(`streams.${index}`);
                const isEditing = editingStreamId === streamData.id || !streamData.id;
                
                return (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {streamData.name || `Stream ${index + 1}`}
                      </h4>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => saveStream(index)}
                              disabled={loading}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (streamData.id) {
                                  setEditingStreamId(null);
                                  fetchStreams(); // Reset form
                                } else {
                                  remove(index);
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingStreamId(streamData.id!)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteStream(streamData.id!, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`streams.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stream Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Stream A" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`streams.${index}.capacity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`streams.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Stream description"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`streams.${index}.stream_teacher_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stream Teacher (Optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select stream teacher" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">No teacher assigned</SelectItem>
                                  {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                      {teacher.full_name} ({teacher.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {streamData.description && <p>{streamData.description}</p>}
                        <p>Capacity: {streamData.capacity} students</p>
                        {streamData.stream_teacher_id && (
                          <p>Teacher: {streams.find(s => s.id === streamData.id)?.profiles?.full_name || 'Unknown'}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No streams found for this class.</p>
                  <Button onClick={addNewStream} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Stream
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}