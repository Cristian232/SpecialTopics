import fs from 'fs';
import path from 'path';

export async function GET() {
  const jsonPath = path.join('/workspace/plingua/examples', 'test.json');

  try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    return new Response(content, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response('❌ Failed to read test.json', { status: 500 });
  }
}
