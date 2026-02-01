// הגדרת מידות המסך
let canvasW = 1512;
let canvasH = 982;

// נתונים גלובליים
let pantoneData = [
  { year: '2000', name: 'Cerulean', code: '15-4020', hex: '#9BB7D4' },
  { year: '2001', name: 'Fuchsia Rose', code: '17-2031', hex: '#C74375' },
  { year: '2002', name: 'True Red', code: '19-1664', hex: '#BF1932' },
  { year: '2003', name: 'Aqua Sky', code: '14-4811', hex: '#7BC4C4' },
  { year: '2004', name: 'Tiger lily', code: '17-1456', hex: '#E2583E' },
  { year: '2005', name: 'Blue Turquoise', code: '15-5217', hex: '#53B0AE' },
  { year: '2006', name: 'Sand Dollar', code: '13-1106', hex: '#DFCFBE' },
  { year: '2007', name: 'Chili Pepper', code: '19-1557', hex: '#9B2335' },
  { year: '2008', name: 'Blue Iris', code: '18-3943', hex: '#5B5EA6' },
  { year: '2009', name: 'Mimosa', code: '14-0848', hex: '#EFC050' },
  { year: '2010', name: 'Turquoise', code: '15-5519', hex: '#45B8AC' },
  { year: '2011', name: 'Honeysuckle', code: '18-2120', hex: '#D65076' },
  { year: '2012', name: 'Tangerine Tango', code: '17-1463', hex: '#DD4124' },
  { year: '2013', name: 'Emerald', code: '17-5641', hex: '#009B77' },
  { year: '2014', name: 'Radiant Orchid', code: '18-3224', hex: '#B565A7' },
  { year: '2015', name: 'Marsala', code: '18-1438', hex: '#964F4C' },
  { year: '2016', name: 'Serenity', code: '15-3919', hex: '#92A8D1' },
  { year: '2016', name: 'Rose Quartz', code: '13-1520', hex: '#F7CAC9' },
  { year: '2017', name: 'Greenery', code: '15-0343', hex: '#88B04B' },
  { year: '2018', name: 'Ultra Violet', code: '18-3838', hex: '#6B5B95' },
  { year: '2019', name: 'Living Coral', code: '16-1546', hex: '#FF6F61' },
  { year: '2020', name: 'Classic Blue', code: '19-4052', hex: '#0F4C81' },
  { year: '2021', name: 'Illuminating', code: '13-0647', hex: '#F5DF4D' },
  { year: '2021', name: 'Ultimate Gray', code: '17-5104', hex: '#939597' },
  { year: '2022', name: 'Very Peri', code: '17-3938', hex: '#6667AB' },
  { year: '2023', name: 'Viva Magenta', code: '18-1750', hex: '#BE3455' },
  { year: '2024', name: 'Peach Fuzz', code: '13-1023', hex: '#FFBE98' },
  { year: '2025', name: 'Mocha Mousse', code: '17-1230', hex: '#A47864' },
  { year: '2026', name: 'Cloud Dancer', code: '11-4201', hex: '#FCFBF0' } 
];

// משתני מניפה
let fanState = 0; 
let hoverIndex = -1;
let selectedCardIndex = -1;
let currentBgColor = '#FCFBF0';
// Removed toggle - always show 3D mode

// 2026 card color transition variables
let card2026CurrentColor = { r: 252, g: 251, b: 240 }; // #FCFBF0 (white)
let card2026TargetColor = { r: 252, g: 251, b: 240 }; // #FCFBF0 (white)

// Background color transition variables
let bgCurrentColor = { r: 252, g: 251, b: 240 }; // #FCFBF0 (white)
let bgTargetColor = { r: 252, g: 251, b: 240 }; // #FCFBF0 (white)

// 3D scene container background color transition variables
let scene3DBgCurrentColor = { r: 252, g: 251, b: 240 }; // #FCFBF0 (white)
let scene3DBgTargetColor = { r: 252, g: 251, b: 240 }; // #FCFBF0 (white)
let scene3DBgTargetHex = '#FCFBF0'; // Store exact target hex to avoid rounding errors
let lastAppliedSceneBgHex = ''; // Only touch 3D container/viewer when color changes (avoids unnecessary DOM writes)

// גריד ומידות
let colWidth;
let pivotX, pivotY;
let cardLength; 
let cardThickness; 

// About page: cards scatter ("thrown on table") state
let aboutPageBlend = 0;       // 0 = fan layout, 1 = scattered
let aboutPageVisiblePrev = false;
// About page: hover on cards = cleanup motion (cards pull to right half, reveal text)
let aboutCleanupBlend = 0;    // 0 = scattered, 1 = cleaned up (right half)
let aboutCleanupHoverSmoothed = 0;  // smoothed 0..1 hover signal to avoid edge flicker
// About page: click on bg only = pile back (cards return to fan) but stay on About (don't go home)
let aboutPagePileBackOnly = false;
// About page: after cleanup motion, cards stay almost still; light motion when hovering cards on right; click on cards = return to messy
let aboutCleanupLocked = false;
// About page: 2s after cards pile, show video masked to pile shape
let aboutVideoDelayStarted = false;
let aboutVideoTimeoutId = null;
// About page: after click on piled cards, force spread back to messy (ignore hover until done)
let aboutCleanupReturnToScatter = false;
// Light hover offset when locked (cards on right): smoothed so they move gently when you hover them
let aboutCleanupHoverOffsetX = 0, aboutCleanupHoverOffsetY = 0;
// Homepage: click 2026 card – close fan with same smooth motion as color pages (don’t snap)
let closingFanForHome = false;
let splineAudioStoppedForNav = false;

// Hover sound: Web Audio API (generative, no files); track last hover to trigger only on enter
let hoverAudioCtx = null;
let lastHoverSoundIndex = -1;

// נכסים
let paperTextureImg;

function setup() {
  createCanvas(canvasW, canvasH);
  
  // Ensure canvas stays visible and has proper z-index - ALWAYS IN FRONT
  let canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.setProperty('position', 'fixed', 'important');
    canvas.style.setProperty('top', '0', 'important');
    canvas.style.setProperty('left', '0', 'important');
    canvas.style.setProperty('z-index', '6000', 'important'); // ABOVE 3D scene (5000) - fan always in front
    // pointer-events will be set dynamically in draw() based on mouse position
    canvas.style.setProperty('opacity', '1', 'important');
    canvas.style.setProperty('visibility', 'visible', 'important');
    canvas.style.setProperty('display', 'block', 'important');
    // mousedown: About page ONLY – one press on canvas when cards piled = spread back (state set here so it always runs)
    canvas.addEventListener('mousedown', function(e) {
      if (!document.body || !document.body.classList.contains('page-about')) return;
      if (typeof aboutCleanupBlend === 'undefined' || aboutCleanupBlend <= 0.2) return;
      fanState = 0;
      aboutCleanupLocked = false;
      aboutCleanupHoverSmoothed = 0;
      aboutCleanupReturnToScatter = true;
      aboutCleanupHoverOffsetX = 0;
      aboutCleanupHoverOffsetY = 0;
      hideAboutVideo();
      var i;
      for (i = 0; i < pantoneData.length; i++) {
        if (pantoneData[i].cleanupHoverBlend != null) pantoneData[i].cleanupHoverBlend = 0;
      }
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }
  
  let link = createElement('link');
  link.attribute('rel', 'stylesheet');
  link.attribute('href', 'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400&display=swap');
  textFont('Fira Mono');

  createDenseTexture(canvasW, canvasH);
  
  colWidth = width / 7;
  
  pivotX = width - colWidth / 3; 
  pivotY = height - 0; 
  
  cardLength = 980; 
  cardThickness = 150; 

  for (let item of pantoneData) {
    item.animOffset = 0; 
    item.angleOffset = 0;
    // Initialize color transition variables for smooth color transitions
    let rgb = hexToRgb(item.hex);
    if (rgb) {
      item.currentColor = { r: rgb.r, g: rgb.g, b: rgb.b };
      item.targetColor = { r: rgb.r, g: rgb.g, b: rgb.b };
    }
  }
  
  // Toggle button removed - always in 3D mode
}

// Function to show 3D scene automatically (no toggle needed)
function show3DScene() {
  let scene3DContainer = document.getElementById('scene-3d-container');
  if (scene3DContainer) {
    // Remove any existing transition classes first
      scene3DContainer.classList.remove('visible', 'transitioning-in');
      
    // Force a reflow to ensure the initial state is applied
    void scene3DContainer.offsetWidth;
    
    // KEEP CANVAS IN FRONT AND INTERACTIVE - Enable fan clicks
    let canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.setProperty('pointer-events', 'auto', 'important'); // Enable fan interaction
      canvas.style.setProperty('z-index', '6000', 'important'); // STILL IN FRONT - above 3D scene (5000)
      canvas.style.setProperty('opacity', '1', 'important'); // Keep visible
      canvas.style.setProperty('visibility', 'visible', 'important'); // Keep visible
      canvas.style.setProperty('display', 'block', 'important'); // Keep displayed
    }
    
    // DISABLE FAN CONTAINER INTERACTION - Keep fan visible but non-interactive
    const fanContainer = document.getElementById('fan-container');
    if (fanContainer) {
      fanContainer.style.setProperty('pointer-events', 'none', 'important');
      fanContainer.style.setProperty('z-index', '1', 'important');
      fanContainer.style.setProperty('opacity', '1', 'important'); // Keep visible
      fanContainer.style.setProperty('visibility', 'visible', 'important'); // Keep visible
      // Keep cards visible but disable interaction
      const cards = fanContainer.querySelectorAll('.pantone-card');
      cards.forEach(card => {
        card.style.setProperty('pointer-events', 'none', 'important');
        // Keep opacity at 1 so fan remains visible
        card.style.setProperty('opacity', '1', 'important');
        card.style.setProperty('visibility', 'visible', 'important');
      });
    }
    
    // Start container present but invisible so fan can close smoothly (3D load deferred)
    scene3DContainer.classList.add('transitioning-in');
    scene3DContainer.style.setProperty('opacity', '0', 'important');
    scene3DContainer.style.setProperty('visibility', 'visible', 'important');
    scene3DContainer.style.setProperty('display', 'block', 'important');
    
    // Defer 3D load and fade-in so fan motion isn't blocked; then smooth fade-in (same motion as elsewhere)
    var sceneFadeDelayMs = 420;
    setTimeout(function() {
      scene3DContainer.style.removeProperty('opacity');
      scene3DContainer.classList.add('visible');
      init3DScene();
    }, sceneFadeDelayMs);
  }
}


