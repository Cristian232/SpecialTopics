'use client'
import { useEffect, useState } from 'react';

export default function Home() {
  const [pliFiles, setPliFiles] = useState([]);
  const [source, setSource] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [cliOutput, setCliOutput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [simulationOutput, setSimulationOutput] = useState('');
  const [jsonSimOutput, setJsonSimOutput] = useState('');     // editable test2.json
  const [simCliOutput, setSimCliOutput] = useState('');       // stderr or errors
  const [simFinalOutput, setSimFinalOutput] = useState('');   // stdout result

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => setPliFiles(data.files));
  }, []);

  const runSimulation = async () => {
    setCliOutput('✍️ Saving source and running simulation...');
    setJsonOutput('');
  
    try {
      // Save current source to /workspace/plingua/examples/placeholder.pli
      const saveRes = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: source }),
      });
  
      if (!saveRes.ok) throw new Error('Failed to save .pli file');
  
      // Run simulator
      const runRes = await fetch('/api/run?file=placeholder.pli');
      const runData = await runRes.json();
      setCliOutput(runData.output || runData.error);
  
      // Load test.json content
      const jsonRes = await fetch('/api/json');
      const jsonText = await jsonRes.text();
      setJsonOutput(jsonText);
    } catch (err) {
      setCliOutput(`❌ ${err.message}`);
      setJsonOutput('');
    }
  };

  const runJsonOutput = async () => {
    setSimCliOutput('');
    setSimFinalOutput('Running simulation...');
  
    try {
      // ✅ Step 1: Save jsonSimOutput to test2.json
      const saveRes = await fetch('/api/save-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: jsonOutput }),
      });
  
      if (!saveRes.ok) throw new Error('Failed to save test2.json');

      // Load test2.json content
      const jsonRes2 = await fetch('/api/json2');
      const jsonText2 = await jsonRes2.text();
      setJsonSimOutput(jsonText2);
  
      // ✅ Step 2: Run psim on test2.json
      const simRes = await fetch('/api/run-json');
      const simData = await simRes.json();
  
      if (simRes.ok) {
        setSimCliOutput(simData.cli || '✅ No stderr output.');
        setSimFinalOutput(simData.output || '✅ Simulation complete.');
      } else {
        setSimCliOutput(simData.cli || simData.error || '❌ Simulation error.');
        setSimFinalOutput('');
      }
    } catch (err) {
      setSimCliOutput('❌ ' + err.message);
      setSimFinalOutput('');
    }
  };
  
  

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
      <div style={{ width: '60%' }}>
        <textarea
          style={{
            width: '100%',
            height: '100%',
            resize: 'none',
            padding: 10,
            boxSizing: 'border-box'
          }}
          value={source}
          onChange={e => setSource(e.target.value)}
          placeholder="Edit or paste .pli source here"
        />
      </div>

      <div style={{ width: '40%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Example Files</h3>
          <button
            onClick={runSimulation}
            style={{ padding: '5px 10px', marginLeft: '10px', backgroundColor: 'blue', color: '#fff', borderRadius: '2px' }}
          >
            Run Simulation
          </button>
        </div>

        <div style={{ marginTop: 10, marginBottom: 10, color: statusMsg.startsWith('E') ? 'red' : 'green' }}>
          {statusMsg}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '8px'
          }}
        >
          {pliFiles.map(file => (
            <button
              key={file}
              style={{
                padding: '5px 10px',
                wordBreak: 'normal',
                whiteSpace: 'normal',
                textAlign: 'center',
                fontSize: '0.9rem',
                minWidth: '150px'
              }}
              onClick={async () => {
                try {
                  const res = await fetch('/api/load?file=' + file);
                  if (!res.ok) throw new Error('Failed to load file');
                  const data = await res.text();
                  setSource(data);
                  setSelectedFile(file);
                  setStatusMsg(`Loaded ${file}`);
                } catch (err) {
                  setStatusMsg(`Error loading file: ${err.message}`);
                }
              }}
            >
              {file}
            </button>
          ))}
        </div>
      </div>
    </div>


    <div style={{ display: 'flex', justifyContent: 'none', alignItems: 'center', marginTop: 10, marginBottom: 5 }}>
      <h3 style={{ margin: 0 }}>Intermediary Output</h3>
      <button
        onClick={runJsonOutput}
        style={{ padding: '5px 10px', backgroundColor: 'green', color: '#fff', borderRadius: '4px', marginLeft: '10px' }}
      >
        Run JSON Output
      </button>
    </div>

    <div style={{ display: 'flex', gap: 10 }}>
      <textarea
        style={{ width: '50%', height: 200 }}
        readOnly
        value={cliOutput}
        placeholder="CLI output from simulator"
      />
      <textarea
        style={{ width: '50%', height: 200 }}
        value={jsonOutput}
        onChange={(e) => setJsonOutput(e.target.value)}
        placeholder="Contents of test.json (editable)"
      />
    </div>



    <h3 style={{ marginTop: 10, marginBottom: 5 }}>Simulation Output</h3>

    <div style={{ display: 'flex', gap: 10 }}>
      <textarea
        style={{ width: '35%', height: 200 }}
        readOnly
        value={simCliOutput}
        placeholder="CLI stderr (top 200 lines)"
      />
      <textarea
        style={{ width: '65%', height: 200 }}
        value={jsonSimOutput}
        onChange={(e) => setJsonSimOutput(e.target.value)}
        placeholder="Editable test2.json content"
      />
    </div>

    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
      <textarea
        style={{ width: '100%', height: 200 }}
        readOnly
        value={simFinalOutput}
        placeholder="Simulation result (stdout)"
      />
    </div>

    </div>
  );
}
