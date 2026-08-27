/**
 * IMMERSIVE CREATIVE WEB EXPERIENCE
 * 60FPS High-Performance Visual Engine & Interactive Orbital Button Swapping
 * Smart Image Path Fallback Architecture
 */

(function () {
    'use strict';

    // Total sequence frames available in workspace
    const TOTAL_FRAMES = 145;
    const frames = [];
    let loadedFramesCount = 0;

    // DOM Elements
    const spaceCanvas = document.getElementById('space-canvas');
    const spaceCtx = spaceCanvas.getContext('2d', { alpha: false });
    const astronautCanvas = document.getElementById('astronaut-canvas');
    const astronautCtx = astronautCanvas.getContext('2d', { alpha: true });
    
    // UI Elements
    const scrollProgressFill = document.getElementById('scroll-progress-fill');
    const scrollPhaseText = document.getElementById('scroll-phase-text');
    const scrollPercentText = document.getElementById('scroll-percent');
    
    // Botões Orbitais
    const btnEstudio = document.getElementById('btn-estudio');
    const btnVistoria = document.getElementById('btn-vistoria');
    const btnFacebook = document.getElementById('btn-facebook');
    const orbitalSystem = document.getElementById('orbital-system');

    // State Interpolation (lerp)
    const state = {
        targetScrollProgress: 0,
        currentScrollProgress: 0,
        targetFrame: 0,
        currentFrame: 0,
        
        // Scroll-Driven Orbital Side-Swapping Interpolation State
        btn1X: 0, btn1Y: 0,
        btn2X: 0, btn2Y: 0,
        btn3X: 0, btn3Y: 0,
        btnOpacity: 0,
        
        lerpFactor: 0.08 // Fluid cinematic deceleration
    };

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // 1. DYNAMIC ULTRA-HD STARRY SPACE CANVAS GENERATOR
    const stars = [];
    const STAR_COUNT = 240;
    const themeColors = ['#90feb5', '#47fca2', '#2d5a3f', '#d4af37', '#ffffff'];

    function initSpaceCanvas() {
        resizeCanvas();
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 1.8 + 0.4,
                color: themeColors[Math.floor(Math.random() * themeColors.length)],
                alpha: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 0.45 + 0.08,
                pulsateSpeed: Math.random() * 0.02 + 0.005,
                hasSpike: Math.random() > 0.85
            });
        }
    }

    // HIGH-DPI CANVAS RESOLUTION PIPELINE
    function resizeCanvas() {
        const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 2.5);
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Space Canvas DPI match
        spaceCanvas.width = Math.floor(w * dpr);
        spaceCanvas.height = Math.floor(h * dpr);
        spaceCtx.scale(dpr, dpr);
        spaceCtx.imageSmoothingEnabled = true;
        spaceCtx.imageSmoothingQuality = 'high';

        // Astronaut Canvas DPI match
        astronautCanvas.width = Math.floor(w * dpr);
        astronautCanvas.height = Math.floor(h * dpr);
        astronautCtx.scale(dpr, dpr);
        astronautCtx.imageSmoothingEnabled = true;
        astronautCtx.imageSmoothingQuality = 'high';
    }

    function drawSpaceBackground(scrollProgress) {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Deep space dark background #020813
        spaceCtx.fillStyle = '#020813';
        spaceCtx.fillRect(0, 0, w, h);

        // Multi-layered cosmic nebula background glow
        const gradient1 = spaceCtx.createRadialGradient(
            w * 0.5 + Math.sin(scrollProgress * Math.PI) * 140,
            h * 0.35 + Math.cos(scrollProgress * Math.PI) * 140,
            80,
            w * 0.5,
            h * 0.5,
            Math.max(w, h) * 0.9
        );
        gradient1.addColorStop(0, 'rgba(45, 90, 63, 0.28)');
        gradient1.addColorStop(0.45, 'rgba(2, 8, 19, 0.6)');
        gradient1.addColorStop(1, 'rgba(2, 8, 19, 0.99)');

        spaceCtx.fillStyle = gradient1;
        spaceCtx.fillRect(0, 0, w, h);

        // Parallax stars rendering
        const scrollOffsetY = scrollProgress * h * 0.65;

        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            star.alpha += Math.sin(Date.now() * star.pulsateSpeed) * 0.008;
            const currentAlpha = Math.max(0.15, Math.min(1, star.alpha));

            const renderedY = (star.y - scrollOffsetY * star.speed + h * 10) % h;

            spaceCtx.beginPath();
            spaceCtx.arc(star.x, renderedY, star.radius, 0, Math.PI * 2);
            spaceCtx.fillStyle = star.color;
            spaceCtx.globalAlpha = currentAlpha;
            if (star.radius > 1.2) {
                spaceCtx.shadowBlur = 8;
                spaceCtx.shadowColor = star.color;
            }
            spaceCtx.fill();

            // Star diffraction spikes for large foreground stars
            if (star.hasSpike && star.radius > 1.4) {
                spaceCtx.strokeStyle = star.color;
                spaceCtx.lineWidth = 0.5;
                spaceCtx.beginPath();
                spaceCtx.moveTo(star.x - star.radius * 3, renderedY);
                spaceCtx.lineTo(star.x + star.radius * 3, renderedY);
                spaceCtx.moveTo(star.x, renderedY - star.radius * 3);
                spaceCtx.lineTo(star.x, renderedY + star.radius * 3);
                spaceCtx.stroke();
            }

            spaceCtx.globalAlpha = 1.0;
            spaceCtx.shadowBlur = 0;
        }
    }

    // 2. ASTRONAUT FRAME SEQUENCE RENDERER WITH SMART PATH FALLBACK
    function loadFrames() {
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            const paddedIndex = String(i).padStart(3, '0');
            const filename = `ezgif-frame-${paddedIndex}.jpg`;

            // Smart fallback: try relative path first, fallback to FRAMER/ folder
            img.src = filename;
            img.onerror = function () {
                if (!this.dataset.retried) {
                    this.dataset.retried = 'true';
                    this.src = `FRAMER/${filename}`;
                }
            };
            img.onload = () => {
                loadedFramesCount++;
            };
            frames.push(img);
        }
    }

    function renderAstronautFrame(frameIdx) {
        const w = window.innerWidth;
        const h = window.innerHeight;

        astronautCtx.clearRect(0, 0, w, h);

        const safeIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(frameIdx)));
        const img = frames[safeIndex];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        // Object-fit cover calculation
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = w / h;

        let drawW, drawH, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawW = Math.ceil(w);
            drawH = Math.ceil(w / imgRatio);
            drawX = 0;
            drawY = Math.floor((h - drawH) / 2);
        } else {
            drawW = Math.ceil(h * imgRatio);
            drawH = Math.ceil(h);
            drawX = Math.floor((w - drawW) / 2);
            drawY = 0;
        }

        // High-fidelity bilinear sampling
        astronautCtx.imageSmoothingEnabled = true;
        astronautCtx.imageSmoothingQuality = 'high';

        astronautCtx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    // 3. SCROLL-DRIVEN DYNAMIC ORBITAL TRIPLE-BUTTON PIPELINE
    function updateOrbitalButtons(scrollProgress, time) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const centerX = w * 0.5;
        const centerY = h * 0.5;

        // Responsive orbital dimensions
        const isMobile = w < 820;
        const radiusX = Math.min(w * (isMobile ? 0.36 : 0.38), isMobile ? 180 : 410);
        const radiusY = Math.min(h * (isMobile ? 0.32 : 0.28), isMobile ? 260 : 250);

        // Scroll depth drives orbital side swapping
        const orbitAngle = scrollProgress * Math.PI * 2.5;

        // Distribuição triangular em 360 graus (120° de distância entre cada botão)
        const angle1 = orbitAngle + 3.66;
        const angle2 = angle1 + (Math.PI * 2 / 3);
        const angle3 = angle1 + (Math.PI * 4 / 3);

        // Zero-gravity sine wave floating motion
        const floatY1 = Math.sin(time * 0.0018) * 7;
        const floatX1 = Math.cos(time * 0.0014) * 4;

        const floatY2 = Math.sin(time * 0.0016 + 1.5) * 7;
        const floatX2 = Math.cos(time * 0.0012 + 1.5) * 4;

        const floatY3 = Math.sin(time * 0.0020 + 3.0) * 7;
        const floatX3 = Math.cos(time * 0.0010 + 3.0) * 4;

        // Approximate button centers
        const btn1HalfW = isMobile ? 90 : 115;
        const btn2HalfW = isMobile ? 100 : 130;
        const btn3HalfW = isMobile ? 105 : 135;
        const btnHalfH = 24;

        // Calculate target positions relative to viewport top-left
        const targetX1 = centerX + Math.cos(angle1) * radiusX + floatX1 - btn1HalfW;
        const targetY1 = centerY + Math.sin(angle1) * radiusY + floatY1 - btnHalfH;

        const targetX2 = centerX + Math.cos(angle2) * radiusX + floatX2 - btn2HalfW;
        const targetY2 = centerY + Math.sin(angle2) * radiusY + floatY2 - btnHalfH;

        const targetX3 = centerX + Math.cos(angle3) * radiusX + floatX3 - btn3HalfW;
        const targetY3 = centerY + Math.sin(angle3) * radiusY + floatY3 - btnHalfH;

        // Linear interpolation (lerp) for 60FPS fluid cinematic motion
        state.btn1X = lerp(state.btn1X || targetX1, targetX1, state.lerpFactor);
        state.btn1Y = lerp(state.btn1Y || targetY1, targetY1, state.lerpFactor);

        state.btn2X = lerp(state.btn2X || targetX2, targetX2, state.lerpFactor);
        state.btn2Y = lerp(state.btn2Y || targetY2, targetY2, state.lerpFactor);

        state.btn3X = lerp(state.btn3X || targetX3, targetX3, state.lerpFactor);
        state.btn3Y = lerp(state.btn3Y || targetY3, targetY3, state.lerpFactor);

        // 3D Depth Scale effect as buttons orbit
        const scale1 = 0.94 + (Math.sin(angle1) + 1) * 0.06;
        const scale2 = 0.94 + (Math.sin(angle2) + 1) * 0.06;
        const scale3 = 0.94 + (Math.sin(angle3) + 1) * 0.06;

        // Scroll entrance opacity
        const isActivated = window.scrollY > 25;
        const targetOpacity = isActivated ? 1 : 0;
        state.btnOpacity = lerp(state.btnOpacity, targetOpacity, state.lerpFactor);

        // Render ESTÚDIO MARCOS
        if (btnEstudio) {
            btnEstudio.style.visibility = state.btnOpacity > 0.005 ? 'visible' : 'hidden';
            btnEstudio.style.opacity = (state.btnOpacity * (0.85 + scale1 * 0.15)).toFixed(3);
            btnEstudio.style.transform = `translate3d(${state.btn1X.toFixed(2)}px, ${state.btn1Y.toFixed(2)}px, 0) scale(${scale1.toFixed(3)})`;
        }

        // Render VISTORIA DE IMÓVEIS
        if (btnVistoria) {
            btnVistoria.style.visibility = state.btnOpacity > 0.005 ? 'visible' : 'hidden';
            btnVistoria.style.opacity = (state.btnOpacity * (0.85 + scale2 * 0.15)).toFixed(3);
            btnVistoria.style.transform = `translate3d(${state.btn2X.toFixed(2)}px, ${state.btn2Y.toFixed(2)}px, 0) scale(${scale2.toFixed(3)})`;
        }

        // Render FACEBOOK INOVE VISTORIA
        if (btnFacebook) {
            btnFacebook.style.visibility = state.btnOpacity > 0.005 ? 'visible' : 'hidden';
            btnFacebook.style.opacity = (state.btnOpacity * (0.85 + scale3 * 0.15)).toFixed(3);
            btnFacebook.style.transform = `translate3d(${state.btn3X.toFixed(2)}px, ${state.btn3Y.toFixed(2)}px, 0) scale(${scale3.toFixed(3)})`;
        }
    }

    // 4. HIGH-PERFORMANCE rAF ANIMATION PIPELINE (60FPS TARGET)
    function updateMetrics() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        state.targetScrollProgress = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
        state.targetFrame = state.targetScrollProgress * (TOTAL_FRAMES - 1);
    }

    function updateUIElements(progress) {
        const percentage = Math.round(progress * 100);
        
        if (scrollProgressFill) {
            scrollProgressFill.style.height = `${percentage}%`;
        }
        if (scrollPercentText) {
            scrollPercentText.textContent = `${percentage}%`;
        }
        if (scrollPhaseText) {
            if (percentage < 30) {
                scrollPhaseText.textContent = 'INÍCIO';
            } else if (percentage < 70) {
                scrollPhaseText.textContent = 'EXPLORAÇÃO';
            } else {
                scrollPhaseText.textContent = 'ÓRBITA Final';
            }
        }
    }

    function animate(timestamp) {
        const time = timestamp || performance.now();

        // Stateless rAF metrics interception
        updateMetrics();

        // Linear interpolation (lerp) for organic deceleration
        state.currentScrollProgress = lerp(state.currentScrollProgress, state.targetScrollProgress, state.lerpFactor);
        state.currentFrame = lerp(state.currentFrame, state.targetFrame, state.lerpFactor);

        // Hardware-Accelerated CSS Transformations
        const frameOffsetY = (state.currentScrollProgress - 0.5) * 50;
        const rotDeg = Math.sin(state.currentScrollProgress * Math.PI) * 3;

        astronautCanvas.style.transform = `translate3d(0, ${frameOffsetY.toFixed(2)}px, 0) rotate3d(0, 0, 1, ${rotDeg.toFixed(2)}deg)`;

        // Render Canvas layers
        drawSpaceBackground(state.currentScrollProgress);
        renderAstronautFrame(state.currentFrame);

        // Orbital System Scale/Rotation based on scroll
        if (orbitalSystem) {
            const orbitalScale = 1 + state.currentScrollProgress * 0.12;
            const orbitalRot = state.currentScrollProgress * 15;
            orbitalSystem.style.transform = `translate3d(-50%, -50%, 0) scale(${orbitalScale.toFixed(3)}) rotate(${orbitalRot.toFixed(2)}deg)`;
        }

        // Dynamic 3D Orbital Button Side Swapping
        updateOrbitalButtons(state.currentScrollProgress, time);

        // Dynamic UI HUD Indicator update
        updateUIElements(state.currentScrollProgress);

        requestAnimationFrame(animate);
    }

    // Non-blocking Passive Listeners
    window.addEventListener('resize', () => {
        resizeCanvas();
    }, { passive: true });

    // Startup Execution
    window.addEventListener('DOMContentLoaded', () => {
        initSpaceCanvas();
        loadFrames();
        requestAnimationFrame(animate);
    });

})();
