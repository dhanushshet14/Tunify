# 🧪 PERFORMANCE TESTING GUIDE

## 📊 HOW TO MEASURE PERFORMANCE IMPROVEMENTS

### **I. BACKEND PERFORMANCE TESTING**

#### **1. Search Performance Test**

**Test Script:**
```bash
# Install Apache Bench (if not installed)
# Windows: Download from Apache website
# Mac: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test search endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   "http://localhost:5000/api/songs/search?q=test"
```

**Expected Results:**
- **Before:** 150-300ms average
- **After:** 30-80ms average
- **Target:** <100ms for 95% of requests

**What to Check:**
```
Time per request:       50ms [mean]
Time per request:       5ms [mean, across all concurrent requests]
Requests per second:    200 [#/sec]
```

#### **2. Profile Load Test**

```bash
ab -n 500 -c 5 -H "Authorization: Bearer YOUR_TOKEN" \
   "http://localhost:5000/api/auth/profile"
```

**Expected Results:**
- **Before:** 800-1200ms
- **After:** 200-400ms
- **Target:** <500ms

#### **3. Stream Performance Test**

```bash
# Test streaming endpoint
curl -H "Range: bytes=0-262143" \
     "http://localhost:5000/api/stream/song.mp3" \
     -o /dev/null -w "Time: %{time_total}s\n"
```

**Expected Results:**
- **Before:** 600-1000ms
- **After:** 150-300ms
- **Target:** <300ms

---

### **II. FRONTEND PERFORMANCE TESTING**

#### **1. Browser DevTools Performance**

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to **Performance** tab
3. Click **Record** (⚫)
4. Perform actions (search, play, seek)
5. Click **Stop**
6. Analyze results

**What to Check:**
- **FPS:** Should be 60fps
- **Scripting:** <50ms per frame
- **Rendering:** <16ms per frame
- **Painting:** <10ms per frame

#### **2. Lighthouse Audit**

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **Performance**
4. Click **Generate report**

**Expected Scores:**
- **Performance:** >90
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3.0s
- **Speed Index:** <2.5s

#### **3. Network Performance**

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Perform actions
4. Check timing

**What to Check:**
- **API calls:** <100ms
- **Compression:** Enabled (check size)
- **Caching:** 304 responses for cached items

---

### **III. DATABASE PERFORMANCE TESTING**

#### **1. Check Index Usage**

```javascript
// In MongoDB shell or Compass
db.songs.find({ title: /test/i }).explain("executionStats")
```

**What to Check:**
```json
{
  "executionStats": {
    "executionTimeMillis": 5,  // Should be <50ms
    "totalDocsExamined": 10,   // Should be low
    "totalKeysExamined": 10,   // Should match docs examined
    "executionStages": {
      "stage": "IXSCAN"        // Should use index (IXSCAN)
    }
  }
}
```

#### **2. Query Performance**

```javascript
// Test search query
db.songs.find({
  $or: [
    { title: { $regex: "^test", $options: "i" } },
    { artist: { $regex: "^test", $options: "i" } }
  ]
}).limit(10).explain("executionStats")
```

**Expected:**
- **executionTimeMillis:** <30ms
- **stage:** IXSCAN (using index)
- **totalDocsExamined:** <100

---

### **IV. AUTOMATED PERFORMANCE TESTS**

#### **Create Performance Test Suite:**

```javascript
// backend/tests/performance.test.js
const request = require('supertest');
const app = require('../server');

describe('Performance Tests', () => {
  let token;
  
  beforeAll(async () => {
    // Login and get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    token = res.body.token;
  });
  
  test('Search should complete in <100ms', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/api/songs/search?q=test')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });
  
  test('Profile should load in <500ms', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
  
  test('Stream should start in <300ms', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/api/stream/test-song.mp3')
      .set('Range', 'bytes=0-262143')
      .expect(206);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(300);
  });
});
```

**Run Tests:**
```bash
npm test -- backend/tests/performance.test.js
```

---

### **V. REAL-WORLD PERFORMANCE TESTING**

#### **1. Search Performance**

**Manual Test:**
1. Open application
2. Go to Search page
3. Type "test" in search box
4. Measure time to results

