const express = require('express')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const app = express()
app.use(express.json())

app.post('/download', async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'url_required' })

  const tmpFile = path.join(os.tmpdir(), `yt-${Date.now()}.mp4`)

  const yt = spawn('yt-dlp', [
    '-f', 'best[ext=mp4]/best',
    '-o', tmpFile,
    '--restrict-filenames',
    '--progress',
    '--newline',
    url
  ])



  yt.stderr.on('data', d => console.log(d.toString()))

  yt.on('close', code => {
    if (code !== 0) {
      return res.status(500).json({ error: 'yt-dlp failed' })
    }

    res.setHeader('Content-Type', 'video/mp4')
    res.setHeader('Content-Length', fs.statSync(tmpFile).size)

    const stream = fs.createReadStream(tmpFile)
    stream.pipe(res)

    stream.on('close', () => fs.unlinkSync(tmpFile))
  })
})

app.listen(3000, () => console.log('YT server running on :3000'))
