# nilargha-tools

Tools hub for tools.nilargha.work

## Local development

```bash
npm install
npm start
```

## Deploy to Vercel (step by step)

### 1. Push to GitHub

```bash
cd nilargha-tools
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nilargha-tools.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com → Sign up / Log in with GitHub
2. Click **"Add New Project"**
3. Import the `nilargha-tools` repo
4. Framework preset: **Create React App** (auto-detected)
5. Click **Deploy** — done, you'll get a `.vercel.app` URL

### 3. Connect tools.nilargha.work

1. In Vercel → your project → **Settings → Domains**
2. Add `tools.nilargha.work`
3. Vercel gives you a **CNAME record**, e.g.:
   - Name: `tools`
   - Value: `cname.vercel-dns.com`
4. Go to **Namecheap → Domain List → nilargha.work → Manage → Advanced DNS**
5. Add a new CNAME record:
   - Type: `CNAME`
   - Host: `tools`
   - Value: `cname.vercel-dns.com` (use whatever Vercel gives you)
   - TTL: Automatic
6. Wait 5–10 minutes → live at tools.nilargha.work ✅

## Adding a new tool

1. Create `src/tools/yourtool/YourTool.js`
2. Add route in `src/App.js`: `<Route path="/yourtool" element={<YourTool />} />`
3. Add card in `src/pages/ToolsHub.js` TOOLS array
4. Push to GitHub → Vercel auto-deploys
