// components/email-processor/email-processor.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, XCircle, Loader2, Save, FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateComplaintFromEmail } from "./create-complaint-from-email";

interface ProcessedResult {
  status: 'success' | 'error';
  message: string;
  response?: string;
  fileName?: string;
  originalFileName?: string;
  filePath?: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
}

const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'default',
    name: 'Default Analysis',
    prompt: 'Analyze this email conversation and provide a summary of key points and any required actions.'
  },
  {
    id: 'complaint',
    name: 'Extract Complaint',
    prompt: 'Extract the following information from this email conversation: customer name, contact details, product/service mentioned, issue description, requested resolution, and urgency level. Format the output as structured text with clear sections.'
  },
  {
    id: 'support',
    name: 'Generate Response',
    prompt: 'Analyze this customer email and draft a professional, empathetic response addressing their concerns. Include specific details from their message and provide clear next steps or solutions.'
  }
];

const EmailProcessor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPTS[0].prompt);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string>('');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('default');
  const [showCreateComplaint, setShowCreateComplaint] = useState<boolean>(false);

  // Fetch storage path on component mount
  useEffect(() => {
    async function fetchStoragePath() {
      try {
        const response = await fetch('/api/email-processor/config');
        if (response.ok) {
          const data = await response.json();
          setStoragePath(data.storagePath);
        }
      } catch (error) {
        console.error("Failed to fetch storage path:", error);
      }
    }
    
    fetchStoragePath();
  }, []);

  const handlePromptChange = (promptId: string) => {
    setSelectedPromptId(promptId);
    const selectedTemplate = DEFAULT_PROMPTS.find(p => p.id === promptId);
    if (selectedTemplate) {
      setPrompt(selectedTemplate.prompt);
    }
  };

  const processEmail = async (): Promise<void> => {
    if (!fileContent) {
      toast.error("No email content to process");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Match the API contract expected by your backend
      const response = await fetch('/api/email-processor/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content: prompt
            },
            {
              role: "user",
              content: fileContent
            }
          ],
          temperature: 0.3,
          fileName: fileName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error processing email');
      }
      
      const data = await response.json();
      
      // Handle the response based on the structure returned from your API
      let responseText = '';
      if (data.result) {
        responseText = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
      } else if (data.response) {
        responseText = data.response;
      } else if (data.choices && data.choices[0]?.message?.content) {
        responseText = data.choices[0].message.content;
      } else {
        responseText = JSON.stringify(data, null, 2);
      }
      
      setResult({
        status: 'success',
        message: 'Email processed successfully',
        response: responseText,
        fileName: data.outputFileName || fileName,
        originalFileName: fileName || 'email.txt',
        filePath: data.filePath || ''
      });
      
      toast.success("Email processed successfully");
    } catch (error) {
      console.error('Error processing email:', error);
      setResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      toast.error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      try {
        const content = await readFileAsText(file);
        setFileContent(content);
        setFileName(file.name);
        toast.success(`File "${file.name}" loaded successfully`);
        setResult(null); // Reset previous results
        setShowCreateComplaint(false);
      } catch (error) {
        toast.error("Failed to read file");
        console.error("Error reading file:", error);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'message/rfc822': ['.eml']
    }
  });

  const downloadResult = () => {
    if (!result?.response) return;
    
    const blob = new Blob([result.response], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateComplaint = () => {
    setShowCreateComplaint(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email AI Procesor</CardTitle>
        <CardDescription>
          Prevuci email prepisku radi analize i obrade sa AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="prompt-template" className="w-full">
          <TabsList>
            <TabsTrigger value="prompt-template">Template</TabsTrigger>
            <TabsTrigger value="custom-prompt">Kreiraj Prompt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt-template" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-template">Izaberi definisane upite</Label>
              <Select
                value={selectedPromptId}
                onValueChange={handlePromptChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberi template" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_PROMPTS.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Template Prompt</Label>
              <div className="bg-muted p-3 rounded text-sm">
                {prompt}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom-prompt" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Custom Analysis Prompt</Label>
              <Textarea
                id="custom-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter custom instructions for analyzing the email"
                className="w-full resize-none"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {storagePath && (
          <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 flex items-start">
            <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Files are stored in: <span className="font-mono">{storagePath}</span>
            </span>
          </div>
        )}
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {fileName ? `File loaded: ${fileName}` : 'Drag & drop an email file here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports .txt and .eml files
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={processEmail} 
            disabled={isProcessing || !fileContent}
            className="w-full md:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : 'Process Email'}
          </Button>
        </div>
        
        {result && result.status === 'success' && result.response && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">{result.message}</p>
                  {result.fileName && (
                    <p className="text-sm text-green-700 mt-1">
                      Analysis saved as: {result.fileName}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">AI Analysis Result:</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={downloadResult} 
                    variant="outline" 
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button 
                    onClick={handleCreateComplaint} 
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Complaint
                  </Button>
                </div>
              </div>
              <div className="bg-white p-3 rounded border text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                {result.response}
              </div>
            </div>
            
            {showCreateComplaint && (
              <div className="border rounded-md p-4 bg-slate-50">
                <h3 className="text-lg font-medium mb-4">Create Complaint from Email Analysis</h3>
                <CreateComplaintFromEmail 
                  analysisText={result.response} 
                  emailContent={fileContent || ''} 
                  originalFileName={result.originalFileName || ''}
                />
              </div>
            )}
          </div>
        )}
        
        {result && result.status === 'error' && (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Processing failed</p>
                <p className="text-sm text-red-700 mt-1">{result.message}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailProcessor;