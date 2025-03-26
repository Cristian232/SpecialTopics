import fs from 'fs';
import path from 'path';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');

  if (!file || !file.endsWith('.pli') || file === 'placeholder.pli') {
    return new Response('Invalid file name', { status: 400 });
  }

  const filePath = path.join('/workspace/plingua/examples', file);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return new Response(content, { status: 200 });
  } catch (err) {
    return new Response('Failed to read file', { status: 500 });
  }
}
