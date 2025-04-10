// components/complaints/comment-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CommentFormSchema, CommentFormValues } from "@/schemas";
import { addComment } from "@/actions/complaints";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";

interface CommentFormProps {
  complaintId: string;
}

export function CommentForm({ complaintId }: CommentFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: CommentFormValues) => {
    setIsPending(true);

    try {
      const response = await addComment(complaintId, values);

      if (response.error) {
        toast.error(response.error);
      }

      if (response.success) {
        toast.success(response.success);
        form.reset();
      }
    } catch (err) {
      toast.error("Došlo je do greške prilikom dodavanja komentara.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-start gap-2">
                  <Textarea 
                    {...field} 
                    placeholder="Dodajte komentar..."
                    className="flex-1"
                    rows={2}
                    disabled={isPending}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="mt-1"
                    disabled={isPending}
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}