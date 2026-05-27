# AIonOS Aviation AI Agents Demo

GitHub Pages-ready codebase for a 3-minute narrated aviation AI agents demo using the supplied MP4 as the accelerated, muted background video.

## What is included

- `index.html` — single-page executive demo
- `styles.css` — transparent hero widget, active AI agent widget, graphs, equations and cinematic overlay
- `script.js` — 180-second synchronized timeline, video acceleration, widgets and fallback browser narration
- `data/scenes.json` — all scenes and AI agents from slides 7 and 8
- `assets/videos/aviation-ai-background-fast.mp4` — supplied background MP4
- `assets/audio/narration.txt` — narration script
- GitHub Actions:
  - Deploy GitHub Pages
  - Generate narration MP3
  - Render final narrated MP4 artifact

## How to upload on GitHub web

1. Create a new GitHub repository.
2. Upload every file and folder from this zip into the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, select **GitHub Actions**.
5. Open **Actions → Deploy GitHub Pages → Run workflow**.
6. Open the Pages URL and click **Start Demo**.

## How to create the final narrated MP4 from GitHub

1. Open **Actions → Generate narration MP3 → Run workflow**.
2. After it completes, open the workflow run and copy the Run ID from the URL.
3. Open **Actions → Render narrated MP4 → Run workflow**.
4. Paste the narration Run ID.
5. Download the artifact named `aviation-ai-agents-demo-narrated-mp4`.

## Notes

- The original MP4 audio is always muted in the browser.
- The supplied 566.616-second MP4 has been pre-accelerated into a muted ~3-minute web asset so it can be uploaded through GitHub web without large-file issues.
- If the generated MP3 has not been added, the live web demo uses browser speech synthesis as a fallback.
