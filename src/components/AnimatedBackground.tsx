import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;
      hue: number;
      pulse: number;
      pulseSpeed: number;
    }

    const createParticles = () => {
      const count = Math.min(Math.floor(window.innerWidth / 130), 10);
      particles = Array.from({ length: Math.max(count, 6) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 80 + 40,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        opacity: Math.random() * 0.03 + 0.02,
        hue: 255 + Math.random() * 10,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.003 + 0.001,
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < -p.radius) p.x = canvas.width + p.radius;
        if (p.x > canvas.width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = canvas.height + p.radius;
        if (p.y > canvas.height + p.radius) p.y = -p.radius;

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.03;
        const currentRadius = p.radius + Math.sin(p.pulse) * 8;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius);
        gradient.addColorStop(0, `hsla(${p.hue}, 70%, 75%, ${currentOpacity})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 65%, 70%, ${currentOpacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 60%, 65%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};

export default AnimatedBackground;
