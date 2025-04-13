// components/email-processor/create-complaint-from-email.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useSession } from "next-auth/react";

interface CreateComplaintFromEmailProps {
  analysisText: string;
  emailContent: string;
  originalFileName: string;
}

type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface ComplaintFormData {
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

// Helper function moved outside component
const extractBetweenStrings = (text: string, startStr: string, endStr: string): string | null => {
  const startIndex = text.indexOf(startStr);
  if (startIndex === -1) return null;
  
  const actualStartIndex = startIndex + startStr.length;
  const endIndex = text.indexOf(endStr, actualStartIndex);
  
  return endIndex === -1 
    ? text.substring(actualStartIndex).trim()
    : text.substring(actualStartIndex, endIndex).trim();
};

export function CreateComplaintFromEmail({ 
  analysisText, 
  emailContent,
  originalFileName 
}: CreateComplaintFromEmailProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newComplaintId, setNewComplaintId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ComplaintFormData>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  useEffect(() => {
    const extractComplaintData = () => {
      try {
        let title = '';
        const titleSection = analysisText.match(/Issue:\s*(.*?)(\n|$)/i);
        if (titleSection) {
          title = titleSection[1];
        } else {
          const firstLines = analysisText.split('\n').slice(0, 3).join(' ');
          title = firstLines.split('.')[0] || '';
        }

        const customerName = extractBetweenStrings(analysisText, /(Customer Name|Name):/i, '\n') || '';
        const rawEmail = extractBetweenStrings(analysisText, /Email:/i, '\n') || '';
        const customerEmail = rawEmail.replace(/^[<\s]+|[>\s]+$/g, '');
        const customerPhone = extractBetweenStrings(analysisText, /Phone:/i, '\n') || '';

        const lowerCaseAnalysis = analysisText.toLowerCase();
        let priority: ComplaintPriority = 'MEDIUM';
        if (lowerCaseAnalysis.includes('urgent') || lowerCaseAnalysis.includes('critical')) {
          priority = 'URGENT';
        } else if (lowerCaseAnalysis.includes('high priority')) {
          priority = 'HIGH';
        } else if (lowerCaseAnalysis.includes('low priority')) {
          priority = 'LOW';
        }

        setFormData(prev => ({
          ...prev,
          title: title.trim(),
          description: analysisText.trim(),
          priority,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim()
        }));
      } catch (error) {
        console.error("Error extracting information:", error);
        toast.error("Greška pri obradi analize");
      }
    };

    extractComplaintData();
  }, [analysisText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof ComplaintFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error("Morate biti prijavljeni");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          ...formData,
          emailContent,
          originalFileName,
          assignedToId: session.user.id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Došlo je do greške');
      }
      
      const data = await response.json();
      setSuccess(true);
      setNewComplaintId(data.id);
      toast.success("Reklamacija uspešno kreirana");
    } catch (error) {
      console.error("Submission error:", error);
      setError(error instanceof Error ? error.message : 'Nepoznata greška');
      toast.error("Greška pri kreiranju reklamacije");
    } finally {
      setIsLoading(false);
    }
  };

  if (success && newComplaintId) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Uspešno kreirano</AlertTitle>
        <AlertDescription>
          Reklamacija ID: {newComplaintId}
          <div className="mt-4">
            <Button 
              onClick={() => window.location.href = `/complaints/${newComplaintId}`} 
              variant="outline"
              size="sm"
            >
              Pregled reklamacije
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Greška</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Opis</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={6}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioritet</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Izaberite prioritet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Nizak</SelectItem>
              <SelectItem value="MEDIUM">Srednji</SelectItem>
              <SelectItem value="HIGH">Visok</SelectItem>
              <SelectItem value="URGENT">Hitan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="pt-2 border-t">
        <h4 className="text-sm font-medium mb-2">Customer Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Telefon</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Complaint
            </>
          )}
        </Button>
      </div>
    </form>
  );
}