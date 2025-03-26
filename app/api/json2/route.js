import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join('/workspace/plingua/examples', 'test2.json');

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return new Response(content, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response('Failed to read test2.json', { status: 500 });
  }
}
