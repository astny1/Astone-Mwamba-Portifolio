# Astone Mwamba — Portfolio

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| Blog | `blog.html` |
| Single blog post | `blog-post.html?slug=your-slug` |
| Achievements | `achievements.html` |

## Add blog posts & achievements

### Option A — Visual editor (recommended)

1. Deploy to Netlify + GitHub and finish Identity / Git Gateway steps in **NETLIFY_CMS_SETUP.md**
2. Open **`yoursite.com/admin/`** and log in with Netlify Identity
3. Edit Blog or Achievements → **Publish**

Setup guide: **[NETLIFY_CMS_SETUP.md](NETLIFY_CMS_SETUP.md)**

### Option B — Edit JSON files

- **Blog:** `data/blog.json`
- **Achievements:** `data/achievements.json`

Guide: **[CONTENT_GUIDE.md](CONTENT_GUIDE.md)**

## Preview locally

```bash
python -m http.server 8080
```

Open http://localhost:8080

## Deploy

Upload the folder to [Netlify](https://www.netlify.com/) — blog and achievements work automatically.

## CV & portfolio links

**Portfolio** — edit the link in `index.html` (hero “Graphic Design Portfolio” button).

**CV** — paste your Google Drive view link in `js/site.js`:

```javascript
const CV_GOOGLE_DRIVE_URL = 'https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing';
```

Replace `YOUR_FILE_ID` with the ID from your Drive share URL. CV opens in a new tab (view only), on every page that has a CV button.
