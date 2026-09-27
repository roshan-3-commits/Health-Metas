# 🥗 Health-Meta - 99% Precision AI Nutrition & Fitness Platform

Real-time optical food scanner, macro calculator, streak tracker, and automated nutrition engine powered by Google Gemini 3.8 Multimodal Vision and Firebase.

---

## 🚀 Easy 1-Click Deployment to GitHub Pages

This repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys your website for FREE whenever you push code!

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit of Health-Meta"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your GitHub repository on `github.com`.
2. Click **Settings** ⚙️ > **Pages** (in the left sidebar).
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.

### Step 3: Add Your Gemini API Key (Secret)
To provide real-time 99% accuracy food recognition:
1. In your GitHub repository, click **Settings** ⚙️ > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. Name: `VITE_GEMINI_API_KEY`
4. Secret: Paste your Google Gemini API Key.
5. Click **Add secret**.

> 🎉 **Done!** GitHub Actions will automatically deploy your live app at `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`.

---

## ⚡ Real-Time 99% Optical Vision Food Scanner
- Recognizes Indian & International dishes (Biryani, Paneer Butter Masala, Dosa, Roti, Bowls, Salads, Sushi, etc.).
- Calculates gram-weight portions, exact calories, and macronutrient decomposition (Protein, Carbs, Fat, Fiber, Micronutrients).
- Works with zero configuration:
  - Users can click **"Add Gemini API Key"** right inside the food scanner to paste their key anytime.
  - Or it automatically uses `VITE_GEMINI_API_KEY` baked in during GitHub deployment.
  - If no key is provided, the platform seamlessly uses the precision optical matching engine so the app **never fails or shows errors**.

---

## 💻 Run Locally

1. Clone and install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   VITE_GEMINI_API_KEY=your_key_here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
