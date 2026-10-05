/* =============================================================================
   HOME COMING — config.js
   -----------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NORMALLY NEED TO EDIT.
   Every name, date, time, place, colour and photo slot on the site lives here.

   HOW TO FILL IT IN
   1. Press Ctrl+F and search for  {{          (two curly braces)
   2. Replace each {{SOMETHING}} with the real detail.
   3. When the counter in the amber bar at the top of the site reads 0,
      set needsSetup: false below and the bar disappears.

   Nothing in here is technical. You do not need to touch the HTML.
   ========================================================================== */

window.WEDDING = {
  /* Set to false once you have replaced every {{PLACEHOLDER}} below. */
  needsSetup: false,

  /* Anything whose path starts with one of these is OPTIONAL — if you leave it
     blank the site simply does not show that line, so it will not appear on the
     page. The amber bar counts these separately so you are not chasing 15 things
     when only 5 actually matter. */
  optional: [
    'groom.familyNote',
    'families.bride',
    'families.groom',
    'place.venue',
    'gallery',
    'journey.from',
    'inbox',
  ],

  /* ---------------------------------------------------------------- couple */
  bride: {
    full: 'Rose NDAANEE',
    first: 'Rose',
    meaning:
      'Rose is a name for a flower that opens slowly, and for a person who does the same. ' +
      'She is the daughter who crossed an ocean to come home, and she arrived exactly on time.',
  },

  groom: {
    full: 'Daniel MTON',
    first: 'Daniel',
    meaning:
      'Daniel is a Hebrew name, and it means God is my judge. He is not a man who ' +
      'wants a stage. He is the man who can hold a room and let it go quiet, which ' +
      'is the harder of the two.',
    /* The meaning of the family name. I have deliberately NOT invented one —
       surnames in this part of the world come from a lineage and a place, and only
       the family can say it properly. Put the family's own words here. */
    familyNote: 'Enduring and persevering',
  },

  families: {
    brideSide: 'NDAANEE',
    groomSide: 'MTON',

    /* The people under each family circle. Delete any line you do not need —
       anything left blank is simply not shown, so it is safe to over-list here
       and trim later. */
    bride: [
      'Jolly NDAANEE', 'Veronica NDAANEE',
      'Denis NDAANEE', 'Rose NDAANEE',
    ],
    groom: [
      'Mr. MTON', 'Mrs. MTON',
      'Daniel MTON', 'Baridoo MTON',
    ],
  },

  /* ------------------------------------------------------------------ date
     This is the only place the date is written. Change it here and the counter,
     the hero, the footer, the page title and the WhatsApp preview all follow.
     If you change the day, remember to change `inWords` too, because a script
     cannot spell out a number. */
  date: {
    /* Used for the "days married" counter. Timezone is Lagos (UTC+1). */
    iso: '2026-06-27T14:30:00+01:00',
    day: '27',
    month: 'June',
    year: '2026',
    numeric: '27 · 06 · 2026',
    /* Spelled out by hand. Must agree with `iso` above. */
    inWords: 'the twenty-seventh of June, two thousand and twenty-six',
  },

  place: {
    village: 'Luekue',
    state: 'Rivers State',
    country: 'Nigeria',
    heritage: 'Ogoni Land',
    venue: 'Luekue',
    mapNote: 'Reachable by road from Port Harcourt Airport, then onward to the creeks.',
  },

  /* --------------------------------------------------------------- journey */
  journey: {
    /* I did not know which city in the USA, so I am not guessing one.
       Put it in and the map legend and the text will use it. */
    from: 'Virginia, United states of America',
    to: 'Luekue, Nigeria',
    story: [
      'She left. That is the first thing anyone will tell you about her — that she left, ' +
      'and she went properly far, and she built a whole life on the other side of an ocean.',

      'And then one day she said she was coming home. Not for a visit. Home.',

      'She crossed back over the Atlantic and up the creeks and the water shrank and the ' +
      'air changed and everything she had been carrying got heavier and warmer, and by the ' +
      'time she reached her father\'s house she was not a visitor anymore.',

      'She was a daughter, coming home to be married in the way her family has always done it, ' +
      'with the people who have known her longest, in the language and the light she grew up in.',

      'This page is for everyone who could not be in the room on 22 June 2026. ' +
      'Read it, and then leave her something. She will read every single one.',
    ],
  },

  /* ------------------------------------------------------------- programme */
  /* Retrospective. The site reads it as what already happened, not what is coming. */
  programmeHeading: 'The Day, As It Was',
  programme: [
    { time: 'Dawn',    title: 'The morning of the house',    text: 'Before anyone spoke, the compound was already awake. Fire in the kitchen, water drawn, and the long business of getting a family ready.' },
    { time: 'Morning', title: 'The women of the house',      text: 'Her aunties and her mother had their own work that morning — cooking, arranging, and holding the whole thing together without ever appearing to hurry.' },
    { time: 'Late morning', title: 'She was called for',    text: 'The call came and the room changed shape. That is the moment the day actually started, whatever the programme says.' },
    { time: 'Midday',  title: 'The traditional attire',       text: 'Coral beads, the wrapper, the hat, the walking stick, the fan. A woman dressed in full traditional regalia is not wearing an outfit. She is holding an office.' },
    { time: 'Afternoon', title: 'The marriage',             text: 'The families, the words, the agreement that two people made in front of everyone who will remember it.' },
    { time: 'Afternoon', title: 'Ake Ije',                 text: 'The wedding song. Loud, unhurried, and impossible to stand still through. Somebody always cries and pretends it is dust.' },
    { time: 'Evening', title: 'Money, sprayed and caught',   text: 'Sprayed into the air so it can be caught, because a gift you cannot catch is a gift you did not really give.' },
    { time: 'Evening', title: 'Food, and then more food',    text: 'The part everybody remembers. Nobody left until the plates were finished twice.' },
    { time: 'Night',   title: 'Photographs, and home',       text: 'Flashlights, poses, relatives who only just arrived. Then the long slow goodbyes that lasted until morning.' },
  ],

  /* --------------------------------------------------------------- customs */
  /* These are written to be broadly true of a Niger Delta traditional wedding.
     PLEASE CHECK THEM against what your own family actually does, and change
     anything that is not your custom. Guests can tell instantly. */
  customsHeading: 'Customs of the Day',
  customs: [
    { title: 'Asking and answering',       text: 'A traditional wedding here is not a surprise. It begins long before the day, when a family is sent to ask and another family answers. The asking is the courtship; the day is only the receipt.' },
    { title: 'The bride price, eaten',     text: 'The groom\'s family brings something to the bride\'s family, and the bride\'s family eats it — because that is how the agreement is made real. It is not a purchase. It is a feast that says: we will look after her.' },
    { title: 'Coral beads and the wrapper', text: 'Coral is worn, not accessorised. It marks the family and the occasion, and it is given and received rather than bought. The wrapper does the same work.' },
    { title: 'Carrying the bride',         text: 'On the day she may be lifted and carried, because she is not walking out on her own. The family carries her out. Nobody is supposed to be too quiet about it.' },
    { title: 'The hat, the stick, the fan', text: 'Regalia that says a man is a man who has people. Each piece is given by a specific person for a specific reason, and the whole set is put on in a fixed order.' },
    { title: 'Ake Ije — the wedding song',  text: 'The song is the schedule. It begins when it begins and ends when it is finished. It is sung by the people, not performed to them.' },
    { title: 'The chiefs and the elders',   text: 'Where the family holds titles, they are present and they are spoken to first. A marriage that skips the elders is a marriage the village will hear about twice.' },
  ],

  /* --------------------------------------------------------------- palette */
  paletteHeading: 'The Colours of the Day',
  paletteNote: 'The colours the family chose, kept here so nobody has to remember them.',
  palette: [
    { name: 'Forest',  hex: '#0B3D2C', note: 'The creeks, and the ground under everything.' },
    { name: 'Gold',     hex: '#C9A227', note: 'Coral, brass, and the light at four o\'clock.' },
    { name: 'Coral',    hex: '#B23A2E', note: 'Worn, not bought.' },
    { name: 'Ivory',    hex: '#F6F1E7', note: 'For the cloth that has to survive dancing.' },
    { name: 'Terracotta', hex: '#8C4A2F', note: 'Laterite, and the walls of the compound.' },
  ],

  /* =======================================================================
     HERO — the three photographs that drift slowly behind the opening.
     Set any src to null to fall back to the plain green gradient.
     ==================================================================== */
  hero: {
    slides: [
      { src: 'images/the-couple.jpg', alt: 'Rose NDAANEE and Daniel MTON' },
      { src: 'images/the-bride.jpg',  alt: 'Rose in full traditional regalia' },
      { src: 'images/the-groom.jpg',  alt: 'Daniel in full traditional regalia' },
    ],
  },

  /* --------------------------------------------------------------- gallery */
  /* The photographs are sized and named for you already — no spaces in the
     names, because social platforms mangle those in shared links. Move the
     lines around if you want a different running order. */
  gallery: [
    { src: 'images/the-couple.jpg',                alt: 'Rose and Daniel together',                   caption: 'The two of them' },
    { src: 'images/the-bride.jpg',                 alt: 'Rose in traditional attire and coral beads', caption: 'Rose, in full regalia' },
    { src: 'images/the-groom.jpg',                 alt: 'Daniel in full traditional regalia',         caption: 'Daniel, in full regalia' },
    { src: 'images/the-brides-family.jpg',         alt: 'The NDAANEE family, seated',                 caption: 'NDAANEE' },
    { src: 'images/the-grooms-family.jpg',         alt: 'The MTON family, seated',                 caption: 'MTON' },
    { src: 'images/dancing-in-amaze.jpg',          alt: 'Guests dancing at the celebration',          caption: 'In amaze' },
    { src: 'images/dancing-to-join-the-bride.jpg', alt: 'Dancing to join the bride',                  caption: 'To join the bride' },
    { src: 'images/dancing-to-join-the-groom.jpg', alt: 'Dancing to join the groom',                  caption: 'To join the groom' },
    { src: 'images/blessings-to-the-couple.jpg',   alt: 'Blessings poured over the couple',           caption: 'Blessings to the couple' },
  ],

  /* ---------------------------------------------------------------- footer */
  hashtag: '#BarieebaNdaanee2026',
  title: 'Rose NDAANEE & Daniel MTON',
  blurb: 'Made with love by her cousin Barieeba, for the people who were not in the room.',

  /* =======================================================================
     WHERE THE BLESSINGS GO

     The site tries these in order and uses the first one that is ready:

       1. supabase  -> the private database + admin.html   (best)
       2. inbox     -> emails each blessing to you         (2 minute setup)
       3. local     -> saves in the visitor's own browser  (nothing sent)

     You can run 1 and 2 at once if you like: set supabase and the site uses
     the database, and inbox stays as a safety copy in your inbox.
     ==================================================================== */

  supabase: {
    url: 'https://cumgwfrjilghykgszblt.supabase.co',
    anonKey: 'sb_publishable_RlEERyL8YugF9-1zI29_YQ_cducJbrj',
  },

  
  /* The family drop-down on the form. Edit freely. */
  sides: [
    { value: 'groom',  label: "Groom's side" },
    { value: 'bride',  label: "Bride's side" },
    { value: 'both',   label: 'Both sides' },
    { value: 'friend', label: 'Friend of the family' },
    { value: 'other',  label: 'Other' },
  ],

  countries: [
    'Nigeria', 'United States', 'United Kingdom', 'Canada', 'Ireland',
    'South Africa', 'Germany', 'France', 'Italy', 'Spain', 'Poland',
    'Saudi Arabia', 'United Arab Emirates', 'Ghana', 'Cameroon',
    'Australia', 'Other',
  ],
};
