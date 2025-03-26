import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const examplesPath = '/workspace/plingua/examples';
  const pliFile = path.join(examplesPath, 'placeholder.pli');
  const jsonFile = path.join(examplesPath, 'test.json');
  const simulatorPath = '/workspace/plingua/bin/plingua';

  // Step 1: Generate test.json using exec (unchanged)
  try {
    fs.writeFileSync(jsonFile, '', 'utf8');

    await new Promise((resolve, reject) => {
      exec(
        `${simulatorPath} ${pliFile} -o test.json -f json -v 5 --no-color`,
        { cwd: examplesPath, maxBuffer: 1024 * 1024 * 100 }, // 100MB buffer
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to generate test.json' }), { status: 500 });
  }

  // Step 2: Spawn a separate process for CLI output
  const cliOutput = await new Promise((resolve) => {
    const proc = spawn(simulatorPath, [pliFile, '-v', '5', '--no-color'], {
      cwd: examplesPath,
    });

    let collected = '';
    let killedByTimeout = false;

    const timeout = setTimeout(() => {
      killedByTimeout = true;
      proc.kill('SIGKILL');
    }, 10000); // 10 seconds timeout

    proc.stdout.on('data', (chunk) => {
      collected += chunk.toString();
      if (collected.length > 500000) {
        proc.kill('SIGKILL'); // kill if output is just too big
      }
    });

    proc.stderr.on('data', (chunk) => {
      collected += chunk.toString();
    });

    proc.on('close', () => {
      clearTimeout(timeout);

      if (killedByTimeout) {
        resolve('⚠️ CLI simulation timed out.');
      } else {
        const lines = collected.split('\n').slice(0, 200).join('\n');
        resolve(`--- First 200 lines ---\n\n${lines}`);
      }
    });
  });

  // Send CLI output only (test.json is handled separately via /api/json)
  return new Response(JSON.stringify({ output: cliOutput }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
