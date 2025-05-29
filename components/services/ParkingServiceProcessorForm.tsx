// Path: components/services/ParkingServiceProcessorForm.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export function ParkingServiceProcessorForm() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  console.log("Session:", session);
  console.log("Selected file:", selectedFile?.name);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File change event:", event.target.files);
    
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setLogs("");
    }
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked");
    
    if (!selectedFile) {
      console.log("No file selected");
      toast.error("📂 Molimo izaberite fajl za upload.");
      return;
    }

    // Check for user email
    if (!session?.user?.email) {
      console.log("No user session or user email");
      toast.error("🔒 Morate biti prijavljeni da biste izvršili ovu akciju");
      return;
    }

    console.log("Starting processing...");
    setIsProcessing(true);
    setLogs("");

    const uploadToast = toast.loading("⏳ Uploadujem fajl...");

    try {
      // 1. Upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userEmail", session.user.email); // Use userEmail

      console.log("Uploading file...");
      const uploadRes = await fetch("/api/parking-services/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        console.error("Upload failed:", uploadRes.status, uploadRes.statusText);
        throw new Error("Greška prilikom uploada fajla.");
      }

      toast.success("✅ Fajl uspešno uploadovan!", { id: uploadToast });
      console.log("File uploaded successfully");

      // 2. Pokretanje skripte
      const importToast = toast.loading("🚀 Pokrećem import skriptu...");
      console.log("Starting import script...");

      const importRes = await fetch("/api/parking-services/parking-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: session.user.email }), // Use userEmail
      });

      const result = await importRes.json();
      console.log("Import response:", result);

      if (importRes.ok && result.success) {
        toast.success("✅ Import uspešan!", { id: importToast });
        setLogs(result.output || "✅ Import završen bez dodatnih poruka.");
      } else {
        toast.error("❌ Greška tokom importa!", { id: importToast });
        const errorLog =
          result.error ||
          result.stderr ||
          result.stdout ||
          JSON.stringify(result, null, 2) ||
          "Nepoznata greška.";
        setLogs(errorLog);
      }
    } catch (error: any) {
      console.error("Error during processing:", error);
      toast.error("❌ Došlo je do greške.");
      setLogs(error?.message || String(error));
    } finally {
      console.log("Processing finished");
      setIsProcessing(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm space-y-4 relative">
      <h3 className="text-lg font-semibold">Import Parking Service Data</h3>
      <p className="text-sm text-gray-500">
        Upload Excel fajl koji će biti snimljen u <code>scripts/input/</code> i automatski procesiran.
      </p>

      <input
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

      {logs && (
        <pre className="mt-4 p-4 bg-gray-100 text-sm overflow-auto max-h-96 whitespace-pre-wrap border rounded">
          {logs}
        </pre>
      )}
    </div>
  );
}