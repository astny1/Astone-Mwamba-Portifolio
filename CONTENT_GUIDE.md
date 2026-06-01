# How to Add Blog Posts & Achievements

## Recommended: Use the visual editor (/admin)

After [Netlify CMS setup](NETLIFY_CMS_SETUP.md), go to:

**`https://your-site.netlify.app/admin/`**

Log in → edit **Blog Posts** or **Achievements** → click **Publish**. No coding required.

---

## Alternative: Edit JSON files manually

You do **not** need to edit HTML. Update simple JSON files, then refresh your site.

---

## Blog posts

**File:** `data/blog.json`

### Add a new post

1. Open `data/blog.json` in Notepad, VS Code, or Cursor.
2. Copy the block below and paste it **inside** the `"posts": [ ... ]` array (add a comma after the previous post).
3. Change the text to match your article.
4. Save the file.
5. Refresh `blog.html` in your browser.

```json
{
  "slug": "my-new-article",
  "title": "Your Article Title",
  "date": "2026-05-29",
  "tag": "Cybersecurity",
  "excerpt": "One or two sentences shown on the blog list page.",
  "content": [
    "First paragraph of your article.",
    "Second paragraph.",
    "Third paragraph."
  ]
}
```

| Field | What it means |
|--------|----------------|
| `slug` | URL name — only letters, numbers, hyphens. Example: `my-new-article` → `blog-post.html?slug=my-new-article` |
| `title` | Article headline |
| `date` | Format: `YYYY-MM-DD` |
| `tag` | Category label (e.g. Cybersecurity, Marketing) |
| `excerpt` | Short preview on the blog page |
| `body` | Full article in Markdown (preferred when using /admin) |
| `featured_image` | Cover photo path, e.g. `/images/uploads/my-photo.jpg` |
| `gallery` | Array of extra photos: `["/images/uploads/a.jpg", "/images/uploads/b.jpg"]` |
| `content` | *(legacy)* Array of paragraphs — still supported |

### Manual image paths (JSON only)

If editing JSON by hand, upload the file to `images/uploads/` first, then set:

```json
"featured_image": "/images/uploads/my-cover.jpg",
"gallery": ["/images/uploads/photo1.jpg", "/images/uploads/photo2.jpg"]
```

Achievements:

```json
"image": "/images/uploads/achievement-photo.jpg"
```

### Delete a post

Remove its `{ ... }` block from `data/blog.json` and save.

---

## Achievements

**File:** `data/achievements.json`

### Add a new achievement

1. Open `data/achievements.json`.
2. Copy this block into the `"achievements": [ ... ]` array:

```json
{
  "title": "Your Achievement Title",
  "year": "2025",
  "category": "Cybersecurity",
  "description": "Describe what you achieved and the impact."
}
```

3. Save and refresh `achievements.html`.

| Field | What it means |
|--------|----------------|
| `title` | Headline |
| `year` | Year or range (e.g. `2024` or `2023 – 2026`) |
| `category` | Label (Education, Marketing, Certification, etc.) |
| `description` | Full description |

---

## Preview locally

JSON loading requires a **local server** (opening `index.html` directly may block `fetch`).

**Option A — Python (if installed):**
```bash
cd Portifolio
python -m http.server 8080
```
Visit: http://localhost:8080

**Option B — VS Code / Cursor:**  
Install the **Live Server** extension → right-click `index.html` → Open with Live Server.

**Option C — Deploy to Netlify:**  
Drag the folder to [netlify.com](https://www.netlify.com). Blog and achievements work automatically after deploy.

---

## Visual editor (Netlify CMS)

Already included. Full setup: **[NETLIFY_CMS_SETUP.md](NETLIFY_CMS_SETUP.md)**

---

## Files overview

| What | File |
|------|------|
| Blog list page | `blog.html` |
| Single article page | `blog-post.html` (auto-loads from JSON) |
| Blog data | `data/blog.json` |
| Achievements page | `achievements.html` |
| Achievements data | `data/achievements.json` |
