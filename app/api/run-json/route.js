import { spawn } from 'child_process';
import path from 'path';

export async function GET() {
  const examplesPath = '/workspace/plingua/examples';
  const psimPath = '/workspace/plingua/bin/psim';
  const jsonFile = path.join(examplesPath, 'test2.json');

  return new Promise((resolve) => {
    const proc = spawn(psimPath, ['../examples/test2.json', '-v', '5'], {
      cwd: '/workspace/plingua/bin', // <- run from the bin folder
    });

    let stdout = '';
    let stderr = '';
    let timeoutHit = false;

    const timeout = setTimeout(() => {
      timeoutHit = true;
      proc.kill('SIGKILL');
    }, 10000); // 10s timeout

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timeout);

      const cli = stderr.split('\n').slice(0, 200).join('\n'); // optional

      if (timeoutHit) {
        return resolve(new Response(JSON.stringify({
          cli: '⚠️ Simulation timed out.',
          output: '',
        }), { status: 500 }));
      }

      if (code !== 0) {
        return resolve(new Response(JSON.stringify({
          cli: cli || `Exited with code ${code}`,
          output: '',
        }), { status: 500 }));
      }

      return resolve(new Response(JSON.stringify({
        cli: cli || '✅ psim completed.',
        output: stdout,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });
}
