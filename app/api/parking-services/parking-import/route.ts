// app/api/parking-services/parking-import/route.ts
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await auth();
  
  // Check for user email instead of id
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Niste prijavljeni" },
      { status: 401 }
    );
  }

  try {
    // Get user email from request body
    const body = await req.json();
    const userEmail = body.userEmail || session.user.email;
    const uploadedFilePath = body.uploadedFilePath; // Path to the uploaded file

    // Look up the actual user ID from the database using email
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail
      },
      select: {
        id: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Korisnik nije pronađen u bazi podataka" },
        { status: 404 }
      );
    }

    // Get file info if uploadedFilePath is provided
    let fileInfo = null;
    if (uploadedFilePath) {
      try {
        const stats = await fs.stat(uploadedFilePath);
        fileInfo = {
          filePath: uploadedFilePath,
          fileName: path.basename(uploadedFilePath),
          fileSize: stats.size,
          mimeType: uploadedFilePath.endsWith('.xlsx') 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.ms-excel'
        };
      } catch (error) {
        console.warn("Could not get file info:", error);
      }
    }

    const scriptPath = path.join(process.cwd(), "scripts", "parking_service_processor.py");

    // Update import status to in_progress if we're importing for a specific service
    if (body.parkingServiceId && fileInfo) {
      await prisma.parkingService.update({
        where: { id: body.parkingServiceId },
        data: {
          importStatus: 'in_progress',
          lastImportDate: new Date(),
          importedBy: user.id,
          originalFileName: fileInfo.fileName,
          originalFilePath: fileInfo.filePath,
          fileSize: fileInfo.fileSize,
          mimeType: fileInfo.mimeType,
        }
      });
    }

    return new Promise((resolve) => {
      // Pass the actual user ID (UUID) to Python script
      const pythonProcess = spawn("python", [scriptPath, user.id], {
        env: {
          ...process.env,
          SUPABASE_PASSWORD: process.env.SUPABASE_PASSWORD || "",
          UPLOADED_FILE_PATH: uploadedFilePath || "",
        },
      });

      let combinedOutput = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        combinedOutput += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        combinedOutput += data.toString();
      });

      pythonProcess.on("close", async (code) => {
        const isSuccess = code === 0;
        
        // Update import status based on result
        if (body.parkingServiceId) {
          try {
            await prisma.parkingService.update({
              where: { id: body.parkingServiceId },
              data: {
                importStatus: isSuccess ? 'success' : 'failed',
                lastImportDate: new Date(),
              }
            });
          } catch (dbError) {
            console.error("Failed to update import status:", dbError);
          }
        }

        // If the import was successful and we have file info, we might want to 
        // create or update a ParkingService record with the file information
        if (isSuccess && fileInfo && !body.parkingServiceId) {
          try {
            // Try to extract service name from filename or output
            const serviceName = extractServiceNameFromOutput(combinedOutput) || 
                              path.parse(fileInfo.fileName).name;
            
            // Check if a service with this name already exists
            let parkingService = await prisma.parkingService.findFirst({
              where: {
                name: {
                  contains: serviceName,
                  mode: 'insensitive'
                }
              }
            });

            if (parkingService) {
              // Update existing service with file info
              await prisma.parkingService.update({
                where: { id: parkingService.id },
                data: {
                  originalFileName: fileInfo.fileName,
                  originalFilePath: fileInfo.filePath,
                  fileSize: fileInfo.fileSize,
                  mimeType: fileInfo.mimeType,
                  lastImportDate: new Date(),
                  importedBy: user.id,
                  importStatus: 'success',
                }
              });
            } else {
              // Create new service
              await prisma.parkingService.create({
                data: {
                  name: serviceName,
                  description: `Imported from ${fileInfo.fileName}`,
                  originalFileName: fileInfo.fileName,
                  originalFilePath: fileInfo.filePath,
                  fileSize: fileInfo.fileSize,
                  mimeType: fileInfo.mimeType,
                  lastImportDate: new Date(),
                  importedBy: user.id,
                  importStatus: 'success',
                  isActive: true,
                }
              });
            }
          } catch (dbError) {
            console.error("Failed to create/update parking service:", dbError);
          }
        }

        resolve(
          NextResponse.json({
            success: isSuccess,
            output: combinedOutput,
            error: errorOutput,
            exitCode: code,
            userId: user.id,
            userEmail,
            fileInfo
          })
        );
      });
    });

  } catch (error) {
    console.error("Error in parking import:", error);
    
    // Update status to failed if we have a parking service ID
    const body = await req.json().catch(() => ({}));
    if (body.parkingServiceId) {
      try {
        await prisma.parkingService.update({
          where: { id: body.parkingServiceId },
          data: {
            importStatus: 'failed',
            lastImportDate: new Date(),
          }
        });
      } catch (dbError) {
        console.error("Failed to update import status on error:", dbError);
      }
    }

    return NextResponse.json(
      { error: "Greška prilikom importa parking servisa" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to extract service name from Python script output
function extractServiceNameFromOutput(output: string): string | null {
  // Look for patterns like "Processing service: ServiceName" in the output
  const serviceNameMatch = output.match(/Processing service:\s*(.+?)$/m);
  if (serviceNameMatch) {
    return serviceNameMatch[1].trim();
  }
  
  // Look for other patterns that might indicate service name
  const importedMatch = output.match(/Successfully imported data for:\s*(.+?)$/m);
  if (importedMatch) {
    return importedMatch[1].trim();
  }
  
  return null;
}