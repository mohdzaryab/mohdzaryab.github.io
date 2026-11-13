// All site copy lives here — edit this file to update the portfolio.

export const profile = {
  name: 'Mohammad Zaryab',
  first: 'Mohammad',
  last: 'Zaryab',
  role: 'Product Engineer',
  company: 'Dashverse',
  companyUrl: 'https://dashverse.ai',
  location: 'India',
  timezone: 'Asia/Kolkata',
  email: 'mohammadzaryab0@gmail.com',
  socials: [
    { label: 'GitHub', url: 'https://github.com/mohdzaryab' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/mohammad-zaryab-52a190173/' },
    { label: 'Instagram', url: 'https://instagram.com/mohdzaryab/' },
  ],
};

export const marquee = [
  'Product engineering',
  'React & TypeScript',
  'AI video tooling',
  'Swift & macOS',
  'WebGL & motion',
  'Node',
  'Agents & LLMs',
  'Design-minded UX',
];

export const now = {
  title: 'Dashverse',
  role: 'Product Engineer',
  blurb:
    'I build product end to end at Dashverse, where we make generative storytelling tools. Most of my time goes into Frameo, an AI video production studio for short films, micro-dramas and ads. That means the timeline editor, review workflows, and the details that make creators move fast.',
  products: [
    { name: 'Frameo', desc: 'AI video production studio', url: 'https://frameo.ai' },
    { name: 'Dashtoon', desc: 'AI-powered comics platform', url: 'https://dashtoon.com' },
  ],
};

export type Project = {
  name: string;
  year: string;
  kind: string;
  desc: string;
  tags: string[];
  url?: string;
  linkLabel?: string;
  media?: { video?: string; poster?: string; image?: string };
  hue: number; // drives the generative card art
  glyph: string;
};

export const projects: Project[] = [
  {
    name: 'Looksee',
    year: '2026',
    kind: 'macOS app · Open source',
    desc: 'Look at a monitor and focus follows. Camera-driven window switching for multi-monitor Macs. Uses on-device Vision head-pose and gaze estimation, a calibrated classifier and Accessibility APIs.',
    tags: ['Swift', 'Vision', 'AVFoundation', 'AppKit'],
    url: 'https://github.com/mohdzaryab/looksee',
    linkLabel: 'View on GitHub',
    media: { video: '/media/looksee.mp4', poster: '/media/looksee.jpg' },
    hue: 265,
    glyph: '◉',
  },
  {
    name: 'Overlyric',
    year: '2026',
    kind: 'Open-source contributions',
    desc: 'Floating, synced lyrics on your Mac screen. I added YouTube-in-Chrome playback detection, per-song timing nudges, romanized-lyrics preference and multi-monitor drag fixes, and sent them upstream as 4 PRs.',
    tags: ['Swift', 'ScriptingBridge', 'LRC'],
    url: 'https://github.com/mohdzaryab/overlyric',
    linkLabel: 'See the fork',
    hue: 320,
    glyph: '♪',
  },
  {
    name: 'Reword',
    year: '2026',
    kind: 'macOS menu-bar tool',
    desc: 'Select text anywhere, hit ⌃⌥R, and Claude streams a rewrite that pastes right back over your selection. Built on the Claude Agent SDK.',
    tags: ['Swift', 'Claude Agent SDK', 'Accessibility'],
    hue: 22,
    glyph: '✎',
  },
  {
    name: 'Daybar',
    year: '2026',
    kind: 'macOS menu-bar calendar',
    desc: 'A calendar that lives in the menu bar: next meeting at a glance, one-click Join, world clocks with time travel, and full-screen alerts so you never miss a call.',
    tags: ['SwiftUI', 'EventKit', 'AppKit'],
    hue: 190,
    glyph: '◷',
  },
  {
    name: 'Clipbar',
    year: '2026',
    kind: 'macOS clipboard manager',
    desc: 'Clipboard history in a floating, non-activating panel on ⇧⌘V, with keyboard-first search and auto-paste.',
    tags: ['Swift', 'AppKit'],
    hue: 150,
    glyph: '⧉',
  },
];

export const archive = [
  {
    name: 'Appetizer',
    year: '2021',
    org: 'MDG, IIT Roorkee',
    desc: 'Official mess app of IIT Roorkee: weekly menus, feedback and more.',
    tags: 'React · TypeScript · Redux',
    image: '/media/appetizer.webp',
  },
  {
    name: 'QuickChat',
    year: '2020',
    org: 'Startup',
    desc: 'Realtime chat without the account friction.',
    tags: 'React · Node · Redis',
    image: '/media/quickchat.webp',
  },
  {
    name: 'SilentMe',
    year: '2019',
    org: 'Personal',
    desc: 'Android app that silences your phone by location using geofences.',
    tags: 'Kotlin · Geofencing',
    url: 'https://github.com/mohdzaryab/silent_me',
    image: '/media/silentme.webp',
  },
  {
    name: 'BurgerBuilder',
    year: '2020',
    org: 'Personal',
    desc: 'Build-your-own burger with auth and realtime orders.',
    tags: 'React · Redux · Firebase',
    url: 'https://github.com/mohdzaryab/burger_builder',
    image: '/media/burger.webp',
  },
];

export const offscreen = [
  { emoji: '🎤', text: 'I sing' },
  { emoji: '📝', text: 'I write poems & songs' },
  { emoji: '🏍️', text: 'Certified travel freak' },
];