// Stop Spline viewer audio and unload scene (no document audio/video). Use when switching to Credits/About so color page sound stops but credits video is untouched.
function stopSplineViewerAudioOnly() {
  let allViewers = document.querySelectorAll('spline-viewer');
  allViewers.forEach(viewer => {
    try {
      if (viewer.shadowRoot) {
        let audioElements = viewer.shadowRoot.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
          audio.muted = true;
          if (audio.srcObject) audio.srcObject = null;
          if (audio.src) audio.src = '';
        });
        let videoElements = viewer.shadowRoot.querySelectorAll('video');
        videoElements.forEach(video => {
          video.pause();
          video.currentTime = 0;
          video.volume = 0;
          video.muted = true;
          if (video.srcObject) video.srcObject = null;
          if (video.src) video.src = '';
        });
      }
      viewer.removeAttribute('url');
      viewer.classList.remove('active');
      viewer.style.display = 'none';
      viewer.style.visibility = 'hidden';
      viewer.style.opacity = '0';
    } catch (e) {}
  });
}
if (typeof window !== 'undefined') window.stopSplineViewerAudioOnly = stopSplineViewerAudioOnly;

// Called by showPage() when user navigates via navbar – snap bg and reset selection so draw() doesn't fight transition (no glass layer / freeze)
function sketchOnPageChange(page) {
  if (page === 'credits' || page === 'about' || page === 'color') {
    selectedCardIndex = -1;
    bgTargetColor = { r: 252, g: 251, b: 240 };
    bgCurrentColor.r = 252;
    bgCurrentColor.g = 251;
    bgCurrentColor.b = 240;
    scene3DBgTargetColor = { r: 252, g: 251, b: 240 };
    scene3DBgCurrentColor.r = 252;
    scene3DBgCurrentColor.g = 251;
    scene3DBgCurrentColor.b = 240;
    scene3DBgTargetHex = '#FCFBF0';
  }
}
if (typeof window !== 'undefined') window.sketchOnPageChange = sketchOnPageChange;

// Helper function to aggressively stop all Spline audio
function stopAllSplineAudio() {
  let allViewers = document.querySelectorAll('spline-viewer');
  allViewers.forEach(viewer => {
    // Stop audio in shadow DOM FIRST, before removing URL
    try {
      if (viewer.shadowRoot) {
        let audioElements = viewer.shadowRoot.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
          audio.muted = true;
          if (audio.srcObject) {
            audio.srcObject = null;
          }
          if (audio.src) {
            audio.src = '';
          }
        });
        
        // Also try to find and stop any video elements that might have audio
        let videoElements = viewer.shadowRoot.querySelectorAll('video');
        videoElements.forEach(video => {
          video.pause();
          video.currentTime = 0;
          video.volume = 0;
          video.muted = true;
          if (video.srcObject) {
            video.srcObject = null;
          }
          if (video.src) {
            video.src = '';
          }
        });
      }
    } catch (e) {
      console.log('Could not access Spline audio');
    }
    
    // Remove URL to completely stop the scene
    viewer.removeAttribute('url');
    
    // Hide viewer
    viewer.classList.remove('active');
    viewer.style.display = 'none';
    viewer.style.visibility = 'hidden';
    viewer.style.opacity = '0';
  });
  
  // Stop all audio in document
  try {
    let allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.muted = true;
      if (audio.srcObject) {
        audio.srcObject = null;
      }
      if (audio.src) {
        audio.src = '';
      }
    });
    
    // Stop all video elements
    let allVideo = document.querySelectorAll('video');
    allVideo.forEach(video => {
      video.pause();
      video.currentTime = 0;
      video.volume = 0;
      video.muted = true;
      if (video.srcObject) {
        video.srcObject = null;
      }
      if (video.src) {
        video.src = '';
      }
    });
  } catch (e) {
    console.log('Could not stop document audio');
  }
}

// Unmute and play audio in a Spline viewer (for Peach Fuzz, Blue Turquoise, Very Peri).
// Browsers block autoplay until user gesture; call this from a click handler.
function unmuteAndPlayViewerAudio(viewer) {
  if (!viewer || !viewer.shadowRoot) return false;
  try {
    let audioElements = viewer.shadowRoot.querySelectorAll('audio');
    if (audioElements.length === 0) return false;
    audioElements.forEach(audio => {
      audio.muted = false;
      audio.volume = 1;
      audio.play().catch(function() {});
    });
    return true;
  } catch (e) {
    return false;
  }
}

// One-time listener for unmute; only the latest color overlay's viewer is unmuted on first click.
var pendingUnmuteViewerId = null;
var pendingUnmuteHandled = false;

function onUnmuteFirstInteraction() {
  if (pendingUnmuteHandled || !pendingUnmuteViewerId) return;
  pendingUnmuteHandled = true;
  let viewer = document.getElementById(pendingUnmuteViewerId);
  if (!viewer) return;
  let attempts = 0;
  const maxAttempts = 15;
  function tryUnmute() {
    if (unmuteAndPlayViewerAudio(viewer)) return;
    attempts++;
    if (attempts < maxAttempts) setTimeout(tryUnmute, 250);
  }
  tryUnmute();
  document.removeEventListener('click', onUnmuteFirstInteraction, true);
  document.removeEventListener('pointerdown', onUnmuteFirstInteraction, true);
}

// Schedule unmute on first user click so Spline scene sound can play (browser autoplay policy).
function scheduleUnmuteOnFirstClick(viewerId) {
  pendingUnmuteViewerId = viewerId;
  pendingUnmuteHandled = false;
  document.removeEventListener('click', onUnmuteFirstInteraction, true);
  document.removeEventListener('pointerdown', onUnmuteFirstInteraction, true);
  document.addEventListener('click', onUnmuteFirstInteraction, { capture: true });
  document.addEventListener('pointerdown', onUnmuteFirstInteraction, { capture: true });
}

function init3DScene() {
  let selectedCard = pantoneData[selectedCardIndex];
  if (!selectedCard) {
    stopAllSplineAudio();
    return;
  }
  
  let scene3DContainer = document.getElementById('scene-3d-container');
  
  // Stop all audio first
  stopAllSplineAudio();
  
  // Set target background color to EXACT card color
  let targetHex = selectedCard.hex; // Use exact card color - no modifications
  let sceneBgRgb = hexToRgb(targetHex);
  if (sceneBgRgb) {
    scene3DBgTargetColor = sceneBgRgb;
    scene3DBgTargetHex = targetHex; // Store exact hex to ensure perfect match
  }
  
  // Add delay to ensure all audio is fully stopped before loading new scene
  setTimeout(() => {
    let blueViewer = document.getElementById('spline-viewer-blue');
    let peachViewer = document.getElementById('spline-viewer-peach');
    let defaultViewer = document.getElementById('spline-viewer-default');
    
    // Hide all viewers first
    if (blueViewer) hideViewer(blueViewer);
    if (peachViewer) hideViewer(peachViewer);
    if (defaultViewer) hideViewer(defaultViewer);
      
    // Map of color codes to their specific Spline scene URLs
    // Only these three colors should have 3D scenes
    const colorSceneMap = {
      '15-5217': { viewer: blueViewer, url: 'https://prod.spline.design/lDXTSk9A4jihRHTa/scene.splinecode' }, // Blue Turquoise
      '13-1023': { viewer: peachViewer, url: 'https://prod.spline.design/djilzuyDrYyYBSV9/scene.splinecode' }, // Peach Fuzz
      '17-3938': { viewer: defaultViewer, url: 'https://prod.spline.design/w8ADXgZdvk4PaF8W/scene.splinecode' }, // Very Peri
    };
    
    // Check if this color has a specific scene
    const sceneConfig = colorSceneMap[selectedCard.code];
    if (sceneConfig && sceneConfig.viewer && scene3DContainer) {
      // Make sure container is visible
      scene3DContainer.classList.add('visible');
      scene3DContainer.style.opacity = '1';
      scene3DContainer.style.visibility = 'visible';
      scene3DContainer.style.display = 'block';
      // Use the specific scene for this color
      loadViewer(sceneConfig.viewer, sceneConfig.url, scene3DContainer, selectedCard);
    } else {
      // Hide 3D scene container for all other colors
      if (scene3DContainer) {
        scene3DContainer.classList.remove('visible');
        scene3DContainer.style.opacity = '0';
        scene3DContainer.style.visibility = 'hidden';
      }
    }
  }, 200); // 200ms delay to ensure audio is fully stopped
}

function hideViewer(viewer) {
    viewer.classList.remove('active');
    viewer.style.display = 'none';
    viewer.style.visibility = 'hidden';
    viewer.style.opacity = '0';
}

