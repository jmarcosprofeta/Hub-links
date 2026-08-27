// --- MÓDULO: FX CANVAS & SISTEMA DE PARTÍCULAS NO CURSOR ---
const fxCanvas = document.getElementById('fx-canvas');
const fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
const mouseParticles = [];

function resizeFxCanvas() {
    if (!fxCanvas) return;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 2.5);
    fxCanvas.width = Math.floor(window.innerWidth * dpr);
    fxCanvas.height = Math.floor(window.innerHeight * dpr);
    fxCtx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeFxCanvas, { passive: true });
resizeFxCanvas();

// Emissão de partículas ao mover o mouse
window.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.4) return; // Controla a densidade das partículas
    mouseParticles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
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
        p.alpha -= 0.025; // Fade out gradual

        if (p.alpha <= 0) {
            mouseParticles.splice(i, 1);
            continue;
        }

        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        fxCtx.fillStyle = p.color;
        fxCtx.globalAlpha = p.alpha;
        fxCtx.shadowBlur = 8;
        fxCtx.shadowColor = p.color;
        fxCtx.fill();
        fxCtx.globalAlpha = 1.0;
        fxCtx.shadowBlur = 0;
    }
}

// Integre renderFxParticles() dentro da sua função principal animate() do rAF:
// function animate(timestamp) {
//     ...
//     renderFxParticles();
//     requestAnimationFrame(animate);
// }

// --- MÓDULO: TILT 3D NOS BOTÕES ORBITAIS ---
document.querySelectorAll('.orbital-pill-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Aplica inclinação sutil de até 12 graus
        const tiltX = (y / (rect.height / 2)) * -12;
        const tiltY = (x / (rect.width / 2)) * 12;

        btn.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        btn.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('--tilt-x', '0deg');
        btn.style.setProperty('--tilt-y', '0deg');
    });
});
