// Path: components/services/ParkingServiceProcessorForm.tsx
"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export function ParkingServiceProcessorForm() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("📂 Molimo izaberite fajl za upload.");
      return;
    }

    if (!session?.user?.email) {
      toast.error("🔒 Morate biti prijavljeni da biste izvršili ovu akciju");
      return;
    }

    setIsProcessing(true);
    setLogs(prev => [...prev, "Starting processing..."]);

    try {
      // 1. Upload file
      setLogs(prev => [...prev, "Uploading file..."]);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userEmail", session.user.email);

      const uploadRes = await fetch("/api/parking-services/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Greška prilikom uploada fajla.");
      }

      setLogs(prev => [...prev, "✅ Fajl uspešno uploadovan!"]);
      
      // 2. Run import script
      setLogs(prev => [...prev, "🚀 Pokrećem import skriptu..."]);
      const importRes = await fetch("/api/parking-services/parking-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: session.user.email }),
      });

      const result = await importRes.json();
      
      if (importRes.ok && result.success) {
        // Split output into log lines
        const outputLines = result.output.split('\n').filter(Boolean);
        setLogs(prev => [...prev, ...outputLines]);
        setLogs(prev => [...prev, "✅ Import uspešan!"]);
      } else {
        const errorLog = result.error || "Nepoznata greška";
        setLogs(prev => [...prev, `❌ Greška tokom importa: ${errorLog}`]);
        toast.error("❌ Greška tokom importa!");
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      setLogs(prev => [...prev, `❌ Došlo je do greške: ${errorMsg}`]);
      toast.error("❌ Došlo je do greške.");
    } finally {
      setIsProcessing(false);
      // Reset file input but keep logs
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm space-y-4 relative">
      <h3 className="text-lg font-semibold">Import Parking Service Data</h3>
      <p className="text-sm text-gray-500">
        Upload Excel fajl koji će biti snimljen u <code>scripts/input/</code> i automatski procesiran.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 mb-4 p-2 border rounded"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing}
        className={`px-4 py-2 rounded flex items-center gap-2 ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isProcessing ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Obrađujem...
          </>
        ) : (
          "Upload i Import"
        )}
      </button>

      {logs.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 text-sm overflow-auto max-h-96 border rounded">
          <h4 className="font-medium mb-2">Processing Logs:</h4>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`font-mono text-xs ${
                  log.includes('✅') ? 'text-green-600' : 
                  log.includes('❌') ? 'text-red-600' : 
                  'text-gray-700'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}