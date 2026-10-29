document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const envelopeOverlay = document.getElementById('envelopeOverlay');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const flowerIntroVeil = document.getElementById('flowerIntroVeil');
  const flowerWindCanvas = document.getElementById('flowerWindCanvas');
  const curtainStage = document.getElementById('curtainStage');
  const heroSection = document.getElementById('heroSection');
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
  // 2. ENVELOPE -> FLOWERS IN WIND CROSSFADE -> CURTAINS & AMBIENT FLOWERS THROUGHOUT
  // ==========================================
  let flowerAnimFrame = null;
  let flowerParticles = [];
  let windRibbons = [];
  let fwWidth = 0;
  let fwHeight = 0;
  let burstPruned = false;
  let flowerElapsedOffset = 0;
  function getScrollY() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  let lastScrollY = getScrollY();
  const fwCtx = flowerWindCanvas ? flowerWindCanvas.getContext('2d') : null;

  const PERSISTENT_FLOWER_COUNT = 10;
  const TOTAL_OPENING_FLOWERS = 56;
  const FADE_START_MS = 1800;
  const FADE_DURATION_MS = 1650;

  const blossomPalettes = [
    { outer: '#FFD6E0', inner: '#F497AA', center: '#D97706' }, // Sakura Blush
    { outer: '#FFFDF8', inner: '#FDE2E4', center: '#EAB308' }, // Ivory Jasmine
    { outer: '#FFE5D9', inner: '#F7A992', center: '#D97706' }  // Soft Peach Blossom
  ];

  const petalPalettes = [
    { tip: '#FECDD3', base: '#FB7185' }, // Rose Blush
    { tip: '#FBCFE8', base: '#F472B6' }, // Pink Petal
    { tip: '#FFFBEB', base: '#FDE68A' }, // Cream Ivory
    { tip: '#FFE4E6', base: '#FDA4AF' }  // Delicate Coral
  ];

  function resizeFlowerCanvas() {
    if (!flowerWindCanvas || !fwCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fwWidth = flowerWindCanvas.clientWidth || 430;
    fwHeight = flowerWindCanvas.clientHeight || window.innerHeight;
    flowerWindCanvas.width = Math.round(fwWidth * dpr);
    flowerWindCanvas.height = Math.round(fwHeight * dpr);
    fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createFlowerParticle(initialSpread = false, persistent = false, gentleMode = false) {
    const roll = Math.random();
    const type = persistent
      ? (roll < 0.42 ? 'blossom' : 'petal')
      : (roll < 0.38 ? 'blossom' : roll < 0.86 ? 'petal' : 'leaf');
    const depth = 0.55 + Math.random() * 0.62;

    let size;
    if (type === 'blossom') {
      size = (10.5 + Math.random() * 8.5) * depth;
    } else if (type === 'petal') {
      size = (7.5 + Math.random() * 6.5) * depth;
    } else {
      size = (7.5 + Math.random() * 5.5) * depth;
    }

    let x, y;
    if (initialSpread) {
      x = -60 + Math.random() * (fwWidth * 0.98);
      y = persistent
        ? -40 + Math.random() * (fwHeight * 0.9)
        : -fwHeight * 0.65 + Math.random() * (fwHeight * 0.92);
    } else if (gentleMode) {
      if (Math.random() < 0.76) {
        x = -55 + Math.random() * (fwWidth * 1.02);
        y = -28 - Math.random() * 40;
      } else {
        x = -35 - Math.random() * 25;
        y = 15 + Math.random() * (fwHeight * 0.55);
      }
    } else if (Math.random() < 0.72) {
      x = -90 + Math.random() * (fwWidth * 0.9);
      y = -35 - Math.random() * 45;
    } else {
      x = -40 - Math.random() * 35;
      y = -20 + Math.random() * (fwHeight * 0.55);
    }

    return {
      type,
      persistent,
      x,
      y,
      size,
      depth,
      opacity: persistent ? 0.68 + Math.random() * 0.22 : 0.74 + Math.random() * 0.24,
      baseVx: (1.1 + Math.random() * 1.4) * depth,
      baseVy: (2.05 + Math.random() * 2.0) * depth,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.042,
      tumble: Math.random() * Math.PI * 2,
      tumbleSpeed: 0.028 + Math.random() * 0.042,
      swayFreq: 0.002 + Math.random() * 0.0024,
      swayAmp: 0.55 + Math.random() * 1.05,
      phase: Math.random() * Math.PI * 2,
      blossomColors: blossomPalettes[Math.floor(Math.random() * blossomPalettes.length)],
      petalColors: petalPalettes[Math.floor(Math.random() * petalPalettes.length)]
    };
  }

  function initFlowerScene() {
    resizeFlowerCanvas();
    flowerParticles = [];
    for (let i = 0; i < TOTAL_OPENING_FLOWERS; i++) {
      const isPersistent = i < PERSISTENT_FLOWER_COUNT;
      flowerParticles.push(createFlowerParticle(true, isPersistent, false));
    }

    windRibbons = [];
    for (let i = 0; i < 6; i++) {
      windRibbons.push({
        x: -180 + Math.random() * fwWidth,
        y: (fwHeight / 6) * i + 40 + Math.random() * 50,
        len: 130 + Math.random() * 90,
        speed: 3.4 + Math.random() * 2.2,
        amp: 14 + Math.random() * 14,
        alpha: 0.14 + Math.random() * 0.14
      });
    }
    drawFlowerFrame(0, 0);
  }

  function drawBlossom(ctx, r, colors) {
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      const grad = ctx.createLinearGradient(0, 0, 0, -r);
      grad.addColorStop(0, colors.inner);
      grad.addColorStop(0.55, colors.outer);
      grad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.52, -r * 0.28, -r * 0.58, -r * 0.88, -r * 0.12, -r);
      ctx.lineTo(0, -r * 0.86);
      ctx.lineTo(r * 0.12, -r);
      ctx.bezierCurveTo(r * 0.58, -r * 0.88, r * 0.52, -r * 0.28, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = colors.center;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 + 0.3;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.26, Math.sin(a) * r * 0.26, r * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSinglePetal(ctx, r, colors) {
    const grad = ctx.createLinearGradient(0, r * 0.6, 0, -r);
    grad.addColorStop(0, colors.base);
    grad.addColorStop(0.7, colors.tip);
    grad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, r * 0.65);
    ctx.bezierCurveTo(-r * 0.78, r * 0.15, -r * 0.72, -r * 0.85, 0, -r);
    ctx.bezierCurveTo(r * 0.72, -r * 0.85, r * 0.78, r * 0.15, 0, r * 0.65);
    ctx.closePath();
    ctx.fill();
  }

  function drawSoftLeaf(ctx, r) {
    const grad = ctx.createLinearGradient(0, r * 0.7, 0, -r * 0.9);
    grad.addColorStop(0, '#589A79');
    grad.addColorStop(0.55, '#79BD9A');
    grad.addColorStop(1, '#CBEAD8');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, r * 0.8);
    ctx.quadraticCurveTo(-r * 0.55, 0, 0, -r * 0.9);
    ctx.quadraticCurveTo(r * 0.55, 0, 0, r * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(244, 250, 246, 0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.65);
    ctx.lineTo(0, -r * 0.65);
    ctx.stroke();
  }

  function drawFlowerFrame(elapsed, dt) {
    if (!fwCtx) return;
    fwCtx.clearRect(0, 0, fwWidth, fwHeight);

    const currentScrollY = getScrollY();
    const scrollDelta = dt > 0 ? currentScrollY - lastScrollY : 0;
    lastScrollY = currentScrollY;

    // Smooth crossfade progress (0 during intro gust -> 1 once curtains have emerged)
    const rawFade = Math.max(0, Math.min(1, (elapsed - FADE_START_MS) / FADE_DURATION_MS));
    const smoothFade = rawFade * rawFade * (3 - 2 * rawFade);
    const burstAlpha = 1 - smoothFade;

    // Ease wind from brisk opening gust down to a soft romantic breeze for the persistent flowers
    const windScale = 1 - 0.52 * smoothFade;
    const dropScale = 1 - 0.34 * smoothFade;
    const windGust = (1.45 + 0.75 * Math.sin(elapsed * 0.003) + 0.35 * Math.cos(elapsed * 0.0068)) * windScale;

    // Subtle wispy wind-current ribbons during the opening wind gust (fade out smoothly during crossfade)
    if (burstAlpha > 0.01) {
      fwCtx.save();
      fwCtx.lineCap = 'round';
      for (const rib of windRibbons) {
        if (dt > 0) {
          rib.x += rib.speed * windGust * 0.75 * dt;
          rib.y += rib.speed * 0.42 * dt;
          if (rib.x - rib.len > fwWidth + 40 || rib.y > fwHeight + 60) {
            rib.x = -rib.len - Math.random() * 80;
            rib.y = -30 + Math.random() * (fwHeight * 0.75);
          }
        }
        const grad = fwCtx.createLinearGradient(rib.x, rib.y, rib.x + rib.len, rib.y + rib.len * 0.38);
        grad.addColorStop(0, 'rgba(121, 189, 154, 0)');
        grad.addColorStop(0.5, `rgba(121, 189, 154, ${(rib.alpha * burstAlpha).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        fwCtx.strokeStyle = grad;
        fwCtx.lineWidth = 1.6;
        fwCtx.beginPath();
        fwCtx.moveTo(rib.x, rib.y);
        fwCtx.bezierCurveTo(
          rib.x + rib.len * 0.35,
          rib.y - rib.amp,
          rib.x + rib.len * 0.7,
          rib.y + rib.len * 0.35 + rib.amp,
          rib.x + rib.len,
          rib.y + rib.len * 0.36
        );
        fwCtx.stroke();
      }
      fwCtx.restore();
    } else if (!burstPruned) {
      // Keep only the persistent first-screen flowers once the opening burst has faded out
      flowerParticles = flowerParticles.filter((item) => item.persistent);
      burstPruned = true;
    }

    // Update & render flowers, petals, and leaves
    for (let i = 0; i < flowerParticles.length; i++) {
      const p = flowerParticles[i];
      const alpha = p.persistent ? p.opacity : p.opacity * burstAlpha;
      if (alpha <= 0.01) continue;

      if (dt > 0) {
        const flutterSway = Math.sin(elapsed * p.swayFreq + p.phase) * p.swayAmp;
        const liftWave = Math.cos(elapsed * p.swayFreq * 1.3 + p.phase) * 0.42;

        p.x += (p.baseVx * windGust + flutterSway) * dt;
        // Move vertically with wind/gravity AND shift naturally with page scroll (with depth parallax)
        p.y += (p.baseVy * dropScale + liftWave) * dt - scrollDelta * (0.88 + 0.24 * p.depth);
        p.angle += p.spinSpeed * (0.65 + 0.35 * windScale) * dt;
        p.tumble += p.tumbleSpeed * (0.65 + 0.35 * windScale) * dt;

        const spanY = fwHeight + 90;
        const spanX = fwWidth + 92;

        if (smoothFade > 0.5) {
          // Wrap seamlessly in 2D space so flowers travel naturally with both wind and scroll
          if (p.x > fwWidth + 46) {
            p.x = -46 + ((p.x - (fwWidth + 46)) % spanX);
          } else if (p.x < -46) {
            p.x = fwWidth + 46 - ((-46 - p.x) % spanX);
          }

          if (p.y > fwHeight + 45) {
            p.y = -45 + ((p.y - (fwHeight + 45)) % spanY);
            p.x = -25 + Math.random() * fwWidth;
          } else if (p.y < -45) {
            p.y = fwHeight + 45 - ((-45 - p.y) % spanY);
            p.x = -25 + Math.random() * fwWidth;
          }
        } else if (p.y > fwHeight + 45 || p.x > fwWidth + 52) {
          if (p.persistent || burstAlpha > 0.15) {
            flowerParticles[i] = createFlowerParticle(false, p.persistent, false);
          }
          continue;
        }
      }

      fwCtx.save();
      fwCtx.globalAlpha = alpha;
      fwCtx.translate(p.x, p.y);
      fwCtx.rotate(p.angle);

      const tiltScale = p.type === 'blossom'
        ? 0.68 + 0.32 * Math.abs(Math.cos(p.tumble))
        : 0.26 + 0.74 * Math.abs(Math.cos(p.tumble));
      fwCtx.scale(1, tiltScale);

      if (p.type === 'blossom') {
        drawBlossom(fwCtx, p.size, p.blossomColors);
      } else if (p.type === 'petal') {
        drawSinglePetal(fwCtx, p.size, p.petalColors);
      } else {
        drawSoftLeaf(fwCtx, p.size);
      }
      fwCtx.restore();
    }
  }

  function startFlowerWindAnimation() {
    if (!fwCtx || flowerAnimFrame) return;
    let lastTime = performance.now();

    function loop(now) {
      const dt = Math.min(32, now - lastTime) / 16.667;
      flowerElapsedOffset += now - lastTime;
      lastTime = now;
      drawFlowerFrame(flowerElapsedOffset, dt);
      flowerAnimFrame = requestAnimationFrame(loop);
    }

    flowerAnimFrame = requestAnimationFrame(loop);
  }

  initFlowerScene();
  window.addEventListener('resize', () => {
    resizeFlowerCanvas();
    if (!flowerAnimFrame) drawFlowerFrame(flowerElapsedOffset, 0);
  });

  function openInvitation() {
    if (envelopeOverlay.classList.contains('opening')) return;

    // Step 1: Break wax seal & swing open envelope flaps into the wind-blown flowers burst
    envelopeOverlay.classList.add('opening');
    startFlowerWindAnimation();

    // Step 2: Hide opened envelope flaps once swung out
    setTimeout(() => {
      envelopeOverlay.classList.add('opened');
    }, 1200);

    // Step 3: Begin smooth crossfade out of the floral veil & dense flower burst...
    setTimeout(() => {
      if (flowerIntroVeil) {
        flowerIntroVeil.classList.add('fade-out');
      }
    }, FADE_START_MS);

    // Step 4: ...while simultaneously fading in the curtain opening animation!
    setTimeout(() => {
      curtainStage.classList.add('curtains-open');
      heroSection.classList.add('curtains-parted');
    }, FADE_START_MS + 250);

    // Step 5: Unlock page scroll as the garden & ongoing falling flowers settle in
    setTimeout(() => {
      body.classList.remove('locked-scroll');
    }, FADE_START_MS + 900);
  }

  waxSealBtn.addEventListener('click', openInvitation);

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

  const weddingTargetDate = new Date('2027-01-10T19:00:00').getTime();

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
      '• Haldi: Friday, Jan 8, 2027 (6:00 PM Onwards)\n' +
      '• Mehndi: Saturday, Jan 9, 2027 (6:00 PM Onwards)\n' +
      '• Wedding (Nikah): Sunday, Jan 10, 2027 (7:00 PM Onwards) — Akka Garden Marriage Hall\n' +
      '• Reception (Walima): Tuesday, Jan 12, 2027 (7:00 PM Onwards) — Madina Garden',
    startUTC: '20270110T190000',
    endUTC: '20270110T233000'
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

  if (saveDateBtnTop) saveDateBtnTop.addEventListener('click', openCalendarSheet);
  if (saveDateBtnCountdown) saveDateBtnCountdown.addEventListener('click', openCalendarSheet);
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
