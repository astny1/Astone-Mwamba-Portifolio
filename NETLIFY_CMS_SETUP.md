# Content Manager (Decap CMS) Setup

Use the visual editor at **`https://astonemwambaportfolio.netlify.app/admin/`** to add blog posts and achievements.

Netlify’s old shared login (`api.netlify.com/auth`) and Git Gateway are broken/deprecated. This site uses **GitHub login through Netlify Functions** instead.

---

## One-time setup (required)

### 1. Create a GitHub OAuth App

1. Open [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers) → **New OAuth App**.
2. Fill in:
   - **Application name:** `Astone Portfolio CMS` (any name)
   - **Homepage URL:** `https://astonemwambaportfolio.netlify.app`
   - **Authorization callback URL:** `https://astonemwambaportfolio.netlify.app/callback`
3. Click **Register application**.
4. Copy the **Client ID**.
5. Click **Generate a new client secret** and copy the **Client Secret** (shown once).

### 2. Add secrets in Netlify

1. Open [Netlify](https://app.netlify.com) → your site → **Project configuration** → **Environment variables**.
2. Add:
   - `GITHUB_CLIENT_ID` = your Client ID
   - `GITHUB_CLIENT_SECRET` = your Client Secret
3. Trigger a new deploy (**Deploys** → **Trigger deploy** → **Deploy site**) so the functions pick up the variables.

### 3. Log in

1. Open **https://astonemwambaportfolio.netlify.app/admin/**
2. Hard refresh (`Ctrl+Shift+R`)
3. Click **Login with GitHub** (allow the popup)
4. Approve access for your account (`astny1`)

You must use the GitHub account that can push to `astny1/Astone-Mwamba-Portifolio`.

---

## After login

- **Blog Posts** — add/edit/delete articles  
- **Achievements** — add/edit/delete milestones  
- **Publish** saves to GitHub; Netlify rebuilds in about 1–2 minutes  

Images go to `images/uploads/` (keep each file under ~500 KB when possible).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `api.netlify.com/auth` → Not Found | Expected — use this repo’s `/auth` flow and set the env vars above |
| Missing `GITHUB_CLIENT_ID` | Add both env vars in Netlify, then redeploy |
| Login popup blocked | Allow pop-ups for the Netlify site |
| Wrong callback error from GitHub | Callback URL must be exactly `https://astonemwambaportfolio.netlify.app/callback` |
| Changes don’t show on the site | Wait for the Netlify deploy to finish |

---

## Local preview (content only)

```bash
python -m http.server 8080
```

Open http://localhost:8080 — GitHub login for `/admin` only works on the deployed Netlify site (functions + OAuth secrets).
