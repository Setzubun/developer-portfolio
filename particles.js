/* ============================================================
   FALLING PARTICLE BACKGROUND
   Draws slow, faint white particles drifting down a
   <canvas id="particle-background">. Pulled out into its own
   file so any page can include it with one <script> tag.
   ============================================================ */

document.addEventListener("DOMContentLoaded", initParticles);

function initParticles() {
    const canvas = document.getElementById("particle-background");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ✏️ EDIT: tweak count/speed/opacity here to change the vibe
    const PARTICLE_COUNT = 150;
    const COLOR = "255,255,255";
    const OPACITY = 0.25;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: 0.2 + Math.random() * 0.4,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            ctx.fillStyle = `rgba(${COLOR}, ${OPACITY})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            if (!reduceMotion) {
                p.y += p.speed;
                if (p.y > canvas.height) p.y = 0;
            }
        });

        requestAnimationFrame(draw);
    }

    draw();
}