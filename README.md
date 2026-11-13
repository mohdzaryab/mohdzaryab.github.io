# mohdzaryab.github.io

My personal portfolio, live at **https://mohdzaryab.github.io**.

Built with [Astro](https://astro.build), [Three.js](https://threejs.org) (a raymarched, cursor-reactive metaball shader in the hero), [GSAP](https://gsap.com) + ScrollTrigger and [Lenis](https://lenis.darkroom.engineering) smooth scrolling. No UI framework; the shipped JS is just the hero and the interactions.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Edit content

All copy (bio, projects, archive, links) lives in [`src/data.ts`](src/data.ts). Media goes in `public/media/`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.
The original 2021 React site is preserved on the `gh-pages` branch.
