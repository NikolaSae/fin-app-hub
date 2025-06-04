// components/blacklist/CreateBlacklistEntryDialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { createBlacklistEntry } from "@/actions/blacklist/create-blacklist-entry";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface CreateBlacklistEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateBlacklistEntryDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateBlacklistEntryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    senderName: "",
    dateApplied: new Date(),
    description: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.senderName.trim()) {
      toast.error("Sender name is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createBlacklistEntry({
        senderName: formData.senderName.trim(),
        effectiveDate: formData.dateApplied,
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });

      if (result.success) {
        toast.success(`Blacklist entry created for ${result.data?.length || 0} bulk providers`);
        setFormData({
          senderName: "",
          dateApplied: new Date(),
          description: "",
          isActive: true,
        });
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to create blacklist entry");
      }
    } catch (error) {
      console.error("Error creating blacklist entry:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      senderName: "",
      dateApplied: new Date(),
      description: "",
      isActive: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Blacklist Entry</DialogTitle>
          <DialogDescription>
            Add a new sender to the blacklist across all bulk providers. This will prevent messages from this sender on all bulk SMS services.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senderName">Sender Name *</Label>
            <Input
              id="senderName"
              placeholder="Enter sender name..."
              value={formData.senderName}
              onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date Applied</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.dateApplied, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateApplied}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, dateApplied: date }));
                      }
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive" className="text-sm">
                  {formData.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description (optional)..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Entry for All Bulk Providers
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}