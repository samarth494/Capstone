import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const CODE_SYMBOLS = [
    '{', '}', '<', '>', '/', '(', ')', '[', ']', ';',
    '//', '=>', '< />', '{ }', '( )', '0', '1',
    'if', 'for', 'let', 'var', 'fn', '++', '===',
    '&&', '||', '!=', '::', '->', '**', '...',
];

const COLORS = [
    '#00f5ff', // cyan
    '#7c3aed', // violet
    '#06b6d4', // teal
    '#a855f7', // purple
    '#22d3ee', // sky
    '#818cf8', // indigo
    '#34d399', // emerald
    '#f472b6', // pink
    '#fbbf24', // amber
    '#38bdf8', // light blue
];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.symbol = CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)];
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = 1;
        this.size = Math.random() * 8 + 10; // font size 10-18px
        this.velocityX = (Math.random() - 0.5) * 2.5;
        this.velocityY = (Math.random() - 0.5) * 2.5 - 1; // slight upward drift
        this.decay = Math.random() * 0.015 + 0.012; // fade speed
        this.rotation = (Math.random() - 0.5) * 0.3;
        this.currentRotation = 0;
        this.scale = 1;
        this.scaleDecay = Math.random() * 0.005 + 0.002;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.alpha -= this.decay;
        this.currentRotation += this.rotation;
        this.scale -= this.scaleDecay;
        if (this.scale < 0.1) this.scale = 0.1;
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.currentRotation);
        ctx.scale(this.scale, this.scale);

        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;

        ctx.font = `${this.size}px 'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);

        ctx.restore();
    }

    isDead() {
        return this.alpha <= 0;
    }
}

// A glowing dot that follows the cursor
class GlowDot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.alpha = 0.8;
        this.radius = Math.random() * 3 + 1;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.decay = Math.random() * 0.03 + 0.02;
        this.velocityX = (Math.random() - 0.5) * 1.5;
        this.velocityY = (Math.random() - 0.5) * 1.5;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.alpha -= this.decay;
        this.radius *= 0.98;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.alpha <= 0;
    }
}

const CursorCodeTrail = () => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animFrameRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const lastSpawnRef = useRef(0);
    const { theme } = useTheme();

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter((p) => {
            p.update();
            if (p.isDead()) return false;
            p.draw(ctx);
            return true;
        });

        animFrameRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        if (theme !== 'dark') {
            // Clean up if we switch away from dark mode
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            particlesRef.current = [];
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            const now = Date.now();

            // Spawn code symbol particles (throttled)
            if (now - lastSpawnRef.current > 80) {
                particlesRef.current.push(new Particle(e.clientX, e.clientY));
                lastSpawnRef.current = now;
            }

            // Spawn small glow dots more frequently
            for (let i = 0; i < 2; i++) {
                particlesRef.current.push(new GlowDot(e.clientX, e.clientY));
            }

            // Cap particles for performance
            if (particlesRef.current.length > 150) {
                particlesRef.current = particlesRef.current.slice(-150);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Start animation loop
        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [theme, animate]);

    // Don't render the canvas at all in light mode
    if (theme !== 'dark') return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
};

export default CursorCodeTrail;
