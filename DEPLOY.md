# 🚀 Deployment Guide

## Quick Deploy to GitHub

### Step 1: Create a GitHub Repository

Option A - Using GitHub CLI (if installed):
```bash
gh repo create house-intelligence-platform --public --source=. --push
```

Option B - Manual:
1. Go to https://github.com/new
2. Name: `house-intelligence-platform`
3. Make it Public
4. Don't initialize with README
5. Click "Create repository"
6. Run the commands shown on GitHub, or use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/house-intelligence-platform.git
git branch -M main
git push -u origin main
```

---

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd house-intelligence-app
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: house-intelligence-platform
# - Directory: ./
```

### Option 2: GitHub Integration (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Vercel will auto-detect settings from `vercel.json`
4. Click "Deploy"

---

## Deploy to Netlify

### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd house-intelligence-app
netlify deploy --prod

# Follow prompts to link site
```

### Option 2: GitHub Integration (Recommended)

1. Go to https://app.netlify.com/start
2. Connect to GitHub
3. Select your repo
4. Build settings will auto-detect from `netlify.toml`
5. Click "Deploy site"

---

## Environment Variables

After deploying, set these environment variables in your hosting platform:

### Required for Production:

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps integration | https://developers.google.com/maps/documentation/javascript/get-api-key |
| `NODE_ENV` | Set to `production` | - |
| `PORT` | Server port (usually auto-set) | - |

### Optional (for enhanced data):

| Variable | Description |
|----------|-------------|
| `DOMAIN_API_KEY` | Domain.com.au API |
| `REA_API_KEY` | RealEstate.com.au API |
| `NEARMAP_API_KEY` | Aerial imagery API |

---

## Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] Dashboard displays property data
- [ ] Questionnaire form works
- [ ] Estimate page shows budget
- [ ] Contractor page loads
- [ ] Set up custom domain (optional)
- [ ] Configure environment variables

---

## Troubleshooting

### Build Fails
```bash
# Check build locally
npm install
npm start
```

### Port Issues
The app uses `process.env.PORT` - hosting platforms will auto-set this.

### EJS Templates Not Loading
Make sure the `src/views` directory is included in the deployment.

---

## Free Tier Limits

### Vercel Free
- 100GB bandwidth/month
- 6000 execution hours/month
- Perfect for this app

### Netlify Free
- 100GB bandwidth/month
- 300 build minutes/month
- Great for static + serverless

---

**Ready to deploy!** 🎉
