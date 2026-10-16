const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
// Use native globalThis.WebSocket in Node 22+

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function runTest(width, height, filename) {
  return new Promise(async (resolve) => {
    const chrome = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=9223',
      `--window-size=${width},${height}`,
      'http://localhost:3001/demo/student/events/evt-extracurricular-01'
    ]);

    await new Promise(r => setTimeout(r, 2500));

    http.get('http://127.0.0.1:9223/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          const tabs = JSON.parse(data);
          const wsUrl = tabs[0].webSocketDebuggerUrl;
          const ws = new globalThis.WebSocket(wsUrl);

          let msgId = 1;
          const callbacks = {};

          function send(method, params = {}) {
            return new Promise((res) => {
              const id = msgId++;
              callbacks[id] = res;
              ws.send(JSON.stringify({ id, method, params }));
            });
          }

          ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.id && callbacks[msg.id]) {
              callbacks[msg.id](msg.result);
              delete callbacks[msg.id];
            }
          };

          ws.onopen = async () => {
            await send('Page.enable');
            await send('Runtime.enable');
            await send('DOM.enable');

            // Wait a bit for page load
            await new Promise(r => setTimeout(r, 1000));

            // Click the register button: find button containing "Đăng ký tham gia"
            const clickRes = await send('Runtime.evaluate', {
              expression: `
                (() => {
                  const buttons = Array.from(document.querySelectorAll('button'));
                  const btn = buttons.find(b => b.textContent.includes('Đăng ký tham gia'));
                  if (btn) {
                    btn.click();
                    return { clicked: true };
                  }
                  return { clicked: false };
                })()
              `,
              returnByValue: true
            });
            console.log('Click result for ' + filename + ':', clickRes.result.value);

            // Wait 800ms for modal animate in
            await new Promise(r => setTimeout(r, 800));

            // Check bounding rects of dialog vs header and bottom nav!
            const inspectRes = await send('Runtime.evaluate', {
              expression: `
                (() => {
                  const dialog = document.querySelector('[role="dialog"]');
                  const header = document.querySelector('header');
                  const nav = document.querySelector('nav.fixed.bottom-0');
                  const footer = dialog ? dialog.querySelector('.border-t') : null;
                  
                  return {
                    windowHeight: window.innerHeight,
                    windowWidth: window.innerWidth,
                    headerRect: header ? header.getBoundingClientRect() : null,
                    headerZ: header ? window.getComputedStyle(header).zIndex : null,
                    navRect: nav ? nav.getBoundingClientRect() : null,
                    navZ: nav ? window.getComputedStyle(nav).zIndex : null,
                    dialogRect: dialog ? dialog.getBoundingClientRect() : null,
                    dialogZ: dialog ? window.getComputedStyle(dialog).zIndex : null,
                    dialogParentZ: dialog && dialog.parentElement ? window.getComputedStyle(dialog.parentElement).zIndex : null,
                    dialogFooterRect: footer ? footer.getBoundingClientRect() : null
                  };
                })()
              `,
              returnByValue: true
            });
            console.log('Inspection for ' + filename + ':', JSON.stringify(inspectRes.result.value, null, 2));

            // Take screenshot
            const shot = await send('Page.captureScreenshot', { format: 'png' });
            const buf = Buffer.from(shot.data, 'base64');
            const scratchDir = path.join(__dirname, '..', 'scratch');
            if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir);
            fs.writeFileSync(path.join(scratchDir, filename), buf);
            console.log('Saved ' + filename);

            ws.close();
            chrome.kill();
            resolve();
          };
        } catch (e) {
          console.error(e);
          chrome.kill();
          resolve();
        }
      });
    }).on('error', (e) => {
      console.error(e);
      chrome.kill();
      resolve();
    });
  });
}

async function main() {
  console.log('--- Inspecting Mobile (390 x 844) ---');
  await runTest(390, 844, 'modal-mobile.png');

  await new Promise(r => setTimeout(r, 1000));

  console.log('--- Inspecting Desktop (1440 x 900) ---');
  await runTest(1440, 900, 'modal-desktop.png');
}

main();
