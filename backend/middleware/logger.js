// Enhanced Request/Response Logger Middleware
const logger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  console.log('\n========== INCOMING REQUEST ==========');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('IP:', req.ip);
  console.log('User-Agent:', req.get('user-agent'));
  
  // Capture original send
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override res.send
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log('\n========== OUTGOING RESPONSE ==========');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    console.log('Response Data:', typeof data === 'string' ? data.substring(0, 500) : data);
    console.log('======================================\n');
    
    originalSend.call(this, data);
  };
  
  // Override res.json
  res.json = function(data) {
    const duration = Date.now() - startTime;
    console.log('\n========== OUTGOING JSON RESPONSE ==========');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    console.log('Response JSON:', JSON.stringify(data, null, 2));
    console.log('===========================================\n');
    
    originalJson.call(this, data);
  };
  
  // Log errors
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      console.error(`❌ ERROR RESPONSE: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    }
  });
  
  next();
};

module.exports = logger;
