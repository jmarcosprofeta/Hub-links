/* ==========================================
   SCRIPT.JS - VERSÃO COMPLETA E INTEGRADA
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. MÓDULO FX CANVAS (PARTÍCULAS DO MOUSE)
    const fxCanvas = document.getElementById('fx-canvas');
    const fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
    const mouseParticles = [];

    function resizeFxCanvas() {
        if (!fxCanvas) return;
        const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 2.5);
        fxCanvas.width = Math.floor(window.innerWidth * dpr);
        fxCanvas.height = Math.floor(window.innerHeight * dpr);
        if (fxCtx) fxCtx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeFxCanvas, { passive: true });
    resizeFxCanvas();

    window.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.45) return;
        mouseParticles.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2 - 0.4,
            radius: Math.random() * 2 + 1,
            alpha: 1,
            color: Math.random() > 0.5 ? '#47fca2' : '#90feb5'
        });
    }, { passive: true });

    function renderFxParticles() {
        if (!fxCtx) return;
        fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = mouseParticles.length - 1; i >= 0; i--) {
            const p = mouseParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.025;

            if (p.alpha <= 0) {
                mouseParticles.splice(i, 1);
                continue;
            }

            fxCtx.beginPath();
            fxCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            fxCtx.fillStyle = p.color;
            fxCtx.globalAlpha = p.alpha;
            fxCtx.shadowBlur = 6;
            fxCtx.shadowColor = p.color;
            fxCtx.fill();
            fxCtx.globalAlpha = 1.0;
            fxCtx.shadowBlur = 0;
        }
    }

    // 2. MÓDULO DE TILT 3D COM PERFORMANCE OPTIMIZED
    const pillBtns = document.querySelectorAll('.orbital-pill-btn');
    pillBtns.forEach(btn => {
        let ticking = false;

        btn.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    const tiltX = (y / (rect.height / 2)) * -10;
                    const tiltY = (x / (rect.width / 2)) * 10;

                    btn.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
                    btn.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
                    ticking = false;
                });
                ticking = true;
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.setProperty('--tilt-x', '0deg');
            btn.style.setProperty('--tilt-y', '0deg');
        });
    });

    // 3. MOTOR PRINCIPAL DE SCROLL E ÓRBITA (60 FPS)
    const scrollProgressFill = document.getElementById('scroll-progress-fill');
    const scrollPercentText = document.getElementById('scroll-percent');
    const scrollPhaseText = document.getElementById('scroll-phase-text');

    let currentScrollProgress = 0;
    let targetScrollProgress = 0;

    // Fases de exibição dos botões baseadas na porcentagem de rolagem
    const phases = [
        { name: 'INÍCIO', range: [0, 0.15] },
        { name: 'ÓRBITA 01', range: [0.15, 0.45] },
        { name: 'ÓRBITA 02', range: [0.45, 0.75] },
        { name: 'SISTEMA', range: [0.75, 1.0] }
    ];

    function updateScrollCalculations() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetScrollProgress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
    }

    window.addEventListener('scroll', updateScrollCalculations, { passive: true });

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function animate() {
        // Interpolação suave de scroll
        currentScrollProgress = lerp(currentScrollProgress, targetScrollProgress, 0.08);

        // Atualiza a barra vertical de progresso
        if (scrollProgressFill) {
            scrollProgressFill.style.height = `${(currentScrollProgress * 100).toFixed(1)}%`;
        }

        // Atualiza texto da porcentagem
        if (scrollPercentText) {
            scrollPercentText.textContent = `${Math.round(currentScrollProgress * 100)}%`;
        }

        // Atualiza texto da fase
        if (scrollPhaseText) {
            const activePhase = phases.find(p => currentScrollProgress >= p.range[0] && currentScrollProgress <= p.range[1]);
            if (activePhase) scrollPhaseText.textContent = activePhase.name;
        }

        // Lógica de rotação e opacidade dos botões orbitais
        const baseRadius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        pillBtns.forEach((btn, idx) => {
            // Define os pontos de aparecimento de cada botão no scroll
            const btnStart = 0.1 + (idx * 0.25);
            const btnEnd = btnStart + 0.3;

            if (currentScrollProgress >= btnStart && currentScrollProgress <= btnEnd) {
                const phaseProgress = (currentScrollProgress - btnStart) / (btnEnd - btnStart);
                const angle = phaseProgress * Math.PI * 2 + (idx * (Math.PI / 3));

                const x = centerX + Math.cos(angle) * baseRadius - (btn.offsetWidth / 2);
                const y = centerY + Math.sin(angle) * baseRadius - (btn.offsetHeight / 2);

                btn.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
            } else {
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
            }
        });

        // Renderiza partículas do canvas
        renderFxParticles();

        requestAnimationFrame(animate);
    }

    // Inicializa os cálculos e o loop de renderização
    updateScrollCalculations();
    requestAnimationFrame(animate);
});
