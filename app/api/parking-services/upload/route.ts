// app/api/parking-services/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  // Check for user email instead of id
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Niste prijavljeni" },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const userEmail = formData.get("userEmail") as string; // Get userEmail instead of userId

  if (!file) {
    return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "scripts", "input");

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, file.name);

  try {
    await writeFile(filePath, buffer);
    
    // Log action with user email
    console.log(`File ${file.name} uploaded by user ${userEmail || session.user.email}`);
    
    return NextResponse.json({ 
      success: true, 
      file: file.name,
      userEmail: userEmail || session.user.email
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save file.", details: String(error) },
      { status: 500 }
    );
  }
}