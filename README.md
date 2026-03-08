# Portfolio Website

A clean, responsive portfolio site where you can:

- Show projects
- Add project details from a form
- Insert **images** and **videos** into project cards
- Save projects in your browser with `localStorage`

## Files

- `index.html` → layout/content
- `styles.css` → design/theme/responsive styling
- `script.js` → add/delete/render projects and media handling

## How to Use

1. Open `index.html` in your browser.
2. Scroll to **Add a Project**.
3. Fill in project info.
4. Add either:
   - an image URL (e.g. `assets/my-project.png` or `https://...`), or
   - a video URL (YouTube link, embed link, or direct `.mp4/.webm/.ogg`).
5. Click **Add Project**.

## Add Local Images/Videos

You can create an `assets/` folder and put your files there:

- `assets/project1.png`
- `assets/demo1.mp4`

Then use those paths in the form (`assets/project1.png`, etc).

## Customize Quickly

- Change your name and intro text in `index.html`.
- Change colors in `styles.css` under `:root`.
- Edit default sample projects in `script.js` (`sampleProjects`).
