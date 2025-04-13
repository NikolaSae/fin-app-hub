import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    console.log('Full request body:', requestBody);

    const { messages, prompt, fileName } = requestBody;
    const content = messages?.find((m: any) => m.role === 'user')?.content;

    if (!content) {
      return NextResponse.json({ error: 'Email content is missing' }, { status: 400 });
    }

    // Step 1: Provera duzine tela emaila i deljenje u chunk-ove ako je potrebno
    const maxChunkSize = 4000;

    let chunks = [];
    if (content.length > maxChunkSize) {
      chunks = splitContentIntoChunks(content, maxChunkSize);  // Podeli email telo u manje delove ako je potrebno
    } else {
      chunks = [content];  // Ako telo emaila nije previše veliko, uzmi ga kao jedan deo
    }

    const partialResponses: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const systemPrompt =
        prompt ||
        `Extract structured data from this part of an email conversation in JSON format: service name, start date, end date, price, phone number, request from subject, sender, total price.`;

      const chatBody = {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: chunk }
        ],
        temperature: 0.3
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chatBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response from Groq API:', errorData);
        throw new Error('Error from Groq API');
      }

      const data = await response.json();
      partialResponses.push(data.choices[0]?.message?.content || '');
    }

    const fullResponse = partialResponses.join('\n');

    if (!fullResponse) {
      return NextResponse.json({ error: 'No data extracted from the email' }, { status: 500 });
    }

    let outputFileName = null;
    let filePath = null;

    if (fileName) {
      filePath = saveEmailToFile(fullResponse, fileName);
      outputFileName = path.basename(filePath);
    }
    console.log('Starting Python script execution...');

    // Log full path for debugging
    console.log('Full path to the email file:', path.resolve(filePath));

    // Run the Python script for further processing
    const pythonScriptPath = path.resolve('./scripts/skripta.py');  // Ensure correct path
    console.log('Resolved Python script path:', pythonScriptPath);
    const pythonCommand = `python ${pythonScriptPath} ${filePath}`;
    console.log('Executing command:', pythonCommand);
    // Log Python command for debugging
    console.log('Running Python script with command:', pythonCommand);

    const { stdout, stderr } = await execPromise(pythonCommand);
    console.log('Python script execution completed');
    
    if (stderr) {
      console.error('Error running Python script:', stderr);
      return NextResponse.json({ error: 'Error processing email with Python script' }, { status: 500 });
    }

    console.log('Python script output:', stdout);

    return NextResponse.json({
      success: true,
      extractedData: fullResponse,
      outputFileName,
      originalFileName: fileName,
      filePath,
      pythonScriptOutput: stdout  // Include output from Python script
    });

  } catch (error) {
    console.error('Email processing error:', error);
    return NextResponse.json({
      error: 'Internal server error processing email',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
