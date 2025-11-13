const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Stream audio with full range support for smooth seeking
router.get('/:filename', (req, res) => {
  const startTime = Date.now();
  console.log('\n🎵 ========== STREAM REQUEST ==========');
  console.log('Filename:', req.params.filename);
  console.log('Range:', req.headers.range || 'Full file');
  console.log('Time:', new Date().toISOString());
  
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);

    console.log('📁 File path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found:', filePath);
      console.error('======================================\n');
      return res.status(404).json({ error: 'File not found' });
    }
    
    console.log('✅ File exists');

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    console.log('📊 File size:', fileSize, 'bytes');

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac'
    };
    const contentType = contentTypeMap[ext] || 'audio/mpeg';

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      console.log(`📦 Range request: ${start}-${end} (${chunksize} bytes)`);

      // Create read stream with range
      const file = fs.createReadStream(filePath, { start, end });

      // Set headers for partial content
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length'
      };

      res.writeHead(206, head);
      console.log('✅ Streaming partial content (206)');
      
      // Handle stream errors
      file.on('error', (err) => {
        console.error('❌ Stream error:', err);
        console.error('======================================\n');
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
      
      file.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`✅ Stream completed in ${duration}ms`);
        console.log('======================================\n');
      });

      file.pipe(res);
    } else {
      // No range request - send full file
      console.log('📦 Full file request');
      
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      };
      
      res.writeHead(200, head);
      console.log('✅ Streaming full file (200)');
      
      const file = fs.createReadStream(filePath);
      
      file.on('error', (err) => {
        console.error('❌ Stream error:', err);
        console.error('======================================\n');
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
      
      file.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`✅ Stream completed in ${duration}ms`);
        console.log('======================================\n');
      });

      file.pipe(res);
    }
  } catch (error) {
    console.error('❌ Streaming error:', error);
    console.error('Stack:', error.stack);
    console.error('======================================\n');
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
