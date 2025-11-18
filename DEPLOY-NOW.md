# 🚀 Deploy to Vercel - Simple Steps

## ✅ Run These Commands (Copy & Paste)

```bash
# Step 1: Go to book-source folder
cd book-source

# Step 2: Deploy to Vercel
npx vercel --prod

# That's it! Vercel will give you a URL
```

## 📝 What Will Happen

1. Vercel will ask: **"Set up and deploy?"** → Press **Enter** (Yes)
2. Vercel will ask: **"Which scope?"** → Press **Enter** (your account)
3. Vercel will ask: **"Link to existing project?"** → Press **Enter** (Yes)
4. Vercel will ask: **"What's your project name?"** → Type your project name or press **Enter**
5. Vercel will build and deploy (takes 2-3 minutes)
6. You'll get a URL like: `https://your-project.vercel.app`

## 🌐 How to View Your Spec

Once deployed, open:
```
https://your-project.vercel.app/docs/99-Feature-Specs/001-content-mode-tabs/
```

Replace `your-project` with your actual Vercel project name.

## 🔍 Find Your Project Name

Don't know your project name? Check:
```bash
cat book-source/.vercel/project.json
```

---

**Just run: `cd book-source && npx vercel --prod`**

That's the simplest way! 🚀
