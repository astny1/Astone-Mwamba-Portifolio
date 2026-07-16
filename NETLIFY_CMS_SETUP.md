# Netlify CMS Setup Guide

Use the visual editor at **`yoursite.com/admin/`** to add blog posts and achievements — no JSON editing required.

---

## What you need

1. A **GitHub** account (free)
2. A **Netlify** account (free) — [netlify.com](https://www.netlify.com)
3. Your portfolio folder pushed to a GitHub repository

---

## Step 1 — Put your site on GitHub

1. Create a new repository on GitHub (e.g. `astone-portfolio`).
2. Upload your entire `Portifolio` folder, or use Git:

```bash
cd Portifolio
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/astone-portfolio.git
git push -u origin main
```

---

## Step 2 — Deploy on Netlify

1. Log in to [Netlify](https://app.netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and select your repository.
4. Build settings:
   - **Build command:** leave empty
   - **Publish directory:** `.` (root)
5. Click **Deploy site**.
6. Wait until the deploy finishes. Note your URL (e.g. `https://astone-portfolio.netlify.app`).

---

## Step 3 — Update CMS config with your real URL

1. Open `admin/config.yml` in your project.
2. Replace `https://your-site-name.netlify.app` with your actual Netlify URL in:
   - `site_url`
   - `display_url`
3. Commit and push to GitHub (Netlify will redeploy automatically).

```yaml
site_url: https://astone-portfolio.netlify.app
display_url: https://astone-portfolio.netlify.app
```

---

## Step 4 — Point the CMS at your GitHub repo

In `admin/config.yml`, the backend should look like this (already set for this project):

```yaml
backend:
  name: github
  repo: YOUR_USERNAME/YOUR_REPO
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth
  site_domain: your-site-name.netlify.app
```

Your GitHub account must have **write access** to that repository (you own it, so you’re fine).

---

## Step 5 — Log in and edit content

1. Visit **`https://YOUR-SITE.netlify.app/admin/`**
2. Click **Login with GitHub** and approve access (allow pop-ups for the site).
3. You will see:
   - **Blog Posts** — add, edit, delete articles
   - **Achievements** — add, edit, delete milestones
4. After you click **Publish**, changes are saved to GitHub and Netlify rebuilds your site (usually 1–2 minutes).

---

## How to upload photos

Images are saved to **`images/uploads/`** on your site when you publish.

### Blog posts — 3 ways to add photos

1. **Cover Photo** — main image at the top of the article and on the blog list.
2. **Additional Photos** — gallery shown below the article (click **Add** for each photo).
3. **Inside the article** — in **Article Body**, click the **image icon** in the toolbar to insert a photo inline.

### Achievements

Use the **Photo** field when editing an achievement.

### Tips for small file sizes (KB not MB)

- Resize photos before upload (e.g. 1200px wide is enough for web).
- Use **JPG** for photos, **PNG** for graphics with text.
- Aim for **under 500 KB** per image so the site loads fast on mobile data in Zambia.
- Free tools: [Squoosh](https://squoosh.app), TinyPNG, or phone “resize image” apps.

---

## How to write a blog post in /admin

| Field | What to enter |
|--------|----------------|
| URL Slug | `my-post-title` (lowercase, hyphens only) |
| Title | Headline |
| Publish Date | Date shown on the site |
| Category Tag | Cybersecurity, Marketing, etc. |
| Short Excerpt | Preview text on the blog list |
| Cover Photo | *(optional)* Main image — upload from your computer |
| Additional Photos | *(optional)* Extra gallery images |
| Article Body | Full post (Markdown + inline images via toolbar) |

Click **Publish** when done.

---

## How to add an achievement

| Field | What to enter |
|--------|----------------|
| Title | Achievement name |
| Year | `2024` or `2023 – 2026` |
| Category | Type of achievement |
| Description | What you accomplished |

---

## Test locally before deploying (optional)

**Terminal 1** — run the site:
```bash
cd Portifolio
python -m http.server 8080
```

**Terminal 2** — run the CMS backend:
```bash
npx decap-server
```

Open http://localhost:8080/admin/ — you can test the editor locally (changes won’t go to GitHub until deployed with Identity enabled).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `503` / “Problem fetching repo data from Git Gateway” | This project uses **GitHub login** now — hard refresh `/admin/` after deploy; click **Login with GitHub** |
| Login popup blocked | Allow pop-ups for your Netlify site, then try again |
| Red error toast shows `%{details}` | Use `/admin/` only; `site_url` must include `https://` in `admin/config.yml` |
| URL looks like `/admin/yoursite.netlify.app` | Open `https://yoursite.netlify.app/admin/` (full URL with `https://`) |
| Changes don’t appear on site | Wait for Netlify deploy to finish (check **Deploys** tab) |
| `branch: main` error | If your GitHub branch is `master`, change `branch: main` to `branch: master` in `admin/config.yml` |
| Blog page empty locally | Use `python -m http.server` — don’t open HTML files directly |
| 404 on /admin | Ensure `admin/index.html` and `admin/config.yml` are in your repo |

---

## Still edit JSON manually?

You can still edit `data/blog.json` and `data/achievements.json` directly. The CMS and JSON use the same files — don’t edit both at the same time while publishing from /admin.

See also: [CONTENT_GUIDE.md](CONTENT_GUIDE.md)
