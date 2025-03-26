import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { content } = await request.json();    
    const jsonPath = path.join('/workspace/plingua/examples', 'test2.json');
    fs.writeFileSync(jsonPath, content, 'utf8');
    return new Response('test2.json saved', { status: 200 });
  } catch (err) {
    return new Response('Failed to save test2.json', { status: 500 });
  }
}