function loadViewer(viewer, url, container, card) {
    // Ensure viewer is clean before loading
    if (!viewer || !container) return;
    
    // Make sure container is visible
    container.classList.add('visible');
    container.style.opacity = '1';
    container.style.visibility = 'visible';
    container.style.display = 'block';
    
    viewer.removeAttribute('url');
    // Stop any existing audio in this viewer
    try {
      if (viewer.shadowRoot) {
        let audioElements = viewer.shadowRoot.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
          audio.muted = true;
        });
      }
    } catch (e) {
      // Ignore errors
    }
    
    // Add delay before loading new scene to prevent audio glitches
    setTimeout(() => {
      if (!viewer) return;
      
      viewer.setAttribute('url', url);
      // Set background color to EXACT card color - no modifications
      let bgColor = card.hex; // Use exact card color
      container.style.setProperty('background-color', bgColor, 'important');
      viewer.style.setProperty('background-color', bgColor, 'important');
      viewer.style.backgroundColor = bgColor;
      showSplineViewer(viewer, container, card);
      
      // Set background color again after viewer loads to ensure it sticks
      setTimeout(() => {
        if (viewer && container) {
          container.style.setProperty('background-color', bgColor, 'important');
          viewer.style.setProperty('background-color', bgColor, 'important');
          viewer.style.backgroundColor = bgColor;
        }
      }, 500);
    }, 150); // Increased delay to prevent audio glitches
}

function showSplineViewer(splineViewer, scene3DContainer, selectedCard) {
  if (!splineViewer || !scene3DContainer) return;
  
  // Ensure container is visible
  scene3DContainer.classList.add('visible');
  scene3DContainer.style.setProperty('opacity', '1', 'important');
  scene3DContainer.style.setProperty('visibility', 'visible', 'important');
  scene3DContainer.style.setProperty('display', 'block', 'important');
  
  splineViewer.classList.remove('active');
  void splineViewer.offsetWidth;
  
  requestAnimationFrame(() => {
    splineViewer.classList.add('active');
    splineViewer.style.setProperty('display', 'block', 'important');
    splineViewer.style.setProperty('visibility', 'visible', 'important');
    splineViewer.style.setProperty('opacity', '1', 'important');
    splineViewer.style.setProperty('z-index', '1', 'important');
    splineViewer.style.setProperty('pointer-events', 'auto', 'important');
    
  // Set background color to EXACT card color
  let bgColor = selectedCard ? selectedCard.hex : '#FCFBF0'; // Use exact card color
  scene3DContainer.style.setProperty('background-color', bgColor, 'important');
  scene3DContainer.style.backgroundColor = bgColor;
  splineViewer.style.setProperty('background-color', bgColor, 'important');
  splineViewer.style.backgroundColor = bgColor;
  });
}


function createDenseTexture(w, h) {
  paperTextureImg = createImage(w, h);
  paperTextureImg.loadPixels();
  let noiseScale = 3000.0; 
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      let n = noise(i * 0.9, j * 0.9); 
      let alphaVal = map(n, 0, 1, 0, 12); 
      paperTextureImg.set(i, j, color(0, 0, 0, alphaVal));
    }
  }
  paperTextureImg.updatePixels();
}

// Helper function to convert hex color to RGB object
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Hover sound: map card index to frequency (C major pentatonic, C2 base = deep, modern low register)
function getHoverNoteFrequency(cardIndex) {
  const pentatonicSemitones = [0, 2, 4, 7, 9]; // C, D, E, G, A
  const degree = cardIndex % 5;
  const octave = Math.floor(cardIndex / 5);
  const midi = 36 + octave * 12 + pentatonicSemitones[degree]; // C2 base = deep
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Play a single hover note (deep, quiet, modern – sine = clean; smooth envelope; polyphonic)
function playHoverNote(cardIndex) {
  if (cardIndex < 0 || cardIndex >= pantoneData.length) return;
  try {
    if (!hoverAudioCtx) hoverAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (hoverAudioCtx.state === 'suspended') hoverAudioCtx.resume();
    const now = hoverAudioCtx.currentTime;
    const osc = hoverAudioCtx.createOscillator();
    const gain = hoverAudioCtx.createGain();
    const filter = hoverAudioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 750;   // deep + modern: soft, clean low end
    osc.type = 'sine';              // modern: minimal, clean, no extra harmonics
    osc.frequency.value = getHoverNoteFrequency(cardIndex);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.014, now + 0.16);  // very quiet; smooth, slow attack
    gain.gain.setTargetAtTime(0, now + 0.24, 0.4);        // long, smooth exponential decay
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(hoverAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.6);
  } catch (e) {}
}

