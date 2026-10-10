// Shared by the form (index.html) and the results page (results.html).
// ─────────────────────────────────────────────────────────────
// The Google Apps Script web app URL (ends in /exec).
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5DRAy0Kc0VDOS3S-0bCHocgDigi9M6x5U9_Gi8Bd9eRpNGECtBCtrzNQFtkKM1bLJ/exec";
// ─────────────────────────────────────────────────────────────

const TASKS = [
  { short: "Swipe deck", text: "Get through the welcome screens, then save two combinations you love and pass on three you don't." },
  { short: "Undo", text: "Oops — you passed on one by mistake. Bring it back." },
  { short: "Pin a colour", text: "You love one particular colour on the card in front of you. Get Tone to only show you combinations that include that colour." },
  { short: "New collection", text: "Put a combination you like into a new collection called “Bedroom”, with a photo as its cover." },
  { short: "Saved + filter", text: "Find everything you've saved, then narrow it down to just the ones with blue in them." },
  { short: "Similar combination", text: "Open one of your saved combinations and find a similar one." },
  { short: "Palette from photo", text: "Make a palette from a photo in your camera roll, change it to 3 colours, and save it." },
  { short: "Share as image", text: "Share that palette as an image. Flick through the layouts and pick the one you like best." },
  { short: "Choose a colour", text: "Find classic combinations that use a green you like." },
  { short: "Describe a feeling", text: "Turn the feeling “a lazy Sunday morning” (or one of your own) into a palette and save it. Then find classic combinations that match it." },
  { short: "Hex codes & dark mode", text: "Make the cards show each colour's hex code, then switch the app to dark mode." }
];

// Ease scale is 1-5; labels are indexed by score (index 0 unused).
const EASE_MIN = 1;
const EASE_MAX = 5;
const EASE_LABELS = ["", "Couldn't do it", "Pretty tricky", "Got there", "Easy", "Super easy"];

// Real combinations from A Dictionary of Colour Combinations — one per screen.
const COMBOS = [
  { n: 176, c: [["Hermosa Pink", "#f9c1ce"], ["Seashell Pink", "#fdd4bd"], ["Calamine Blue", "#78cdd0"]] },
  { n: 203, c: [["Pale Lemon Yellow", "#ffefae"], ["Vinaceous Cinnamon", "#eea78c"], ["Lincoln Green", "#555832"]] },
  { n: 12, c: [["Isabella Color", "#c3a55c"], ["Green Blue", "#2dbc94"]] },
  { n: 128, c: [["Corinthian Pink", "#f8b6ba"], ["Venice Green", "#62c6bf"], ["Eupatorium Purple", "#bf5892"], ["Light Mauve", "#9161f2"]] },
  { n: 91, c: [["Vistoris Lake", "#6d4145"], ["Orange Rufous", "#c16b27"]] },
  { n: 302, c: [["Cream Yellow", "#fdbf68"], ["Ecru", "#c2ae93"], ["Nile Blue", "#bce4e5"], ["Antwerp Blue", "#008aa1"]] },
  { n: 236, c: [["Khaki", "#bc892b"], ["Deep Lyons Blue", "#1c4286"], ["Purple Drab", "#84565b"]] },
  { n: 58, c: [["Hay's Russet", "#681916"], ["Sea Green", "#00b49b"]] },
  { n: 276, c: [["Eosine Pink", "#f37f94"], ["Seashell Pink", "#fdd4bd"], ["Yellow Green", "#afd472"], ["Black", "#111314"]] },
  { n: 141, c: [["Orange", "#f37420"], ["Yellow Green", "#afd472"], ["Dark Tyrian Blue", "#0d2b52"]] },
  { n: 333, c: [["Burnt Sienna", "#ae5224"], ["Lemon Yellow", "#f8ed43"], ["Cobalt Green", "#96d1aa"], ["Blue", "#006eb8"]] },
  { n: 37, c: [["Brick Red", "#a32100"], ["Red Violet", "#3400a3"]] },
  { n: 345, c: [["Hay's Russet", "#681916"], ["Nile Blue", "#bce4e5"], ["Venice Green", "#62c6bf"], ["Blue Violet", "#6450a1"]] },
  { n: 251, c: [["Red", "#a72144"], ["Yellow", "#fff200"], ["Diamine Green", "#008842"], ["Slate", "#1b3644"]] },
  { n: 9, c: [["Violet Red", "#3d0079"], ["Dull Blue Violet", "#80719e"]] }
];
