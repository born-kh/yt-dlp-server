// server.js
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

// Укажи путь к cookies.txt, экспортированным из браузера
const COOKIES_PATH = path.join(__dirname, 'cookies.txt');

app.post('/download', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url_required' });

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Transfer-Encoding', 'chunked');

  console.log(`[start] Downloading: ${url}`);

  const yt = spawn('yt-dlp', [
    '--cookies', COOKIES_PATH,      // используем авторизационные cookies
    '-f', 'bv*[ext=mp4]+ba[ext=m4a]/mp4',
    '-o', '-',                       // вывод в stdout
    url
  ]);

  yt.stdout.pipe(res);

  yt.stderr.on('data', (data) => {
    console.log(`[yt-dlp] ${data.toString()}`);
  });

  yt.on('close', (code) => {
    console.log(`[done] Finished with code ${code}`);
    res.end();
  });

  yt.on('error', (err) => {
    console.error(`[error] ${err}`);
    res.status(500).json({ error: err.message });
  });
});

app.listen(3000, () => console.log('YT server running on :3000'));