function draw() {
  let onCreditsOrAbout = document.body && (document.body.classList.contains('page-credits') || document.body.classList.contains('page-about'));
  if (onCreditsOrAbout) {
    if (!splineAudioStoppedForNav) {
      stopSplineViewerAudioOnly();
      splineAudioStoppedForNav = true;
    }
  } else {
    splineAudioStoppedForNav = false;
  }

  // Nav pages (About, Credits, Color of the year): 2026 upper card = Cloud Dancer white – snap immediately (no leftover color from last color page)
  let body = document.body;
  let onNavPage = body && (body.classList.contains('page-about') || body.classList.contains('page-credits') || !body.classList.contains('color-selected'));
  if (onNavPage) {
    card2026TargetColor = { r: 252, g: 251, b: 240 };
    card2026CurrentColor.r = 252;
    card2026CurrentColor.g = 251;
    card2026CurrentColor.b = 240;
  }

  // About page = fully transparent canvas so only the CARDS cover the text (no gray layer, natural reveal)
  let isAboutPage = body && body.classList.contains('page-about');
  if (isAboutPage) {
    clear(); // Transparent – text (below canvas) shows through; only the drawn cards cover it
  } else {
    clear(); // Transparent so we see body/color page behind
  }
  
  // Silk-smooth color transition for 2026 card (slower lerp = silkier, especially for big jumps like white ↔ Very Peri)
  if (!onNavPage) {
    const card2026Lerp = 0.07; // Slower than 0.15 so white ↔ dark (e.g. Very Peri) feels smooth, not abrupt
    card2026CurrentColor.r = lerp(card2026CurrentColor.r, card2026TargetColor.r, card2026Lerp);
    card2026CurrentColor.g = lerp(card2026CurrentColor.g, card2026TargetColor.g, card2026Lerp);
    card2026CurrentColor.b = lerp(card2026CurrentColor.b, card2026TargetColor.b, card2026Lerp);
  }
  
  // Very Peri card: when Very Peri page is on and fan is closed, use #0E003A so card blends in
  let veryPeriItem = pantoneData.find(item => item.code === '17-3938');
  const isVeryPeriPageClosed = (fanState < 0.1 && selectedCardIndex !== -1 && pantoneData[selectedCardIndex].code === '17-3938');
  if (veryPeriItem && veryPeriItem.targetColor && veryPeriItem.currentColor) {
    if (isVeryPeriPageClosed) {
      let blendRgb = hexToRgb('#0E003A');
      if (blendRgb) {
        veryPeriItem.targetColor.r = blendRgb.r;
        veryPeriItem.targetColor.g = blendRgb.g;
        veryPeriItem.targetColor.b = blendRgb.b;
        veryPeriItem.currentColor.r = blendRgb.r;
        veryPeriItem.currentColor.g = blendRgb.g;
        veryPeriItem.currentColor.b = blendRgb.b;
      }
    } else {
      let rgb = hexToRgb(veryPeriItem.hex);
      if (rgb) {
        veryPeriItem.targetColor.r = rgb.r;
        veryPeriItem.targetColor.g = rgb.g;
        veryPeriItem.targetColor.b = rgb.b;
      }
    }
  }
  
  // Smooth color transitions for all cards
  for (let item of pantoneData) {
    if (item.currentColor && item.targetColor) {
      item.currentColor.r = lerp(item.currentColor.r, item.targetColor.r, 0.15);
      item.currentColor.g = lerp(item.currentColor.g, item.targetColor.g, 0.15);
      item.currentColor.b = lerp(item.currentColor.b, item.targetColor.b, 0.15);
    }
  }
  
  // Nav pages (About, Credits, Color of the Year home): body is ALWAYS white – snap so sketch never overwrites showPage (no glass layer / stuck transition)
  if (onNavPage) {
    bgTargetColor = { r: 252, g: 251, b: 240 }; // #FCFBF0
    bgCurrentColor.r = 252;
    bgCurrentColor.g = 251;
    bgCurrentColor.b = 240;
  }
  
  // Smooth background color transition only when on a color page
  if (!onNavPage) {
    bgCurrentColor.r = lerp(bgCurrentColor.r, bgTargetColor.r, 0.15);
    bgCurrentColor.g = lerp(bgCurrentColor.g, bgTargetColor.g, 0.15);
    bgCurrentColor.b = lerp(bgCurrentColor.b, bgTargetColor.b, 0.15);
  }
  
  // Apply background: on nav pages always white; on color page use lerped card color (so no white layer)
  if (document.body && onNavPage) {
    document.body.style.backgroundColor = '#FCFBF0';
    // Force-hide overlays and 3D scene every frame on nav pages so p5 never leaves a "glass layer" visible
    let scene3D = document.getElementById('scene-3d-container');
    if (scene3D) {
      scene3D.style.setProperty('display', 'none', 'important');
      scene3D.style.setProperty('visibility', 'hidden', 'important');
      scene3D.style.setProperty('opacity', '0', 'important');
      lastAppliedSceneBgHex = ''; // Re-apply when returning to a color page
    }
    let blueO = document.getElementById('blue-overlay');
    let veryPeriO = document.getElementById('very-peri-overlay');
    let peachFuzzO = document.getElementById('peach-fuzz-overlay');
    if (blueO) {
      blueO.classList.remove('visible');
      blueO.style.setProperty('display', 'none', 'important');
      blueO.style.setProperty('visibility', 'hidden', 'important');
      blueO.style.setProperty('opacity', '0', 'important');
    }
    if (veryPeriO) {
      veryPeriO.classList.remove('visible');
      veryPeriO.style.setProperty('display', 'none', 'important');
      veryPeriO.style.setProperty('visibility', 'hidden', 'important');
      veryPeriO.style.setProperty('opacity', '0', 'important');
    }
    if (peachFuzzO) {
      peachFuzzO.classList.remove('visible');
      peachFuzzO.style.setProperty('display', 'none', 'important');
      peachFuzzO.style.setProperty('visibility', 'hidden', 'important');
      peachFuzzO.style.setProperty('opacity', '0', 'important');
    }
  } else if (document.body && !onNavPage) {
    // Color page: apply lerped card color to body so page matches card (no white layer)
    let r = Math.round(bgCurrentColor.r);
    let g = Math.round(bgCurrentColor.g);
    let b = Math.round(bgCurrentColor.b);
    let bgColorHex = '#' +
      (r < 16 ? '0' : '') + r.toString(16) +
      (g < 16 ? '0' : '') + g.toString(16) +
      (b < 16 ? '0' : '') + b.toString(16);
    document.body.style.setProperty('background-color', bgColorHex, 'important');
  }
  
  // Smooth 3D scene container background color transition (matching card transition speed)
  scene3DBgCurrentColor.r = lerp(scene3DBgCurrentColor.r, scene3DBgTargetColor.r, 0.15);
  scene3DBgCurrentColor.g = lerp(scene3DBgCurrentColor.g, scene3DBgTargetColor.g, 0.15);
  scene3DBgCurrentColor.b = lerp(scene3DBgCurrentColor.b, scene3DBgTargetColor.b, 0.15);
  
  // Apply interpolated background color to 3D scene container and Spline viewer every frame (only when on a color page)
  let scene3DContainer = document.getElementById('scene-3d-container');
  if (scene3DContainer && document.body && document.body.classList.contains('color-selected') && !onNavPage) {
    // Check if we're very close to target (within 1 RGB unit) - use exact hex to avoid rounding errors
    let rDiff = Math.abs(scene3DBgCurrentColor.r - scene3DBgTargetColor.r);
    let gDiff = Math.abs(scene3DBgCurrentColor.g - scene3DBgTargetColor.g);
    let bDiff = Math.abs(scene3DBgCurrentColor.b - scene3DBgTargetColor.b);
    
    let sceneColorHex;
    if (rDiff < 1 && gDiff < 1 && bDiff < 1) {
      // Use exact hex value when close to target
      sceneColorHex = scene3DBgTargetHex;
    } else {
      // Use interpolated color during transition
      let sceneR = Math.round(scene3DBgCurrentColor.r);
      let sceneG = Math.round(scene3DBgCurrentColor.g);
      let sceneB = Math.round(scene3DBgCurrentColor.b);
      sceneColorHex = '#' + 
        sceneR.toString(16).padStart(2, '0') +
        sceneG.toString(16).padStart(2, '0') +
        sceneB.toString(16).padStart(2, '0');
    }
    
    // Use EXACT card color - get it directly from selectedCard
    let finalColor = sceneColorHex;
    if (selectedCardIndex !== -1) {
      let selectedCard = pantoneData[selectedCardIndex];
      if (selectedCard && selectedCard.hex) {
        finalColor = selectedCard.hex; // Use EXACT card color
      }
    }
    
    // Only set background when color changed – avoids touching viewer every frame (can help with Spline interaction)
    if (finalColor !== lastAppliedSceneBgHex) {
      lastAppliedSceneBgHex = finalColor;
      scene3DContainer.style.setProperty('background-color', finalColor, 'important');
      scene3DContainer.style.backgroundColor = finalColor;
      let splineViewers = scene3DContainer.querySelectorAll('spline-viewer.active');
      splineViewers.forEach(viewer => {
        viewer.style.setProperty('background-color', finalColor, 'important');
        viewer.style.backgroundColor = finalColor;
      });
    }
  }
  if (scene3DContainer && document.body && document.body.classList.contains('page-about')) {
    scene3DContainer.style.setProperty('display', 'none', 'important');
    scene3DContainer.style.setProperty('visibility', 'hidden', 'important');
    scene3DContainer.style.setProperty('opacity', '0', 'important');
    lastAppliedSceneBgHex = ''; // Re-apply when returning to a color page
  }
  
  // Full-screen paper texture only on nav pages (home, Credits) – on color pages skip it so body (card color) shows through, no white layer
  if (!isAboutPage && onNavPage) {
    blendMode(MULTIPLY);
    image(paperTextureImg, 0, 0, width, height);
    blendMode(BLEND);
  }
  
  // About page: every time we're on About, show the messy scattered fan (same page every time)
  if (aboutPageVisible && !aboutPageVisiblePrev) {
    setScatterTargets();
    stopAllSplineAudio(); // Exit color page fully – stop 3D/color audio
    aboutCleanupBlend = 0;
    aboutCleanupHoverSmoothed = 0;
    aboutCleanupLocked = false;
    aboutCleanupHoverOffsetX = 0;
    aboutCleanupHoverOffsetY = 0;
    pantoneData.forEach(item => { if (item.cleanupHoverBlend != null) item.cleanupHoverBlend = 0; });
    aboutPagePileBackOnly = false;
    aboutCleanupReturnToScatter = false;
    hideAboutVideo();
  }
  if (aboutPageVisiblePrev && !aboutPageVisible) {
    hideAboutVideo();
  }
  aboutPageVisiblePrev = aboutPageVisible;
  if (aboutPageVisible) {
    if (aboutPagePileBackOnly) {
      aboutPageBlend = max(0, aboutPageBlend - 0.0036);
      aboutCleanupBlend = lerp(aboutCleanupBlend, 0, 0.08);
      if (document.body) document.body.classList.remove('about-cleanup');
      if (aboutPageBlend < 0.01) aboutPagePileBackOnly = false;
    } else {
      // Start a little slower, then normal speed (cards scatter after clicking About)
      let speed = aboutPageBlend < 0.25 ? 0.0032 : 0.0062;
      aboutPageBlend = min(1, aboutPageBlend + speed);
      // Once cleanup is full, lock so cards stay still until user clicks a card
      if (aboutCleanupBlend >= 0.98) aboutCleanupLocked = true;
      if (aboutCleanupLocked) {
        aboutCleanupBlend = 1;
        if (document.body) document.body.classList.add('about-cleanup');
        // 2s after cards pile: show video masked to pile shape (once per lock)
        if (!aboutVideoDelayStarted) {
          aboutVideoDelayStarted = true;
          aboutVideoTimeoutId = setTimeout(function() {
            aboutVideoTimeoutId = null;
            showAboutVideo();
          }, 2000);
        }
        // Per-card natural motion: only the hovered card (on the right) moves lightly toward cursor
        let hoveredCardIndex = getAboutPageCardAtMouse();
        pantoneData.forEach((item, i) => {
          let target = (i === hoveredCardIndex) ? 1 : 0;
          item.cleanupHoverBlend = lerp(item.cleanupHoverBlend != null ? item.cleanupHoverBlend : 0, target, 0.12);
        });
        aboutCleanupHoverOffsetX = 0;
        aboutCleanupHoverOffsetY = 0;
      } else {
        aboutCleanupHoverOffsetX = lerp(aboutCleanupHoverOffsetX, 0, 0.15);
        aboutCleanupHoverOffsetY = lerp(aboutCleanupHoverOffsetY, 0, 0.15);
        pantoneData.forEach(item => { if (item.cleanupHoverBlend != null) item.cleanupHoverBlend = lerp(item.cleanupHoverBlend, 0, 0.15); });
        // After click on piled cards: force spread back to messy; otherwise hover drives cleanup
        if (aboutCleanupReturnToScatter) {
          aboutCleanupHoverSmoothed = 0;
          let targetCleanup = 0;
          aboutCleanupBlend = lerp(aboutCleanupBlend, targetCleanup, 0.065);
          if (aboutCleanupBlend < 0.05) aboutCleanupReturnToScatter = false;
        } else {
          let overCards = getAboutPageCardAtMouse() !== -1;
          aboutCleanupHoverSmoothed = lerp(aboutCleanupHoverSmoothed, overCards ? 1 : 0, 0.14);
          let targetCleanup = aboutCleanupHoverSmoothed;
          aboutCleanupBlend = lerp(aboutCleanupBlend, targetCleanup, 0.055);
        }
        if (document.body) {
          if (aboutCleanupBlend > 0.35) document.body.classList.add('about-cleanup');
          else if (aboutCleanupBlend < 0.2) document.body.classList.remove('about-cleanup');
        }
      }
    }
  } else {
    aboutPageBlend = max(0, aboutPageBlend - 0.0036);
    aboutCleanupBlend = lerp(aboutCleanupBlend, 0, 0.08);
    aboutCleanupHoverSmoothed = lerp(aboutCleanupHoverSmoothed, 0, 0.15);
    aboutCleanupHoverOffsetX = lerp(aboutCleanupHoverOffsetX, 0, 0.15);
    aboutCleanupHoverOffsetY = lerp(aboutCleanupHoverOffsetY, 0, 0.15);
    pantoneData.forEach(item => { if (item.cleanupHoverBlend != null) item.cleanupHoverBlend = lerp(item.cleanupHoverBlend, 0, 0.15); });
    aboutCleanupReturnToScatter = false;
    if (document.body) document.body.classList.remove('about-cleanup');
  }
  
  drawGrid();
  updateFanLogic();
  drawStandingFan();

  // Hover sound: play note on card enter (polyphonic – overlapping hovers = glissando)
  if (hoverIndex !== lastHoverSoundIndex && hoverIndex !== -1 && fanState > 0.5) {
    playHoverNote(hoverIndex);
    lastHoverSoundIndex = hoverIndex;
  }
  if (hoverIndex === -1) lastHoverSoundIndex = -1;

  // ============================================================
  // Smart Interaction Management (Magic Click-Through)
  // ============================================================
  
  let p5Canvas = document.querySelector('canvas');
  if (p5Canvas) {
      let inTriggerZone = (mouseX > width - colWidth);
      // About page: ALWAYS enable pointer-events so right-side click (spread cards back) is received
      let onAboutPage = (document.body && document.body.classList.contains('page-about'));
      let onAboutCards = (aboutPageBlend > 0.5 && (getScatteredCardAtMouse() !== -1 || getAboutPageCardAtMouse() !== -1));
      let isTouchingCard = onAboutCards || (getCardAtMouse() !== -1);
      
      if (onAboutPage || inTriggerZone || isTouchingCard) {
          p5Canvas.style.setProperty('pointer-events', 'auto', 'important');
          if (isTouchingCard || onAboutCards) cursor('pointer');
          else cursor('default');
      } else {
          p5Canvas.style.setProperty('pointer-events', 'none', 'important');
          cursor('default');
      }
  }
}

