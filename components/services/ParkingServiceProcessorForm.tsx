// Path: components/services/ParkingServiceProcessorForm.tsx
"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface FileUploadInfo {
  originalName: string;
  savedName: string;
  filePath: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  parkingServiceId?: string | null;
}

export function ParkingServiceProcessorForm() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<FileUploadInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadedFileInfo(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("📂 Molimo izaberite fajl za upload.");
      return;
    }

    if (!session?.user?.email) {
      toast.error("🔒 Morate biti prijavljeni da biste izvršili ovu akciju.");
      return;
    }

    setIsProcessing(true);
    setLogs(["🚀 Počinje proces uploada i importa..."]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userEmail", session.user.email);

      setLogs((prev) => [...prev, "📤 Uploadujem fajl..."]);
      const uploadRes = await fetch("/api/parking-services/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Greška prilikom uploada fajla.");

      const uploadResult = await uploadRes.json();
      setUploadedFileInfo(uploadResult.fileInfo);

      setLogs((prev) => [
        ...prev,
        "✏️ Preimenujem fajl...",
        `✅ Fajl uspešno uploadovan: ${uploadResult.fileInfo.savedName}`,
        `📊 Veličina fajla: ${(uploadResult.fileInfo.size / 1024).toFixed(2)} KB`,
        "🔄 Pokrećem import skriptu...",
      ]);

      const importRes = await fetch("/api/parking-services/parking-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email,
          uploadedFilePath: uploadResult.fileInfo.filePath,
          parkingServiceId: uploadResult.fileInfo.parkingServiceId,
        }),
      });

      const result = await importRes.json();

      if (importRes.ok && result.success) {
        const outputLines = result.output?.split("\n").filter(Boolean) || [];
        setLogs((prev) => [
          ...prev,
          ...outputLines,
          "✅ Import uspešno završen!",
          ...(result.fileInfo
            ? [
                `📁 Fajl sačuvan kao: ${result.fileInfo.fileName}`,
                `💾 Lokacija: ${result.fileInfo.filePath}`,
              ]
            : []),
        ]);
        toast.success("✅ Import uspešno završen!");
      } else {
        const errorLog = result.error || "Nepoznata greška";
        setLogs((prev) => [...prev, `❌ Greška tokom importa: ${errorLog}`]);
        toast.error("❌ Greška tokom importa!");
      }
    } catch (error: any) {
      setLogs((prev) => [...prev, `❌ Došlo je do greške: ${error.message || error}`]);
      toast.error("❌ Došlo je do greške.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setUploadedFileInfo(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm space-y-6 relative">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Import Parking Service Data</h3>
        {logs.length > 0 && (
          <button
            onClick={clearLogs}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Obriši logove
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Upload Excel fajl (.xls, .xlsx) koji će biti snimljen u <code>scripts/input/</code> i automatski procesiran.
      </p>

      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          className="block w-full text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />

        {selectedFile && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p><strong>Izabrani fajl:</strong> {selectedFile.name}</p>
            <p><strong>Veličina:</strong> {formatFileSize(selectedFile.size)}</p>
            <p><strong>Tip:</strong> {selectedFile.type}</p>
          </div>
        )}

        {uploadedFileInfo && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
            <p><strong>Poslednji uploadovani fajl:</strong></p>
            <p>• Originalno ime: {uploadedFileInfo.originalName}</p>
            <p>• Sačuvano kao: {uploadedFileInfo.savedName}</p>
            <p>• Veličina: {formatFileSize(uploadedFileInfo.size)}</p>
            <p>• Uploadovao: {uploadedFileInfo.uploadedBy}</p>
            <p>• Vreme: {new Date(uploadedFileInfo.uploadedAt).toLocaleString('sr-RS')}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isProcessing || !selectedFile}
          className={`px-6 py-3 rounded flex items-center gap-2 font-medium ${
            isProcessing || !selectedFile
              ? "bg-gray-400 cursor-not-allowed text-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700 transition"
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Obrađujem...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload i Import
            </>
          )}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 border rounded-lg max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Processing Logs:</h4>
            <span className="text-xs text-gray-500">
              {logs.length} {logs.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`font-mono text-xs p-2 rounded ${
                  log.includes("✅") ? "bg-green-100 text-green-800" :
                  log.includes("❌") ? "bg-red-100 text-red-800" :
                  log.includes("🚀") || log.includes("🔄") ? "bg-blue-100 text-blue-800" :
                  log.includes("📤") || log.includes("📁") || log.includes("💾") ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-700"
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
