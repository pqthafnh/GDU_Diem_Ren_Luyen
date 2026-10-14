const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir);

  // Start chrome with remote debugging
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=390,844',
    'http://localhost:3001/demo/student/events/evt-extracurricular-01'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  // Connect to Chrome DevTools Protocol
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const tabs = JSON.parse(data);
        console.log('Tabs:', tabs.length);
        const wsUrl = tabs[0].webSocketDebuggerUrl;
        console.log('WS URL:', wsUrl);
      } catch (err) {
        console.error(err);
      } finally {
        chrome.kill();
      }
    });
  }).on('error', (err) => {
    console.error('HTTP Error:', err.message);
    chrome.kill();
  });
}

main();