function drawGrid() {
    // Grid line removed - no longer drawing the line behind the fan
    // stroke(0, 10);
    // strokeWeight(1);
    // line(width - colWidth, 0, width - colWidth, height);
}

// About page: assign random "thrown on table" positions and angles for each card
function setScatterTargets() {
  let margin = 80;
  for (let item of pantoneData) {
    item.scatterX = random(margin, width - margin);
    item.scatterY = random(margin, height - margin);
    item.scatterAngle = random(-PI / 2, PI / 2);
    item.scatterDelay = random(0, 0.38); // Stagger so cards don't all move at once
  }
  setCleanupTargets();
}

// About page: cleanup = cards pull to right half of screen (reveal text on left)
function setCleanupTargets() {
  let rightHalfStart = width * 0.5;
  let margin = 100;
  for (let item of pantoneData) {
    item.cleanupX = random(rightHalfStart, width - margin);
    item.cleanupY = random(margin, height - margin);
    item.cleanupAngle = random(-0.4, 0.4); // Slight tilt, stacked look
    if (item.cleanupHoverBlend == null) item.cleanupHoverBlend = 0;
  }
}

// Ease-out cubic: natural deceleration as cards "land"
function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}

// Ease-in cubic: natural acceleration as cards "pile back" toward fan
function easeInCubic(t) {
  return t * t * t;
}

// About page: hide video overlay and clear 2s delay timeout (when spreading back or leaving About)
function hideAboutVideo() {
  if (aboutVideoTimeoutId != null) {
    clearTimeout(aboutVideoTimeoutId);
    aboutVideoTimeoutId = null;
  }
  aboutVideoDelayStarted = false;
  let container = document.getElementById('about-video-container');
  let video = document.getElementById('about-video');
  if (container) {
    container.classList.remove('visible');
    container.setAttribute('aria-hidden', 'true');
  }
  if (video) {
    video.pause();
    video.currentTime = 0;
  }
}

// About page: show video masked to pile shape and play (called 2s after cards pile)
function showAboutVideo() {
  let container = document.getElementById('about-video-container');
  let video = document.getElementById('about-video');
  if (!container || !video) return;
  container.classList.add('visible');
  container.setAttribute('aria-hidden', 'false');
  video.play().catch(function() {});
}

// About page: is mouse over any card at current position (scatter blended with cleanup)? For hover-to-cleanup
function getAboutPageCardAtMouse() {
  if (aboutPageBlend < 0.3) return -1;
  let total = pantoneData.length;
  let startAngle = 1.5 * PI;
  let endAngle = 1.5 * PI - (radians(80) * fanState);
  for (let i = total - 1; i >= 0; i--) {
    let item = pantoneData[i];
    if (item.scatterX == null || item.scatterY == null || item.scatterAngle == null) continue;
    let baseAngle = map(i, 0, total - 1, startAngle, endAngle);
    let finalAngle = baseAngle + (item.angleOffset || 0);
    let delay = item.scatterDelay != null ? item.scatterDelay : 0;
    let rawProgress = (1 - delay) > 0.01 ? max(0, min(1, (aboutPageBlend - delay) / (1 - delay))) : aboutPageBlend;
    let isReturning = (typeof window !== 'undefined' && window.aboutPageVisible === false);
    let cardProgress = isReturning ? 1 - easeInCubic(1 - rawProgress) : easeOutCubic(rawProgress);
    let scatterDrawX = lerp(pivotX, item.scatterX, cardProgress);
    let scatterDrawY = lerp(pivotY, item.scatterY, cardProgress);
    let scatterDrawAngle = lerp(finalAngle, item.scatterAngle, cardProgress);
    let drawX = scatterDrawX, drawY = scatterDrawY, drawAngle = scatterDrawAngle;
    if (aboutCleanupBlend > 0 && item.cleanupX != null && item.cleanupY != null && item.cleanupAngle != null) {
      drawX = lerp(scatterDrawX, item.cleanupX, aboutCleanupBlend);
      drawY = lerp(scatterDrawY, item.cleanupY, aboutCleanupBlend);
      drawAngle = lerp(scatterDrawAngle, item.cleanupAngle, aboutCleanupBlend);
      if (aboutCleanupLocked && (item.cleanupHoverBlend != null)) {
        let blend = item.cleanupHoverBlend;
        drawX += (mouseX - item.cleanupX) * 0.1 * blend;
        drawY += (mouseY - item.cleanupY) * 0.1 * blend;
      } else if (aboutCleanupLocked) {
        drawX += aboutCleanupHoverOffsetX;
        drawY += aboutCleanupHoverOffsetY;
      }
    }
    let dx = mouseX - drawX, dy = mouseY - drawY;
    let localX = dx * cos(drawAngle) + dy * sin(drawAngle);
    let localY = -dx * sin(drawAngle) + dy * cos(drawAngle);
    if (localX >= 0 && localX <= item.animOffset && localY >= -cardThickness / 2 && localY <= cardThickness / 2) return i;
  }
  return -1;
}

// About page: which scattered card is under the mouse? (for 2026 click-to-go-home)
function getScatteredCardAtMouse() {
  if (aboutPageBlend < 0.3) return -1;
  let total = pantoneData.length;
  let startAngle = 1.5 * PI;
  let endAngle = 1.5 * PI - (radians(80) * fanState);
  // Check cards in reverse order (front to back)
  for (let i = total - 1; i >= 0; i--) {
    let item = pantoneData[i];
    if (item.scatterX == null || item.scatterY == null || item.scatterAngle == null) continue;
    let baseAngle = map(i, 0, total - 1, startAngle, endAngle);
    let finalAngle = baseAngle + (item.angleOffset || 0);
    let delay = item.scatterDelay != null ? item.scatterDelay : 0;
    let rawProgress = (1 - delay) > 0.01 ? max(0, min(1, (aboutPageBlend - delay) / (1 - delay))) : aboutPageBlend;
    let isReturning = (typeof window !== 'undefined' && window.aboutPageVisible === false);
    let cardProgress = isReturning ? 1 - easeInCubic(1 - rawProgress) : easeOutCubic(rawProgress);
    let drawX = lerp(pivotX, item.scatterX, cardProgress);
    let drawY = lerp(pivotY, item.scatterY, cardProgress);
    let drawAngle = lerp(finalAngle, item.scatterAngle, cardProgress);
    // Hit test: point in rotated rect (card from 0 to cardLength, -thickness/2 to thickness/2)
    let dx = mouseX - drawX;
    let dy = mouseY - drawY;
    let localX = dx * cos(drawAngle) + dy * sin(drawAngle);
    let localY = -dx * sin(drawAngle) + dy * cos(drawAngle);
    if (localX >= 0 && localX <= item.animOffset && localY >= -cardThickness / 2 && localY <= cardThickness / 2) {
      return i;
    }
  }
  return -1;
}

// ======================================================
//              לוגיקה (Smart Keep-Alive)
// ======================================================

function updateFanLogic() {
    // About page: keep fan "open" while scattered so return transition is smooth
    if (aboutPageBlend > 0.5) {
      fanState = lerp(fanState, 1.0, 0.04);
      return;
    }
    // Homepage: closing after 2026 click – use same smooth close as color pages
    if (closingFanForHome && fanState < 0.001) {
        fanState = 0.0;
        closingFanForHome = false;
    }
    // Allow fan to open/close even when 3D scene is visible
    let inTriggerZone = (mouseX > width - colWidth);
    let inFanZone = false;
    
    if (fanState > 0.1 && !closingFanForHome) {
        let d = dist(mouseX, mouseY, pivotX, pivotY);
        if (d < cardLength && mouseY < pivotY + 100) {
            inFanZone = true;
        }
    }

    let target = closingFanForHome ? 0.0 : ((inTriggerZone || inFanZone) ? 1.0 : 0.0);
    
    // Update 2026 card target color (nav pages set in draw(); here only when on color page with fan closed)
    if (fanState > 0.1) {
        card2026TargetColor = { r: 252, g: 251, b: 240 }; // #FCFBF0 (white)
    } else if (fanState < 0.1 && selectedCardIndex !== -1 && document.body && document.body.classList.contains('color-selected')) {
        let selectedCard = pantoneData[selectedCardIndex];
        let targetHex = scene3DBgTargetHex;
        if (selectedCard && selectedCard.code === '17-3938') targetHex = '#0E003A';   // Very Peri – dark blend
        else if (selectedCard && selectedCard.code === '13-1023') targetHex = '#FFBC95'; // Peach Fuzz
        else if (selectedCard && selectedCard.code === '15-5217') targetHex = '#17B0AC'; // Blue Turquoise
        let targetRgb = hexToRgb(targetHex);
        if (targetRgb) {
            card2026TargetColor = { r: targetRgb.r, g: targetRgb.g, b: targetRgb.b };
        } else {
            card2026TargetColor = { r: scene3DBgTargetColor.r, g: scene3DBgTargetColor.g, b: scene3DBgTargetColor.b };
        }
    }
    
    // Smooth closing - use faster lerp when close to 0 to avoid jump
    if (target === 0.0 && fanState < 0.05) {
        // When very close to closed, snap smoothly to 0
        fanState = lerp(fanState, 0.0, 0.15);
        if (fanState < 0.001) {
            fanState = 0.0; // Snap to exactly 0 when close enough
        }
    } else {
        fanState = lerp(fanState, target, 0.06);
    }
}

