// app/api/process-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { content, prompt, fileName } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      );
    }

    // Create directory for saving if it doesn't exist
    const saveDir = path.join(process.cwd(), 'email-processing');
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // Save original email content
    const timestamp = Date.now();
    const originalFileName = `email-${timestamp}.txt`;
    const originalFilePath = path.join(saveDir, originalFileName);
    fs.writeFileSync(originalFilePath, content);

    // Call ChatGPT API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: prompt || 'Analyze this email conversation and provide a summary of key points and any required actions.'
          },
          {
            role: "user",
            content
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Error calling OpenAI API', details: errorData },
        { status: 500 }
      );
    }

    const responseData = await response.json();
    const aiResponse = responseData.choices[0].message.content;

    // Save AI response
    const outputFileName = `analysis-${timestamp}.txt`;
    const outputFilePath = path.join(saveDir, outputFileName);
    fs.writeFileSync(outputFilePath, aiResponse);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      originalFileName,
      outputFileName
    });
  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}