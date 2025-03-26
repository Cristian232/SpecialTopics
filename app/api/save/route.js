import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { content } = await request.json();

    const pliPath = path.join('/workspace/plingua/examples', 'placeholder.pli');
    const jsonPath = path.join('/workspace/plingua/examples', 'test.json');

    // Reset both files (overwrite with empty string)
    fs.writeFileSync(pliPath, '', 'utf8');
    fs.writeFileSync(jsonPath, '', 'utf8');

    // Write new content to .pli
    fs.writeFileSync(pliPath, content, 'utf8');

    return new Response('File saved and reset successfully', { status: 200 });
  } catch (err) {
    return new Response('❌ Failed to save/reset files', { status: 500 });
  }
}
