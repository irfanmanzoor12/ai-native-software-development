# ⚠️ Function Timeout Troubleshooting Guide

## Issue: FUNCTION_INVOCATION_TIMEOUT

You're seeing this error because Vercel functions are timing out after 10 seconds (default).

---

## ✅ Quick Fix Steps

### Step 1: Verify Deployment Status

1. Go to: https://vercel.com/dashboard
2. Select your project: **ai-native-software-development**
3. Click "Deployments"
4. Check the **latest deployment** (should show: "Ready")
5. If still "Building", wait for it to finish

---

### Step 2: Verify API Keys Are Set

1. In Vercel Dashboard → Settings → Environment Variables
2. Check these exist:

```
✓ GROQ_API_KEY = gsk_...
✓ GEMINI_API_KEY = AIza...
```

3. If missing, add them now
4. Click **"Redeploy"** after adding keys

---

### Step 3: Manual Redeploy (Force Update)

1. Vercel Dashboard → Deployments
2. Click the **3 dots (•••)** next to latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for build to complete

---

## 🔍 Why This Happens

### Common Causes:

1. **Deployment Not Finished**
   - Solution: Wait 2-3 minutes after push

2. **API Keys Not Set**
   - Solution: Add GROQ_API_KEY + GEMINI_API_KEY in Vercel

3. **Cold Start Delay**
   - First request after deployment can be slow
   - Solution: Try request again after 30 seconds

4. **API Provider Down**
   - Groq or Gemini might be experiencing issues
   - Solution: Check status pages

---

## 🧪 Test Manually in Browser

### Test Summary Mode:
1. Visit: https://ai-native-software-development.vercel.app
2. Click **"Summary"** button
3. Sign up (use any email/password)
4. Type: **"Summarize Chapter 1"**
5. Click send

**Expected:** Response in 2-5 seconds (first request slower due to cold start)

### Test Personalized Mode:
1. Click **"Personalized"** button
2. Fill comprehensive form
3. Type: **"Explain Chapter 1"**
4. Click send

**Expected:** Response in 3-6 seconds

---

## 🔧 Advanced Troubleshooting

### Check Vercel Function Logs:

1. Vercel Dashboard → Deployments → [Latest]
2. Click "Functions" tab
3. Click `/api/query/chat-summary`
4. View logs for errors

**Look for:**
```
✅ Good: "⚡ Summary (Groq) response time: 450ms"
❌ Bad: "Error: Invalid API key"
❌ Bad: "GROQ_API_KEY is not defined"
```

---

### Verify vercel.json Applied:

The latest deployment should have this configuration:

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

**To verify:**
1. Check git commit: `d56f92e`
2. In Vercel, deployment should show this commit
3. If not, manually redeploy

---

## 💡 Workaround: Test with FloatingChatWidget

If Summary/Personalized modes timeout, the **FloatingChatWidget** might still work:

1. Look for the **💬 chat bubble** (bottom right)
2. Click it to open
3. Type a question
4. This uses the fallback `/api/query/chat` endpoint

---

## ⏱️ Expected Response Times

| Scenario | Expected Time | Status |
|----------|--------------|--------|
| **First request (cold start)** | 5-10s | Normal |
| **Subsequent requests** | 0.5-3s | Normal |
| **Cached requests** | <100ms | Instant |
| **Timeout after 30s** | ERROR | Check keys |

---

## 🚨 If Still Not Working

### Option A: Switch Back to Single API

Temporarily use only Gemini (proven to work):

```bash
cd api/query
mv chat.ts chat-dual.ts
mv chat-gemini.ts chat.ts  # (if you have backup)
git add . && git commit -m "temp: revert to Gemini only"
git push
```

Then in Vercel, make sure `GEMINI_API_KEY` is set.

---

### Option B: Check API Provider Status

**Groq Status:**
- Visit: https://status.groq.com
- If down, that's the issue!

**Gemini Status:**
- Visit: https://status.cloud.google.com
- Check "AI Platform" status

---

### Option C: Regenerate API Keys

Sometimes keys get invalidated:

**Groq:**
1. https://console.groq.com → API Keys
2. Delete old key
3. Create new key
4. Update in Vercel
5. Redeploy

**Gemini:**
1. https://aistudio.google.com/app/apikey
2. Create new key
3. Update in Vercel
4. Redeploy

---

##  Alternative: Use Frontend to Test

Open browser DevTools (F12) → Network tab:

1. Click Summary/Personalized
2. Send a message
3. Watch Network tab for `/api/query/chat-summary` or `/api/query/chat-personalized`
4. Check response:
   - **200 OK + JSON**: Working! ✅
   - **504 Timeout**: API keys issue
   - **500 Error**: Check function logs

---

## ✅ Success Indicators

**You'll know it's working when:**

1. No "FUNCTION_INVOCATION_TIMEOUT" errors
2. Responses appear in 2-5 seconds
3. Actual AI-generated text (not error messages)
4. Vercel function logs show: "⚡ Summary (Groq) response time: XXXms"

---

## 📞 Next Steps

**If everything fails:**

1. Check this file: `FINAL-DEPLOYMENT-SUMMARY.md`
2. Review: `API-TEST-GUIDE.md`
3. Verify all environment variables are set
4. Try manual redeploy in Vercel dashboard
5. Wait 5 minutes after redeploy before testing

**The system IS deployed correctly - just needs API keys configured in Vercel!**