// ======================================================
//              ציור המניפה (Next Card Reveal)
// ======================================================

function drawStandingFan() {
    let total = pantoneData.length;
    
    let breathing = 0;
    if (fanState > 0.5) {
        breathing = sin(frameCount * 0.03) * 0.015;
    }

    let startAngle = 1.5 * PI; 
    let endAngle = 1.5 * PI - (radians(80) * fanState) + breathing; 
    
    // 1. זיהוי Hover
    hoverIndex = -1;
    let dx = mouseX - pivotX;
    let dy = mouseY - pivotY;
    let mouseAngle = atan2(dy, dx);
    if (mouseAngle < 0) mouseAngle += TWO_PI;
    
    for (let i = 0; i < total; i++) {
        let baseAngle = map(i, 0, total - 1, startAngle, endAngle);
        // Smooth transition instead of sudden jump at 0.1 threshold
        if (fanState < 0.1) {
            let offsetFactor = map(fanState, 0, 0.1, 0.002, 0);
            baseAngle -= (i * offsetFactor);
        }
        
        let distFromPivot = dist(mouseX, mouseY, pivotX, pivotY);
        let angleDiff = abs(mouseAngle - baseAngle);
        
        if (fanState > 0.5 && angleDiff < 0.03 && distFromPivot < cardLength) {
            hoverIndex = i;
        }
    }

    // 2. ציור וחישוב התזוזה
    for (let i = 0; i < total; i++) {
        let item = pantoneData[i];
        let baseAngle = map(i, 0, total - 1, startAngle, endAngle);
        // Smooth transition instead of sudden jump at 0.1 threshold
        if (fanState < 0.1) {
            let offsetFactor = map(fanState, 0, 0.1, 0.002, 0);
            baseAngle -= (i * offsetFactor);
        }

        let targetAngleOffset = 0;
        
        if (hoverIndex !== -1 && fanState > 0.8) {
            // אם הכרטיס הנוכחי (i) הוא כרטיס שנמצא "אחרי" או "מעל" הכרטיס הנבחר
            // כלומר, האינדקס שלו גדול מ-hoverIndex (למשל hover=2007, i=2008)
            if (i > hoverIndex) {
                 // מזיזים אותו שמאלה/למטה כדי לחשוף את מה שמתחתיו
                 // הערך -0.06 יוצר חשיפה של בערך שליש כרטיס
                 targetAngleOffset = -0.04; 
            }
        }
        
        item.angleOffset = lerp(item.angleOffset, targetAngleOffset, 0.1);
        let finalAngle = baseAngle + item.angleOffset;

        // אורך קבוע
        let targetLen = cardLength; 
        item.animOffset = lerp(item.animOffset, targetLen, 0.15);
        
        // About page: interpolate to scattered "thrown on table" position
        let drawX = pivotX;
        let drawY = pivotY;
        let drawAngle = finalAngle;
        if (aboutPageBlend > 0 && item.scatterX != null && item.scatterY != null && item.scatterAngle != null) {
          let delay = item.scatterDelay != null ? item.scatterDelay : 0;
          let rawProgress = (1 - delay) > 0.01 ? max(0, min(1, (aboutPageBlend - delay) / (1 - delay))) : aboutPageBlend;
          let isReturning = (typeof window !== 'undefined' && window.aboutPageVisible === false);
          let cardProgress = isReturning
            ? 1 - easeInCubic(1 - rawProgress)  // Piling back: ease-in (slow start, then gather)
            : easeOutCubic(rawProgress);         // Throwing: ease-out (decelerate as they land)
          drawX = lerp(pivotX, item.scatterX, cardProgress);
          drawY = lerp(pivotY, item.scatterY, cardProgress);
          drawAngle = lerp(finalAngle, item.scatterAngle, cardProgress);
          // About page: hover cleanup – blend toward right-half positions
          if (aboutCleanupBlend > 0 && item.cleanupX != null && item.cleanupY != null && item.cleanupAngle != null) {
            drawX = lerp(drawX, item.cleanupX, aboutCleanupBlend);
            drawY = lerp(drawY, item.cleanupY, aboutCleanupBlend);
            drawAngle = lerp(drawAngle, item.cleanupAngle, aboutCleanupBlend);
            // When locked: per-card natural motion – only the hovered card moves lightly toward cursor
            if (aboutCleanupLocked) {
              let blend = item.cleanupHoverBlend != null ? item.cleanupHoverBlend : 0;
              drawX += (mouseX - item.cleanupX) * 0.1 * blend;
              drawY += (mouseY - item.cleanupY) * 0.1 * blend;
              drawAngle += 0.06 * blend * (mouseX > item.cleanupX ? 1 : -1);
            }
          }
        }
        
        drawBlade(item, drawX, drawY, drawAngle, item.animOffset, cardThickness);
    }
}

function drawBlade(item, cx, cy, angle, len, thickness) {
    push();
    translate(cx, cy);
    rotate(angle);
    
    // Determine card color: use interpolated color for smooth transitions
    let cardColor;
    if (item.code === '11-4201') {
        // 2026 card: on Credits/About ALWAYS use 2026 Cloud Dancer white (no reliance on lerp/state)
        let body = document.body;
        let onCreditsOrAbout = body && (body.classList.contains('page-credits') || body.classList.contains('page-about'));
        if (onCreditsOrAbout) {
            cardColor = color(252, 251, 240); // #FCFBF0 Cloud Dancer – force so it never shows last color page
        } else {
        let onNavPage = body && (body.classList.contains('page-about') || body.classList.contains('page-credits') || !body.classList.contains('color-selected'));
        if (onNavPage) {
            cardColor = color(card2026CurrentColor.r, card2026CurrentColor.g, card2026CurrentColor.b);
        } else if (selectedCardIndex !== -1 && fanState < 0.1) {
            // On a color page with fan closed: use LERPED color so transition white ↔ Very Peri / etc. is silk-smooth
            cardColor = color(card2026CurrentColor.r, card2026CurrentColor.g, card2026CurrentColor.b);
        } else {
            cardColor = color(card2026CurrentColor.r, card2026CurrentColor.g, card2026CurrentColor.b);
        }
        }
    } else {
        // All other cards: use interpolated color for smooth transitions
        if (item.currentColor) {
            cardColor = color(item.currentColor.r, item.currentColor.g, item.currentColor.b);
        } else {
            // Fallback to hex if currentColor not initialized
            cardColor = item.hex;
        }
    }
    
    // צל
    push();
    drawingContext.shadowOffsetX = 0; 
    drawingContext.shadowOffsetY = 2; 
    drawingContext.shadowBlur = 4;
    drawingContext.shadowColor = 'rgba(0,0,0,0.04)'; 
    noStroke();
    fill(cardColor);
    rect(0, -thickness/2, len, thickness); 
    pop();

    // גוף הכרטיס
    noStroke();
    fill(cardColor);
    rect(0, -thickness/2, len, thickness);

    // טקסטורה
    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(0, -thickness/2, len, thickness);
    drawingContext.clip();
    blendMode(MULTIPLY);
    image(paperTextureImg, 0, -thickness/2, len, thickness);
    blendMode(BLEND);
    drawingContext.restore();
    pop();

    // טקסט
    push();
    rotate(PI); 
    
    // Text color logic:
    // - 2026 card when fan is open (white card): use homepage title gray (#393939)
    // - 2026 card when fan is closed and color selected: use white text (matching selected card)
    // - 2026 card default (homepage): use homepage title gray (#393939)
    // - All other cards: use white text (#FCFBF0)
    let txtColor;
    if (item.code === '11-4201') {
        let onCreditsOrAboutTxt = document.body && (document.body.classList.contains('page-credits') || document.body.classList.contains('page-about'));
        if (onCreditsOrAboutTxt) {
            txtColor = color('#393939'); // Credits/About: card is 2026 white, use gray text
        } else if (fanState >= 0.1) {
            // Fan is open: card is white, use homepage title gray
            txtColor = color('#393939');
        } else if (selectedCardIndex !== -1 && fanState < 0.1) {
            // Fan is closed and color selected: use white text (matching selected color card)
            txtColor = color('#FCFBF0');
        } else {
            // Default (homepage): use homepage title gray
            txtColor = color('#393939');
        }
    } else {
        // All other cards: white text
        txtColor = color('#FCFBF0');
    }
    fill(txtColor);
    noStroke();
    textSize(14);
    
    let textYPos = -thickness/2 + 20; 

    textAlign(LEFT, CENTER);
    
    // Text content logic:
    // - On Credits/About: 2026 card always shows its own info (2026, Cloud Dancer)
    // - 2026 card when fan is closed and color selected (on a color page): show selected color's information
    // - All other cards: show their own information
    let displayYear, displayCode, displayName;
    let onCreditsOrAboutForText = document.body && (document.body.classList.contains('page-credits') || document.body.classList.contains('page-about'));
    if (item.code === '11-4201' && onCreditsOrAboutForText) {
        // Credits/About: always show 2026 card's own information
        displayYear = item.year;
        displayCode = item.code;
        displayName = item.name;
    } else if (item.code === '11-4201' && selectedCardIndex !== -1 && fanState < 0.1) {
        // 2026 card when fan is closed and color selected: use selected color's information
        let selectedCard = pantoneData[selectedCardIndex];
        displayYear = selectedCard.year;
        displayCode = selectedCard.code;
        displayName = selectedCard.name;
    } else {
        // Default: use card's own information
        displayYear = item.year;
        displayCode = item.code;
        displayName = item.name;
    }
    
    text(`${displayYear}   ${displayCode}   ${displayName}`, -len + 20, textYPos);

    pop(); 

    pop(); 
}

