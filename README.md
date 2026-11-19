# WildFlower Reflection Counseling LLC

A responsive, dependency-free website for Christine Kayga, LPC, LPC-S. Built with semantic HTML, CSS, and a small JavaScript enhancement for mobile navigation.

## Local preview

From the repository root, run `python3 -m http.server 8000` and open `http://localhost:8000`. No build or package installation is required.

## Content and assets

- `index.html`: services, approaches, credentials, bio area, FAQs, and professional profile links.
- `styles.css`: earthy cream, forest green, and turquoise visual system and responsive layouts.
- `script.js`: accessible mobile navigation and current copyright year.
- `image/Co Logo.jpg` and `image/WRC.jpg`: original supplied business logo and landscape photograph.
- `image/*.webp`: resized, metadata-stripped derivatives used by the site. Responsive hero sources keep the original 2.8 MB photograph off the mobile loading path; the lower logo loads lazily.

The site uses system fonts and makes no requests to external font services, analytics, or embedded booking widgets. External professional profiles open in a new tab. No client information is collected by this site.

Layouts adapt to phones, tablets, and desktops, with 44-pixel primary touch targets, a keyboard-operable mobile menu, native expandable FAQs, and reduced-motion support. Navigation and FAQs remain usable without JavaScript.

## Before launch

- Obtain Christine's approval of all copy and add her final first-person bio, mission statement, and professional portrait if supplied. The bio insertion point is marked in `index.html`; no mission statement has been invented.
- Confirm her preferred counseling intake route and supervision contact route. The initial version links to her supplied professional profiles, without claiming availability or a confirmed booking workflow.
- Confirm location, service area, session format, fees, insurance, licensing information, and any required legal disclosures before adding them.
- Confirm permission to publish the supplied images.
- Choose hosting and a domain. Any static host can serve this repository directly; for GitHub Pages, select the `main` branch and repository root after the site changes are merged.
