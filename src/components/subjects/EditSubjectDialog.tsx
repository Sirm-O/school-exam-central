import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
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

const formSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  description: z.string().optional(),
});

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface EditSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  onSubjectUpdated: () => void;
}

export function EditSubjectDialog({
  open,
  onOpenChange,
  subject,
  onSubjectUpdated,
}: EditSubjectDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name,
        code: subject.code,
        description: subject.description || "",
      });
    }
  }, [subject, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!subject) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('subjects')
        .update(values)
        .eq('id', subject.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject updated successfully",
      });

      onSubjectUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/20 shadow-ambient sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Subject</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-light">Subject Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Mathematics" 
                      {...field}
                      className="glass border-primary/30 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-light">Subject Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., MATH101" 
                      {...field}
                      className="glass border-primary/30 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-light">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the subject"
                      {...field}
                      className="glass border-primary/30 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-primary hover:opacity-90 shadow-glow"
              >
                {loading ? "Updating..." : "Update Subject"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}