# 🚀 QUICK START - Diagnostic System

## ⚡ 3-Minute Setup

### **Step 1: Start Servers (1 min)**
```bash
# Terminal 1 - Backend with full logging
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### **Step 2: Open Browser (30 sec)**
1. Navigate to `http://localhost:8080`
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Enable **Preserve log**

### **Step 3: Test & Observe (1.5 min)**
1. **Login** - Watch logs in both terminal and console
2. **Play a song** - See audio events in console
3. **Search** - See timing in backend terminal
4. **Check profile** - See data fetching logs

---

## 📊 What You'll See

### **Backend Terminal:**
```
✅ ========== SERVER READY ==========
🔐 ========== LOGIN ATTEMPT ==========
✅ Login successful
🎵 ========== STREAM REQUEST ==========
✅ Streaming partial content (206)
```

### **Browser Console:**
```
🎵 ========== PLAY SONG ==========
🎵 [AUDIO] loadstart
🎵 [AUDIO] canplay
▶️ [AUDIO] playing
✅ Playback started successfully
```

---

## 🐛 If Something Breaks

### **Check Logs For:**
- ❌ Red error messages
- ⏱️ Slow operations (>1s)
- 🚫 Failed requests (401, 404, 500)

### **Then:**
1. Copy the error logs
2. Open `ROOT_CAUSE_ANALYSIS.md`
3. Find matching pattern
4. Apply solution

---

## 📚 Full Documentation

- **DIAGNOSTIC_SUMMARY.md** - Complete overview
- **TEST_INSTRUCTIONS.md** - Detailed testing
- **ROOT_CAUSE_ANALYSIS.md** - Issue solutions
- **DIAGNOSTIC_LOGGING_COMPLETE.md** - Technical details

---

## ✅ Quick Verification

Run this to verify everything is set up:
```bash
VERIFY_DIAGNOSTICS.bat
```

---

**That's it! You're now running with full diagnostic logging.** 🎉

Every operation is tracked, every error is logged, and every performance metric is measured.

**Happy debugging!** 🔍