function mousePressed() {
    // About page ONLY: click on right half while cards are piled = spread cards back to cover screen
    let onAbout = document.body && document.body.classList.contains('page-about');
    let clickOnRightHalf = (mouseX > width * 0.5);
    let cardsPiledOnRight = (aboutCleanupBlend > 0.25);
    if (onAbout && clickOnRightHalf && cardsPiledOnRight) {
        fanState = 0;
        aboutCleanupLocked = false;
        aboutCleanupHoverSmoothed = 0;
        aboutCleanupReturnToScatter = true;
        aboutCleanupHoverOffsetX = 0;
        aboutCleanupHoverOffsetY = 0;
        hideAboutVideo();
        pantoneData.forEach(item => { if (item.cleanupHoverBlend != null) item.cleanupHoverBlend = 0; });
        return;
    }
    // About page: scattered cards – click card = go home, click BG = pile back
    if (aboutPageBlend > 0.5) {
        fanState = 0;
        let onCard = getScatteredCardAtMouse() !== -1 || getAboutPageCardAtMouse() !== -1;
        if (aboutCleanupLocked) {
            if (onCard || clickOnRightHalf) {
                aboutCleanupLocked = false;
                aboutCleanupHoverSmoothed = 0;
                aboutCleanupReturnToScatter = true;
                aboutCleanupHoverOffsetX = 0;
                aboutCleanupHoverOffsetY = 0;
                hideAboutVideo();
                pantoneData.forEach(item => { if (item.cleanupHoverBlend != null) item.cleanupHoverBlend = 0; });
            }
            return;
        }
        if (onCard) {
            if (typeof window.onNavigateToHome === 'function') window.onNavigateToHome();
        } else {
            aboutPagePileBackOnly = true;
        }
        return;
    }
    if (fanState > 0.5) {
        let clickedIndex = getCardAtMouse();
        if (clickedIndex !== -1) {
            selectedCardIndex = clickedIndex;
            let selectedCard = pantoneData[clickedIndex];
            currentBgColor = selectedCard.hex;
            
            // Check if 2026 card - go to homepage and close fan with same smooth motion as color pages
            if (selectedCard.code === '11-4201') {
                closingFanForHome = true; // Fan will close via updateFanLogic lerp (same as color pages)
                // Reset selectedCardIndex so 2026 card returns to white
                selectedCardIndex = -1;
                // Set target color to white for smooth transition
                card2026TargetColor = { r: 252, g: 251, b: 240 }; // #FCFBF0
                
                // Update target colors for all cards when returning to homepage
                for (let card of pantoneData) {
                    let cardRgb = hexToRgb(card.hex);
                    if (cardRgb && card.targetColor) {
                        card.targetColor.r = cardRgb.r;
                        card.targetColor.g = cardRgb.g;
                        card.targetColor.b = cardRgb.b;
                    }
                }
                
                // 2026 Cloud Dancer - Return to "Color of the Year" homepage (direct transition, no stuck mixup)
                document.body.classList.remove('color-selected');
                document.body.classList.remove('color-11-4201');
                bgTargetColor = { r: 252, g: 251, b: 240 }; // #FCFBF0
                scene3DBgTargetColor = { r: 252, g: 251, b: 240 };
                scene3DBgTargetHex = '#FCFBF0';
                
                // Direct hide: overlays and 3D scene so no stuck mixup
                let scene3DContainer = document.getElementById('scene-3d-container');
                if (scene3DContainer) {
                    scene3DContainer.classList.remove('visible', 'transitioning-in');
                    scene3DContainer.style.setProperty('display', 'none', 'important');
                    scene3DContainer.style.setProperty('visibility', 'hidden', 'important');
                    scene3DContainer.style.setProperty('opacity', '0', 'important');
                }
                let blueOverlayHome = document.getElementById('blue-overlay');
                let veryPeriOverlayHome = document.getElementById('very-peri-overlay');
                let peachFuzzOverlayHome = document.getElementById('peach-fuzz-overlay');
                if (blueOverlayHome) {
                    blueOverlayHome.classList.remove('visible');
                    blueOverlayHome.style.setProperty('display', 'none', 'important');
                    blueOverlayHome.style.setProperty('visibility', 'hidden', 'important');
                    blueOverlayHome.style.setProperty('opacity', '0', 'important');
                }
                if (veryPeriOverlayHome) {
                    veryPeriOverlayHome.classList.remove('visible');
                    veryPeriOverlayHome.style.setProperty('display', 'none', 'important');
                    veryPeriOverlayHome.style.setProperty('visibility', 'hidden', 'important');
                    veryPeriOverlayHome.style.setProperty('opacity', '0', 'important');
                }
                if (peachFuzzOverlayHome) {
                    peachFuzzOverlayHome.classList.remove('visible');
                    peachFuzzOverlayHome.style.setProperty('display', 'none', 'important');
                    peachFuzzOverlayHome.style.setProperty('visibility', 'hidden', 'important');
                    peachFuzzOverlayHome.style.setProperty('opacity', '0', 'important');
                }
                let blueDimHome = document.getElementById('blue-overlay-dim');
                let veryPeriDimHome = document.getElementById('very-peri-overlay-dim');
                let peachFuzzDimHome = document.getElementById('peach-fuzz-overlay-dim');
                if (blueDimHome) { blueDimHome.style.setProperty('display', 'none', 'important'); blueDimHome.style.opacity = '0'; }
                if (veryPeriDimHome) { veryPeriDimHome.style.setProperty('display', 'none', 'important'); veryPeriDimHome.style.opacity = '0'; }
                if (peachFuzzDimHome) { peachFuzzDimHome.style.setProperty('display', 'none', 'important'); peachFuzzDimHome.style.opacity = '0'; }
                
                // Show homepage text
                let h1Element = document.getElementById('main-text');
                if (h1Element) {
                    h1Element.style.removeProperty('display');
                    h1Element.style.setProperty('opacity', '1', 'important');
                    h1Element.style.setProperty('visibility', 'visible', 'important');
                    h1Element.style.color = '#393939';
                }
                
                // Update navbar to homepage color
                let navbarContainers = document.querySelectorAll('.text-container');
                navbarContainers.forEach(container => {
                    container.style.setProperty('color', '#393939', 'important');
                });
                
                stopAllSplineAudio();
                window.selectedPantoneColor = selectedCard;
                if (typeof window.onNavigateToHome === 'function') window.onNavigateToHome();
                return;
            }
            
            // All color pages (except 2026): body background = card color. Blue Turquoise, Very Peri, Peach Fuzz keep their overlays; other colors get matching bg.
            let cardBgRgb = hexToRgb(selectedCard.hex);
            if (cardBgRgb) {
                bgTargetColor = { r: cardBgRgb.r, g: cardBgRgb.g, b: cardBgRgb.b };
                scene3DBgTargetColor = { r: cardBgRgb.r, g: cardBgRgb.g, b: cardBgRgb.b };
                scene3DBgTargetHex = selectedCard.hex;
            }
            
            // 2026 card target is set from 3D viewer bg in updateFanLogic() – same transition as page bg
            
            // Update target colors for all cards to enable smooth transitions when pages switch
            for (let card of pantoneData) {
                let cardRgb = hexToRgb(card.hex);
                if (cardRgb && card.targetColor) {
                    card.targetColor.r = cardRgb.r;
                    card.targetColor.g = cardRgb.g;
                    card.targetColor.b = cardRgb.b;
                }
            }
            
            // Leaving nav page (Credits/About) for color page: remove nav classes and hide ALL nav content so we don't get mixed UI (incl. Peach Fuzz / Very Peri)
            document.body.classList.remove('page-credits', 'page-about');
            var aboutPageEl = document.getElementById('about-page');
            var creditsPageEl = document.getElementById('credits-page');
            if (aboutPageEl) { aboutPageEl.classList.remove('visible'); aboutPageEl.setAttribute('aria-hidden', 'true'); }
            if (creditsPageEl) { creditsPageEl.classList.remove('visible'); creditsPageEl.setAttribute('aria-hidden', 'true'); }
            // About title and text: clear inline so CSS body.color-selected hides them
            var aboutTitleEl = document.getElementById('about-title');
            var aboutTextEl = document.getElementById('about-text-container');
            if (aboutTitleEl) {
                aboutTitleEl.style.removeProperty('display');
                aboutTitleEl.style.removeProperty('visibility');
                aboutTitleEl.style.removeProperty('opacity');
                aboutTitleEl.classList.remove('visible');
                aboutTitleEl.setAttribute('aria-hidden', 'true');
            }
            if (aboutTextEl) {
                aboutTextEl.style.removeProperty('display');
                aboutTextEl.style.removeProperty('visibility');
                aboutTextEl.style.removeProperty('opacity');
                aboutTextEl.setAttribute('aria-hidden', 'true');
            }
            // Credits/About content: clear inline display/visibility so CSS body.color-selected hides them (no inline override – so when we go back to Credits, CSS body.page-credits can show video)
            var creditsTitleEl = document.getElementById('credits-title');
            var creditsTextEl = document.getElementById('credits-text-container');
            var creditsVideoEl = document.getElementById('credits-video-container');
            if (creditsTitleEl) {
                creditsTitleEl.style.removeProperty('display');
                creditsTitleEl.style.removeProperty('visibility');
                creditsTitleEl.style.removeProperty('opacity');
                creditsTitleEl.classList.remove('visible');
                creditsTitleEl.setAttribute('aria-hidden', 'true');
            }
            if (creditsTextEl) {
                creditsTextEl.style.removeProperty('display');
                creditsTextEl.style.removeProperty('visibility');
                creditsTextEl.style.removeProperty('opacity');
                creditsTextEl.setAttribute('aria-hidden', 'true');
            }
            if (creditsVideoEl) {
                creditsVideoEl.style.removeProperty('display');
                creditsVideoEl.style.removeProperty('visibility');
                creditsVideoEl.style.removeProperty('opacity');
                creditsVideoEl.setAttribute('aria-hidden', 'true');
            }
            if (typeof window.aboutPageVisible !== 'undefined') window.aboutPageVisible = false;
            document.body.classList.add('color-selected');
            document.body.classList.remove('color-11-4201');
            
            // Set target background color for smooth transition
            let bgRgb = hexToRgb(currentBgColor);
            if (bgRgb) {
                bgTargetColor = bgRgb;
            }
            
            show3DScene();
            
            // Update navbar text color based on background
            let navbarContainers = document.querySelectorAll('.text-container');
            if (currentBgColor === '#FCFBF0' || currentBgColor.toLowerCase() === '#fcfbf0') {
                navbarContainers.forEach(container => {
                    container.style.setProperty('color', '#393939', 'important');
                });
            } else {
                navbarContainers.forEach(container => {
                    container.style.setProperty('color', '#FCFBF0', 'important');
                });
            }
            
            let h1Element = document.getElementById('main-text');
            let peachFuzzText = document.getElementById('peach-fuzz-text');
            let colorTextContainer = document.getElementById('color-text-container');
            let colorNameText = document.getElementById('color-name-text');
            let colorYearText = document.getElementById('color-year-text');
            let blueOverlay = document.getElementById('blue-overlay');
            let blueOverlayScroll = document.getElementById('blue-overlay-scroll');
            let veryPeriOverlay = document.getElementById('very-peri-overlay');
            let veryPeriOverlayScroll = document.getElementById('very-peri-overlay-scroll');
            let peachFuzzOverlay = document.getElementById('peach-fuzz-overlay');
            let peachFuzzOverlayScroll = document.getElementById('peach-fuzz-overlay-scroll');
            
            // All other cards (not 2026) - show 3D scene
            stopAllSplineAudio();
            if (h1Element) h1Element.style.opacity = '0';
                
                if (selectedCard.code === '15-5217') {
                    // Blue Turquoise: show scrollable overlay (pointer-events-none, scroll via wheel)
                    if (veryPeriOverlay) { veryPeriOverlay.classList.remove('visible'); veryPeriOverlay.style.setProperty('display', 'none', 'important'); }
                    if (peachFuzzOverlay) { peachFuzzOverlay.classList.remove('visible'); peachFuzzOverlay.style.setProperty('display', 'none', 'important'); }
                    if (blueOverlay) {
                        blueOverlay.style.setProperty('display', 'block', 'important');
                        blueOverlay.style.setProperty('visibility', 'visible', 'important');
                        blueOverlay.style.setProperty('opacity', '1', 'important');
                        blueOverlay.classList.add('visible');
                        if (blueOverlayScroll) blueOverlayScroll.scrollTop = 0;
                    }
                    scheduleUnmuteOnFirstClick('spline-viewer-blue');
                    if (peachFuzzText) {
                        peachFuzzText.classList.remove('visible');
                        peachFuzzText.style.opacity = '0';
                        peachFuzzText.style.visibility = 'hidden';
                    }
                    if (colorTextContainer) {
                        colorTextContainer.classList.remove('visible');
                        colorTextContainer.style.opacity = '0';
                        colorTextContainer.style.visibility = 'hidden';
                    }
                } else if (selectedCard.code === '17-3938') {
                    // Very Peri: show COSMIC PLAYGROUND overlay (same structure + dim as Blue Turquoise)
                    if (blueOverlay) { blueOverlay.classList.remove('visible'); blueOverlay.style.setProperty('display', 'none', 'important'); }
                    if (peachFuzzOverlay) { peachFuzzOverlay.classList.remove('visible'); peachFuzzOverlay.style.setProperty('display', 'none', 'important'); }
                    if (veryPeriOverlay) {
                        veryPeriOverlay.style.setProperty('display', 'block', 'important');
                        veryPeriOverlay.style.setProperty('visibility', 'visible', 'important');
                        veryPeriOverlay.style.setProperty('opacity', '1', 'important');
                        veryPeriOverlay.classList.add('visible');
                        if (veryPeriOverlayScroll) veryPeriOverlayScroll.scrollTop = 0;
                    }
                    scheduleUnmuteOnFirstClick('spline-viewer-default');
                    if (peachFuzzText) {
                        peachFuzzText.classList.remove('visible');
                        peachFuzzText.style.opacity = '0';
                        peachFuzzText.style.visibility = 'hidden';
                    }
                    if (colorTextContainer) {
                        colorTextContainer.classList.remove('visible');
                        colorTextContainer.style.opacity = '0';
                        colorTextContainer.style.visibility = 'hidden';
                    }
                } else if (selectedCard.code === '13-1023') {
                    // Peach Fuzz: show SYNTHETIC WARMTH overlay (same structure + dim as Blue Turquoise)
                    if (blueOverlay) { blueOverlay.classList.remove('visible'); blueOverlay.style.setProperty('display', 'none', 'important'); }
                    if (veryPeriOverlay) { veryPeriOverlay.classList.remove('visible'); veryPeriOverlay.style.setProperty('display', 'none', 'important'); }
                    if (peachFuzzOverlay) {
                        peachFuzzOverlay.style.setProperty('display', 'block', 'important');
                        peachFuzzOverlay.style.setProperty('visibility', 'visible', 'important');
                        peachFuzzOverlay.style.setProperty('opacity', '1', 'important');
                        peachFuzzOverlay.classList.add('visible');
                        if (peachFuzzOverlayScroll) peachFuzzOverlayScroll.scrollTop = 0;
                    }
                    scheduleUnmuteOnFirstClick('spline-viewer-peach');
                    if (peachFuzzText) {
                        peachFuzzText.classList.remove('visible');
                        peachFuzzText.style.opacity = '0';
                        peachFuzzText.style.visibility = 'hidden';
                    }
                    if (colorTextContainer) {
                        colorTextContainer.classList.remove('visible');
                        colorTextContainer.style.opacity = '0';
                        colorTextContainer.style.visibility = 'hidden';
                    }
                } else {
                    // Other colors: no title (titles only on Blue Turquoise, Very Peri, Peach Fuzz)
                    if (blueOverlay) blueOverlay.classList.remove('visible');
                    if (veryPeriOverlay) veryPeriOverlay.classList.remove('visible');
                    if (peachFuzzOverlay) peachFuzzOverlay.classList.remove('visible');
                    if (peachFuzzText) {
                        peachFuzzText.classList.remove('visible');
                        peachFuzzText.style.opacity = '0';
                        peachFuzzText.style.visibility = 'hidden';
                    }
                    if (colorTextContainer) {
                        colorTextContainer.classList.remove('visible');
                        colorTextContainer.style.setProperty('display', 'none', 'important');
                        colorTextContainer.style.setProperty('visibility', 'hidden', 'important');
                        colorTextContainer.style.setProperty('opacity', '0', 'important');
                    }
                }
                
                // Hide 2D text boxes
                let screenText2D = document.getElementById('screen-text-2d');
                let screenTextTranquility = document.getElementById('screen-text-tranquility');
                if (screenText2D) {
                            screenText2D.style.opacity = '0';
                            screenText2D.style.visibility = 'hidden';
                            screenText2D.classList.remove('visible');
                }
                        if (screenTextTranquility) {
                            screenTextTranquility.style.opacity = '0';
                            screenTextTranquility.style.visibility = 'hidden';
                            screenTextTranquility.classList.remove('visible');
                        }
            
            window.selectedPantoneColor = selectedCard;
        }
    }
}

