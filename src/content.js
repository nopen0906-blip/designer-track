/* ============================================================================
   EDIT EVERYTHING HERE.
   ----------------------------------------------------------------------------
   This is the ONLY file you need to touch to change the website's words,
   projects, images, and links. Change the text inside the quotes "like this".
   Don't remove the quotes, commas, or brackets. Save the file and the site
   updates automatically.

   To swap an image: drop your file into  src/assets/  then change the
   import line at the top (e.g. change campaign1.png to your-photo.png).
============================================================================ */

// --- IMAGES (put new photos in src/assets, then update these two lines) ---
import exteriorPhoto from './assets/campaign1.png'; // big dramatic exterior
import interiorPhoto from './assets/campaign2.png'; // concrete interior
import proj1 from './assets/project-1.jpg';
import proj2 from './assets/project-2.jpg';
import proj3 from './assets/project-3.jpg';
import proj4 from './assets/project-4.jpg';
import proj5 from './assets/project-5.jpg';
import proj6 from './assets/project-6.jpg';
import proj7 from './assets/project-7.jpg';
import proj8 from './assets/project-8.jpg';
import proj9 from './assets/project-9.jpg';
import proj10 from './assets/project-10.jpg';

export const content = {

  // ---- BRAND ----
  brand: {
    name: 'Designer Tract',
    architect: 'Saiyed Mukhatyarali',
    role: 'Architect',
  },

  // ---- TOP NAVIGATION (label = what shows, href = where it jumps) ----
  // Tip: "/work" opens the full Work page. A "#name" jumps to that section on the home page.
  nav: [
    { label: 'Work', href: '/work' },
    { label: 'Studio', href: '#studio' },
    { label: 'Practice', href: '#practice' },
    { label: 'Contact', href: '#contact' },
  ],

  // ---- HERO (the first thing visitors see) ----
  hero: {
    eyebrow: 'Studio for Architecture — Est. 2014',
    // Use a slash "/" to force a line break in the big headline.
    headline: 'Spaces shaped / by the way / light moves.',
    sub: 'A practice working at the intersection of concrete, climate and craft — designing residences that feel inevitable.',
    ctaPrimary: { label: 'View all work', href: '/work' },
    ctaSecondary: { label: 'Start a project', href: '#contact' },
    image: exteriorPhoto,
    imageCaption: 'Veil House — Western Ghats, IN',
  },

  // ---- STATEMENT / MANIFESTO ----
  statement: {
    label: 'Statement',
    text: 'We design from the inside out — beginning with how a room is used, how the sun crosses it, and how it weathers over decades. Every project is a negotiation between site, material and silence.',
  },

  // ---- WORK PAGE (the dedicated /work page header) ----
  workPage: {
    label: 'Portfolio',
    title: 'Selected & ongoing work.',
    intro: 'A complete index of built and in-progress projects, from private residences to cultural and commercial commissions.',
  },

  // ---- SELECTED WORK ----
  // The HOME page shows only the projects marked `featured: true` (or the first 3).
  // The /work page shows EVERY project below. Add as many as you like.
  work: {
    label: 'Selected Work',
    title: 'A register of built and ongoing projects.',
    viewAllLabel: 'View all work',
    projects: [
      {
        no: '01', name: 'Royal Plaza', type: 'Commercial Complex', image: proj1, featured: true,
        blurb: 'A sprawling modern commercial complex featuring striking geometric facades and expansive retail spaces.'
      },
      {
        no: '02', name: 'Abstract Pavilion', type: 'Private Residence', image: proj2, featured: true,
        blurb: 'A contemporary luxury residence defined by its dark metal screens, intricate geometric patterns, and warm ambient lighting.'
      },
      {
        no: '03', name: 'Tropical Minimalist House', type: 'Private Residence', image: proj3, featured: true,
        blurb: 'A crisp, white two-story minimalist home with timber accents, a sleek portico, and framed by towering palm trees.'
      },
      {
        no: '04', name: 'The Terracotta House', type: 'Private Residence', image: proj4,
        blurb: 'A stunning blend of white stucco and textured terracotta blocks, creating a warm, inviting residential facade.'
      },
      {
        no: '05', name: 'Geometric Manor', type: 'Estate', image: proj5,
        blurb: 'An architectural statement featuring overlapping rectangular volumes and a signature tree motif stencil.'
      },
      {
        no: '06', name: 'Valley Retreat', type: 'Private Residence', image: proj6,
        blurb: 'A quiet hillside retreat integrating local stone with clean modern lines.'
      },
      {
        no: '07', name: 'Urban Sanctuary', type: 'Townhouse', image: proj7,
        blurb: 'A dense urban lot transformed into a private oasis with vertical gardens and layered concrete.'
      },
      {
        no: '08', name: 'The Glass Pavilion', type: 'Cultural', image: proj8,
        blurb: 'A translucent exhibition space designed to blur the boundary between indoors and the surrounding park.'
      },
      {
        no: '09', name: 'Canyon Residence', type: 'Private Residence', image: proj9,
        blurb: 'Cantilevered living spaces that project over the valley, offering uninterrupted panoramic views.'
      },
      {
        no: '10', name: 'Modern Courtyard', type: 'Estate', image: proj10,
        blurb: 'A reinterpretation of the traditional courtyard house, wrapping living spaces around a central water feature.'
      }
    ],
  },

  // ---- PRACTICE / CAPABILITIES ("This is the work we do") ----
  // Each item is one service/discipline the studio offers. Add or remove freely.
  practice: {
    label: 'Capabilities',
    title: 'This is the work we do.',
    intro: 'A full-service architecture and engineering practice — we take a project from the first site visit to the final handover.',
    items: [
      { no: '01', name: 'Architectural Design', text: 'Concept through to detailed design for residential, cultural and commercial buildings.' },
      { no: '02', name: 'Structural Engineering', text: 'Efficient, expressive structures coordinated with the architecture from the first sketch.' },
      { no: '03', name: 'Interior Architecture', text: 'Interiors resolved as part of the building — light, material, joinery and proportion.' },
      { no: '04', name: 'Site & Landscape Planning', text: 'Reading topography, climate and access to settle each building correctly on its land.' },
      { no: '05', name: 'Construction Documentation', text: 'Drawings and details precise enough to build from without ambiguity on site.' },
      { no: '06', name: 'Project Delivery', text: 'Tendering, contractor coordination and site supervision through to handover.' },
    ],
  },

  // ---- STUDIO / ABOUT ----
  studio: {
    label: 'The Studio',
    title: 'Designer Tract is an architecture practice led by Saiyed Mukhatyarali.',
    body: 'Founded on the belief that good architecture is quiet, we work on a deliberately limited number of residential and cultural projects each year. Our drawings are made by hand and resolved in concrete.',
    stats: [
      { value: '20+', label: 'Years experience' },
      { value: '500+', label: 'Projects delivered' },
    ],
    image: interiorPhoto,
  },

  // ---- CONTACT ----
  contact: {
    label: 'Contact',
    title: 'Have a site? Let’s talk.',
    text: 'We take on a handful of new commissions each year. Tell us about the place and the people who’ll live there.',
    email: 'studio@designertract.com',
    phone: '+91 8200416549',
    address: 'Studio 04, Old Mill Compound, Pune, India',
  },

  // ---- FOOTER ----
  footer: {
    socials: [
      { label: 'Instagram', href: '#' },
      { label: 'ArchDaily', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
    note: 'Designed & built in-house.',
  },
};
