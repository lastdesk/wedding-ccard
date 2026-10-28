document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const envelopeOverlay = document.getElementById('envelopeOverlay');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const curtainStage = document.getElementById('curtainStage');
  const heroSection = document.getElementById('heroSection');
  const replayBtn = document.getElementById('replayBtn');
  const gardenParticles = document.getElementById('gardenParticles');

  // ==========================================
  // 1. FLOATING GARDEN SPARKLE PARTICLES
  // ==========================================
  function createGardenSparkles() {
    if (!gardenParticles) return;
    gardenParticles.innerHTML = '';
    const count = 18;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'sparkle-dot';
      const size = (Math.random() * 5 + 3).toFixed(1);
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${(Math.random() * 84 + 8).toFixed(1)}%`;
      dot.style.top = `${(Math.random() * 78 + 10).toFixed(1)}%`;
      dot.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
      dot.style.animationDuration = `${(Math.random() * 3 + 3.5).toFixed(2)}s`;
      gardenParticles.appendChild(dot);
    }
  }
  createGardenSparkles();

  // ==========================================
  // 2. ENVELOPE & CURTAIN OPENING SEQUENCE
  // ==========================================
  function openInvitation() {
    if (envelopeOverlay.classList.contains('opening')) return;

    // Step 1: Break wax seal & swing open vertical envelope flaps
    envelopeOverlay.classList.add('opening');

    // Step 2: Part the curtains to reveal the garden, fountain & names
    setTimeout(() => {
      curtainStage.classList.add('curtains-open');
      heroSection.classList.add('curtains-parted');
      body.classList.remove('locked-scroll');
    }, 550);

    // Step 3: Hide envelope overlay completely after transition
    setTimeout(() => {
      envelopeOverlay.classList.add('opened');
      replayBtn.classList.remove('hidden');
    }, 1350);
  }

  function replayIntro() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    body.classList.add('locked-scroll');
    replayBtn.classList.add('hidden');
    curtainStage.classList.remove('curtains-open');
    heroSection.classList.remove('curtains-parted');
    envelopeOverlay.classList.remove('opened');
    // Force reflow before removing 'opening'
    void envelopeOverlay.offsetWidth;
    envelopeOverlay.classList.remove('opening');
  }

  waxSealBtn.addEventListener('click', openInvitation);
  replayBtn.addEventListener('click', replayIntro);

  // ==========================================
  // 3. SCRATCH TO REVEAL HEART (HTML5 CANVAS)
  // ==========================================
  const scratchCanvas = document.getElementById('scratchCanvas');
  const scratchHintText = document.getElementById('scratchHintText');
  const quickRevealBtn = document.getElementById('quickRevealBtn');
  const ctx = scratchCanvas.getContext('2d', { willReadFrequently: true });

  let isDrawing = false;
  let isRevealed = false;
  let lastPoint = null;

  function drawGoldFoilCover() {
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);

    // Soft #79BD9A Jade & Mint-Pearl foil gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#62A885');
    grad.addColorStop(0.25, '#CBEAD8');
    grad.addColorStop(0.5, '#79BD9A');
    grad.addColorStop(0.75, '#E3F3EA');
    grad.addColorStop(1, '#589A79');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle foil shimmer grain pattern
    for (let i = 0; i < 350; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(244, 250, 246, 0.38)' : 'rgba(77, 140, 109, 0.16)';
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Ornamental inner filigree lines on the foil
    ctx.strokeStyle = 'rgba(244, 250, 246, 0.78)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 12, 68, 0, Math.PI * 2);
    ctx.stroke();

    // Foil prompt text
    ctx.fillStyle = '#234F3B';
    ctx.font = '600 18px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', w / 2, h / 2 - 14);

    ctx.font = 'italic 15px "Cormorant Garamond", serif';
    ctx.fillStyle = '#356B52';
    ctx.fillText('to unveil our blessed date', w / 2, h / 2 + 10);
  }

  drawGoldFoilCover();

  function getCanvasPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * scratchCanvas.width,
      y: ((clientY - rect.top) / rect.height) * scratchCanvas.height
    };
  }

  function scratchLine(point) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 36;

    ctx.beginPath();
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
    } else {
      ctx.arc(point.x, point.y, 18, 0, Math.PI * 2);
    }
    ctx.stroke();
    lastPoint = point;
  }

  function checkScratchedPercentage() {
    if (isRevealed) return;
    const imgData = ctx.getImageData(45, 35, 210, 190).data;
    let transparentPixels = 0;
    const totalSampled = imgData.length / 4;

    for (let i = 3; i < imgData.length; i += 16) {
      if (imgData[i] < 128) {
        transparentPixels++;
      }
    }

    const ratio = transparentPixels / (totalSampled / 4);
    if (ratio > 0.42) {
      completeHeartReveal();
    }
  }

  function completeHeartReveal() {
    if (isRevealed) return;
    isRevealed = true;
    scratchCanvas.classList.add('scratched-complete');
    scratchHintText.textContent = '🎉 Sunday, January 10th, 2027!';
    quickRevealBtn.style.display = 'none';
  }

  scratchCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastPoint = getCanvasPos(e);
    scratchLine(lastPoint);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDrawing || isRevealed) return;
    const pos = getCanvasPos(e);
    scratchLine(pos);
  });

  window.addEventListener('mouseup', () => {
    if (isDrawing) {
      isDrawing = false;
      lastPoint = null;
      checkScratchedPercentage();
    }
  });

  scratchCanvas.addEventListener('touchstart', (e) => {
    if (isRevealed) return;
    e.preventDefault();
    isDrawing = true;
    lastPoint = getCanvasPos(e);
    scratchLine(lastPoint);
  }, { passive: false });

  scratchCanvas.addEventListener('touchmove', (e) => {
    if (!isDrawing || isRevealed) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    scratchLine(pos);
  }, { passive: false });

  scratchCanvas.addEventListener('touchend', () => {
    if (isDrawing) {
      isDrawing = false;
      lastPoint = null;
      checkScratchedPercentage();
    }
  });

  quickRevealBtn.addEventListener('click', completeHeartReveal);

  // ==========================================
  // 4. COUNTDOWN TO FOREVER (JAN 10, 2027)
  // ==========================================
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');

  const weddingTargetDate = new Date('2027-01-10T17:00:00').getTime();

  function updateCountdown() {
    const now = Date.now();
    const diff = Math.max(0, weddingTargetDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    cdDays.textContent = String(days).padStart(2, '0');
    cdHours.textContent = String(hours).padStart(2, '0');
    cdMinutes.textContent = String(mins).padStart(2, '0');
    cdSeconds.textContent = String(secs).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================
  // 5. VENUE SWITCHER (WEDDING vs RECEPTION)
  // ==========================================
  const venues = {
    wedding: {
      badge: 'Wedding Ceremony • Sunday, 10th Jan 2027',
      title: 'Akka Garden Marriage Hall',
      address: 'Azad Nagar, Mango, Jamshedpur, Jharkhand',
      pinLabel: '📍 Akka Garden Marriage Hall',
      btnText: 'Directions to Akka Garden',
      embedUrl: 'https://maps.google.com/maps?q=22.841519,86.2030102&hl=en&z=16&output=embed',
      mapsUrl: 'https://www.google.com/maps/place/Akka+Garden/@22.8415239,86.2004353,17z/data=!3m1!4b1!4m6!3m5!1s0x39f5e3c6f487b9d3:0x167efa7738817ed!8m2!3d22.841519!4d86.2030102!16s%2Fg%2F11c6lmwcch?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D'
    },
    reception: {
      badge: 'Reception (Walima) • Tuesday, 12th Jan 2027',
      title: 'Madina Garden',
      address: 'Mango, Jamshedpur, Jharkhand',
      pinLabel: '📍 Madina Garden',
      btnText: 'Directions to Madina Garden',
      embedUrl: 'https://maps.google.com/maps?q=22.825361,86.201174&hl=en&z=16&output=embed',
      mapsUrl: 'https://www.google.com/maps/place/Madina+Garden/@22.8253659,86.1985991,17z/data=!3m1!4b1!4m6!3m5!1s0x39f5e3a5347242fd:0xe2fd79e430255904!8m2!3d22.825361!4d86.201174!16s%2Fg%2F11ttb8pv32?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D'
    }
  };

  const tabWeddingVenue = document.getElementById('tabWeddingVenue');
  const tabReceptionVenue = document.getElementById('tabReceptionVenue');
  const venueEventBadge = document.getElementById('venueEventBadge');
  const venueTitle = document.getElementById('venueTitle');
  const venueAddress = document.getElementById('venueAddress');
  const venueMapIframe = document.getElementById('venueMapIframe');
  const mapPinLabel = document.getElementById('mapPinLabel');
  const venueDirectionsBtn = document.getElementById('venueDirectionsBtn');
  const venueDirectionsText = document.getElementById('venueDirectionsText');

  function selectVenue(key) {
    const v = venues[key];
    if (!v) return;

    const isWedding = key === 'wedding';
    tabWeddingVenue.classList.toggle('active', isWedding);
    tabWeddingVenue.setAttribute('aria-selected', String(isWedding));
    tabReceptionVenue.classList.toggle('active', !isWedding);
    tabReceptionVenue.setAttribute('aria-selected', String(!isWedding));

    venueEventBadge.textContent = v.badge;
    venueTitle.textContent = v.title;
    venueAddress.textContent = v.address;
    mapPinLabel.textContent = v.pinLabel;
    venueDirectionsText.textContent = v.btnText;
    venueDirectionsBtn.href = v.mapsUrl;
    if (venueMapIframe.src !== v.embedUrl) {
      venueMapIframe.src = v.embedUrl;
    }
  }

  tabWeddingVenue.addEventListener('click', () => selectVenue('wedding'));
  tabReceptionVenue.addEventListener('click', () => selectVenue('reception'));

  // ==========================================
  // 6. SAVE THE DATE / CALENDAR INTEGRATION
  // ==========================================
  const saveDateBtnTop = document.getElementById('saveDateBtnTop');
  const saveDateBtnCountdown = document.getElementById('saveDateBtnCountdown');
  const calendarModal = document.getElementById('calendarModal');
  const closeCalendarModal = document.getElementById('closeCalendarModal');
  const googleCalLink = document.getElementById('googleCalLink');
  const downloadIcsBtn = document.getElementById('downloadIcsBtn');

  const eventDetails = {
    title: 'Aeman weds Aquib — Wedding (Nikah)',
    location: 'Akka Garden Marriage Hall, Jamshedpur (https://maps.google.com/?q=22.841519,86.2030102)',
    description:
      'Assalamu Alaikum! Join us to celebrate the wedding of Aeman & Aquib.\n\n' +
      '• Haldi: Friday, Jan 8, 2027\n' +
      '• Mehndi: Saturday, Jan 9, 2027\n' +
      '• Wedding (Nikah): Sunday, Jan 10, 2027 — Akka Garden Marriage Hall\n' +
      '• Reception (Walima): Tuesday, Jan 12, 2027 — Madina Garden',
    startUTC: '20270110T170000',
    endUTC: '20270110T223000'
  };

  const gCalUrl = new URL('https://calendar.google.com/calendar/render');
  gCalUrl.searchParams.set('action', 'TEMPLATE');
  gCalUrl.searchParams.set('text', eventDetails.title);
  gCalUrl.searchParams.set('dates', `${eventDetails.startUTC}/${eventDetails.endUTC}`);
  gCalUrl.searchParams.set('details', eventDetails.description);
  gCalUrl.searchParams.set('location', eventDetails.location);
  googleCalLink.href = gCalUrl.toString();

  function openCalendarSheet() {
    calendarModal.classList.remove('hidden');
  }

  function closeCalendarSheet() {
    calendarModal.classList.add('hidden');
  }

  saveDateBtnTop.addEventListener('click', openCalendarSheet);
  saveDateBtnCountdown.addEventListener('click', openCalendarSheet);
  closeCalendarModal.addEventListener('click', closeCalendarSheet);
  calendarModal.addEventListener('click', (e) => {
    if (e.target === calendarModal) closeCalendarSheet();
  });

  downloadIcsBtn.addEventListener('click', () => {
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AemanWedsAquib//WeddingInvitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:aeman-weds-aquib-20270110@weddingcard.local',
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${eventDetails.startUTC}`,
      `DTEND:${eventDetails.endUTC}`,
      `SUMMARY:${eventDetails.title}`,
      `DESCRIPTION:${eventDetails.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${eventDetails.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Aeman-weds-Aquib-Wedding.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    closeCalendarSheet();
  });
});
