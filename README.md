# WildFlower Reflection Counseling LLC

A responsive, dependency-free, five-page website for Christine Kayga, LPC, LPC-S. Built with semantic HTML, CSS, and JavaScript enhancements for mobile navigation and optional decorative video.

## Local preview

From the repository root, run `python3 -m http.server 8000` and open `http://localhost:8000`. No build or package installation is required.

## Content and assets

- `index.html`: a focused welcome page with counseling and supervision previews.
- `counseling.html`: individual counseling, therapeutic approaches, and related FAQs.
- `supervision.html`: LPCC supervision and inquiry guidance.
- `christine.html`: introduction, credentials, education, professional profile links, and the final bio/mission insertion points.
- `connect.html`: counseling profile links and a dedicated supervision inquiry section.
- `styles.css`: Linen & Riverstone palette with warm linen pages (`#FBF5EA`), dusty turquoise cards and sticky header (`#D1E6E3`), and deep river-teal navigation text and buttons (`#214C50`). Keep the stylesheet URL version in sync across all five pages when refreshing cached styles.
- `script.js`: accessible mobile navigation, optional background video, and current copyright year.
- `image/Co Logo.jpg` and `image/WRC.jpg`: original supplied business logo and landscape photograph.
- `image/*.webp`: resized, metadata-stripped derivatives used by the site. The responsive hero sources avoid serving the large originals; the portrait and lower logo load lazily.

The site uses system fonts and makes no requests to external font services, analytics, or embedded booking widgets. External professional profiles open in a new tab. No client information is collected by this site.

Layouts adapt to phones, tablets, and desktops, with 44-pixel primary touch targets, a keyboard-operable mobile menu, native expandable FAQs, and reduced-motion support. Navigation and FAQs remain usable without JavaScript.

## Hero photos

Each hero shows the full photo without a gradient, tint, or crop. The image sits beside the copy on desktop and above it at widths of 800px and below.

Each photo has a page-specific filename prefix:

| Page | Filename prefix | Photo |
| --- | --- | --- |
| `index.html` | `home` | Mountain wildflowers |
| `christine.html` | `christine` | Evergreen trail |
| `counseling.html` | `counseling` | Alpine lake |
| `supervision.html` | `supervision` | Autumn aspens |
| `connect.html` | `connect` | Mountain ridgelines |

For replacements, export metadata-stripped 640px, 1200px, and 1600px WebP versions without changing the original aspect ratio. Update the page's `.hero-photo` intrinsic dimensions to match the fallback source, keeping `alt=""` for these decorative photos.

## Optional background videos

Every page has one video-ready hero frame. Until approved footage is supplied, `data-src=""` remains empty: the responsive photo is displayed, the video control is hidden, and no video requests are made. Keep all essential meaning in the page text, not the decorative footage.

To enable a page's video:

1. Add a licensed, locally hosted MP4 (H.264 for broad compatibility), for example `video/counseling.mp4`. Use a short, gentle, seamless loop with no flashes, text, or audio track. Aim for 720p and no more than 2 MB; review loading on a real mobile connection before publishing.
2. In that page's `<video>` element, set `data-src="video/counseling.mp4"`. Do not add `src`, `<source>`, or `autoplay`: JavaScript attaches the source only when playback is allowed. Each page can use different footage.
3. Keep the responsive `<img>` in the same frame as the always-available fallback. Maintain empty alternative text for decorative images, and update the dimensions and responsive sources to match the new still.

Video is muted, looping, inline, and decorative. Playback is attempted only while the frame is in view and the tab is visible. A visible, keyboard-accessible Play/Pause control lets visitors stop motion; a manual pause is preserved when scrolling or switching tabs.

Reduced-motion and browser-reported data-saving preferences prevent automatic video loading and playback. Visitors can explicitly choose Play to load it anyway. Preference changes stop motion and restore the image. Autoplay denial or media errors restore the image and display an explanatory status with a retry option. With JavaScript disabled, only the image is shown.

No videos are bundled or enabled yet. The page layouts reserve their dimensions, so adding footage does not shift content.

## Checks

Run `node --test tests/background-video.test.cjs` for focused video-loading, preference, pause/resume, error-fallback, and interrupted-playback tests. No dependencies are required.

## Before launch

- Obtain Christine's approval of all copy and add her final first-person bio and mission statement. The insertion points are marked in `christine.html`; no mission statement has been invented.
- Confirm her preferred counseling intake route and supervision contact route. The initial version links to her supplied professional profiles, without claiming availability or a confirmed booking workflow.
- Confirm location, service area, session format, fees, insurance, licensing information, and any required legal disclosures before adding them.
- Confirm permission to publish the supplied images.
- Choose hosting and a domain. Any static host can serve this repository directly; for GitHub Pages, select the `main` branch and repository root after the site changes are merged.
