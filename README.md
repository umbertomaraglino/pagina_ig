# IGPage

> Your Instagram profile, without Instagram.

The best part of Instagram is the profile — it's a visual diary you can scroll through to relive memories. Everything else (the feed, the reels, the infinite scroll) is just noise. IGPage keeps only the good part: a personal, password-protected profile page you can open anytime, anywhere, and share with anyone — even people who don't have an Instagram account.

**Live demo:** [umbertomaraglino.github.io/pagina_ig](https://umbertomaraglino.github.io/pagina_ig)

---

## Screenshots

<p align="center">
  <img src="foto/Screenshot%202026-10-13%20091634.png" width="280" alt="Login screen" />
  &nbsp;&nbsp;
  <img src="foto/WhatsApp%20Image%202026-10-13%20at%2011.04.22.jpeg" width="180" alt="Profile page" />
  &nbsp;&nbsp;
  <img src="foto/WhatsApp%20Image%202026-10-13%20at%2011.04.22%20(1).jpeg" width="180" alt="Post with music" />
  &nbsp;&nbsp;
  <img src="foto/WhatsApp%20Image%202026-10-13%20at%2011.04.22%20(2).jpeg" width="180" alt="Story viewer" />
</p>

---

## What it does

- **Password-protected** — only you (and who you share the link with) can see it
- **Profile & bio** — avatar, username, custom bio
- **Posts** — photo grid with multi-image carousels, captions, likes, and comments
- **Highlights** — story collections with fullscreen viewer (like Instagram Stories)
- **Music** — attach a 30-second Deezer preview to any post or story; it autoplays when opened
- **Full editing** — add/remove photos, change captions, swap music, delete posts and stories
- **Image editor** — crop, zoom, and rotate photos before uploading stories
- **Dark mode** — follows system preference, togglable manually
- **Mobile-first** — designed to feel like a native app on iPhone

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (dark mode) |
| Database & Storage | Supabase (PostgreSQL + Storage buckets) |
| Music API | Deezer, proxied via Supabase Edge Function (Deno) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (auto-deploy on push to `main`) |

The Supabase Edge Function is the key piece that makes music search work: the browser calls the Supabase domain (no CORS issues), and the function fetches from Deezer server-side.

---

## Why I built this

Instagram's profile page is the one feature worth keeping — it's a memory machine. But using Instagram just to look at your own profile means dealing with an algorithm designed to keep you scrolling. IGPage is a self-hosted, distraction-free version of just that one page: yours, private, always accessible, no app required.