**Expected:**
- Results appear in <300ms
- No lag while typing
- Smooth scrolling

#### **2. Audio Playback**

**Manual Test:**
1. Click play on any song
2. Measure time to audio start
3. Try seeking
4. Try next/previous

**Expected:**
- Audio starts in <500ms
- Seeking is instant (<100ms)
- Next/previous is smooth

#### **3. Profile Loading**

**Manual Test:**
1. Click on username
2. Select "Profile"
3. Measure time to page load

**Expected:**
- Page loads in <1s
- Stats appear immediately
- No loading spinner

---

### **VI. PERFORMANCE MONITORING**

#### **1. Server Monitoring**

**Add to server.js:**
```javascript
// Log slow requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`⚠️ Slow request: ${req.method} ${req.url} - ${duration}ms`);
    }
  });
  next();
});
```

#### **2. Database Monitoring**

**Enable MongoDB profiling:**
```javascript
// In MongoDB shell
db.setProfilingLevel(1, { slowms: 100 })

// View slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 })
```

#### **3. Frontend Monitoring**

**Add performance marks:**
```javascript
// In controllers
performance.mark('search-start');
// ... perform search ...
performance.mark('search-end');
performance.measure('search', 'search-start', 'search-end');

const measure = performance.getEntriesByName('search')[0];
console.log(`Search took ${measure.duration}ms`);
```

---

### **VII. PERFORMANCE BENCHMARKS**

#### **Target Metrics:**

| Operation | Target | Excellent | Good | Needs Work |
|-----------|--------|-----------|------|------------|
| Search | <100ms | <50ms | <100ms | >100ms |
| Song Load | <300ms | <200ms | <300ms | >300ms |
| Seek | <100ms | <50ms | <100ms | >100ms |
| Profile | <500ms | <300ms | <500ms | >500ms |
| Playlist | <200ms | <100ms | <200ms | >200ms |

#### **User Experience Metrics:**

| Metric | Target | Description |
|--------|--------|-------------|
| FCP | <1.5s | First Contentful Paint |
| LCP | <2.5s | Largest Contentful Paint |
| FID | <100ms | First Input Delay |
| CLS | <0.1 | Cumulative Layout Shift |
| TTI | <3.0s | Time to Interactive |

---

### **VIII. PERFORMANCE REGRESSION TESTING**

#### **Create Baseline:**
```bash
# Run performance tests and save results
npm test -- backend/tests/performance.test.js > baseline.txt
```

#### **Compare After Changes:**
```bash
# Run tests again
npm test -- backend/tests/performance.test.js > current.txt

# Compare
diff baseline.txt current.txt
```

---

### **IX. LOAD TESTING**

#### **Using Artillery:**

**Install:**
```bash
npm install -g artillery
```

**Create test config (artillery.yml):**
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Search and play"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/songs/search?q=test"
          headers:
            Authorization: "Bearer {{ token }}"
      - get:
          url: "/api/stream/song.mp3"
          headers:
            Range: "bytes=0-262143"
```

**Run:**
```bash
artillery run artillery.yml
```

**Expected Results:**
- **Response time p95:** <200ms
- **Response time p99:** <500ms
- **Error rate:** <1%

---

### **X. CONTINUOUS PERFORMANCE MONITORING**

#### **Setup:**
1. Add performance tests to CI/CD
2. Run on every commit
3. Alert on regressions
4. Track metrics over time

#### **Tools:**
- **Lighthouse CI** - Automated audits
- **WebPageTest** - Real-world testing
- **New Relic** - Production monitoring
- **Datadog** - Infrastructure monitoring

---

## ✅ PERFORMANCE TEST CHECKLIST

- [ ] Run Apache Bench tests
- [ ] Check Lighthouse scores
- [ ] Verify index usage in MongoDB
- [ ] Test search performance (<100ms)
- [ ] Test audio streaming (<300ms)
- [ ] Test profile loading (<500ms)
- [ ] Check FPS in DevTools (60fps)
- [ ] Verify compression is working
- [ ] Check caching headers
- [ ] Run load tests with Artillery
- [ ] Monitor slow queries
- [ ] Test on mobile devices
- [ ] Test on slow networks (3G)

---

**All performance tests should pass before deploying to production!** 🚀