function getCardAtMouse() {
    if (aboutPageBlend > 0.5) return -1; // About page: cards scattered, no click
    let total = pantoneData.length;
    let breathing = (fanState > 0.5) ? sin(frameCount * 0.03) * 0.015 : 0;
    let startAngle = 1.5 * PI; 
    let endAngle = 1.5 * PI - (radians(80) * fanState) + breathing;
    
    let dx = mouseX - pivotX;
    let dy = mouseY - pivotY;
    let mouseAngle = atan2(dy, dx);
    if (mouseAngle < 0) mouseAngle += TWO_PI;
    
    let distFromPivot = dist(mouseX, mouseY, pivotX, pivotY);
    
    // Check cards from top to bottom (reverse order)
    for (let i = total - 1; i >= 0; i--) { // Iterate in reverse
        let item = pantoneData[i];
        let baseAngle = map(i, 0, total - 1, startAngle, endAngle);
        
        if (fanState < 0.1) {
            let offsetFactor = map(fanState, 0, 0.1, 0.002, 0);
            baseAngle -= (i * offsetFactor);
        }
        
        let finalAngle = baseAngle + item.angleOffset;
        
        let angleDiff = abs(mouseAngle - finalAngle);
        if (angleDiff > PI) {
            angleDiff = TWO_PI - angleDiff;
        }
        
        if (angleDiff < 0.08 && distFromPivot < cardLength && distFromPivot > 20) {
            let localX = cos(-finalAngle) * (mouseX - pivotX) - sin(-finalAngle) * (mouseY - pivotY);
            let localY = sin(-finalAngle) * (mouseX - pivotX) + cos(-finalAngle) * (mouseY - pivotY);
            
            if (localX >= 0 && localX <= cardLength && abs(localY) < cardThickness / 2) {
                return i;
            }
        }
    }
    return -1;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createDenseTexture(windowWidth, windowHeight);
  colWidth = width / 5;
  pivotX = width - colWidth / 3;
  pivotY = height - 100;
}

// If p5 pauses the draw loop on window blur (tab switch / click away), resume when user returns
if (typeof window !== 'undefined') {
  window.addEventListener('focus', function() {
    if (typeof loop === 'function') loop();
  });
}

