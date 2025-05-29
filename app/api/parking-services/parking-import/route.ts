// app/api/parking-services/parking-import/route.ts
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
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

    const scriptPath = path.join(process.cwd(), "scripts", "parking_service_processor.py");

    return new Promise((resolve) => {
      // Pass the actual user ID (UUID) to Python script
      const pythonProcess = spawn("python3", [scriptPath, user.id], {
        env: {
          ...process.env,
          SUPABASE_PASSWORD: process.env.SUPABASE_PASSWORD || "",
        },
      });

      let combinedOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        combinedOutput += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        combinedOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        resolve(
          NextResponse.json({
            success: code === 0,
            output: combinedOutput,
            exitCode: code,
            userId: user.id,
            userEmail
          })
        );
      });
    });

  } catch (error) {
    console.error("Error looking up user:", error);
    return NextResponse.json(
      { error: "Greška prilikom pretraživanja korisnika" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}