# Content Manager (Decap CMS) Setup

Editor URL: **https://astonemwambaportfolio.netlify.app/admin/**

---

## Fix login (Git Gateway 503 / repo errors)

Your CMS uses **Netlify Identity + Git Gateway**. If login fails or DevTools shows `503` / “Problem fetching repo data from Git Gateway”, reconnect Git Gateway:

1. Open [Netlify](https://app.netlify.com) → your site  
2. **Project configuration** → **Identity** → **Services** → **Git Gateway**  
3. Click **Edit settings** (or Disable, then **Enable Git Gateway** again)  
4. Generate / confirm a new access token so Netlify can reach GitHub  
5. Also confirm the site is linked to repo `astny1/Astone-Mwamba-Portifolio`:  
   **Project configuration** → **Build & deploy** → **Continuous deployment** → repository is linked  

Then:

1. Open **https://astonemwambaportfolio.netlify.app/admin/**  
2. Hard refresh (`Ctrl+Shift+R`)  
3. Click **Login with Netlify Identity**  
4. Use the email/password from your Netlify Identity invite  

If you never accepted an invite: **Identity** → **Invite users** → invite yourself → accept the email.

---

## Optional: GitHub OAuth (not required)

This repo also has `/auth` + `/callback` functions and env vars `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` for a direct GitHub login backend. That path can fail in **Microsoft Edge** when Tracking Prevention blocks `api.github.com`. Prefer Identity + Git Gateway above.

---

## After login

- **Blog Posts** / **Achievements** → edit → **Publish**  
- Netlify rebuilds in about 1–2 minutes  

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `503` on `/.netlify/git/github/...` | Re-enable Git Gateway / regenerate token (steps above) |
| `%{details}` toast | Use `/admin/` only; accept Identity invite |
| Edge blocks GitHub API | Use Identity login (default), or try Chrome |
| Changes don’t show | Wait for Netlify deploy to finish |
