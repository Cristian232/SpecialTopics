import fs from 'fs';
import path from 'path';

export async function GET() {
  const examplesDir = '/workspace/plingua/examples';

  try {
    const files = fs.readdirSync(examplesDir);
    const pliFiles = files.filter(file => file.endsWith('.pli'));
    return new Response(JSON.stringify({ files: pliFiles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
