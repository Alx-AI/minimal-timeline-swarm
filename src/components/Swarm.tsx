import React, { useEffect, useRef, useState } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

type CursorParticle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
};

interface SwarmProps {
  particleCount?: number;
}

const Swarm: React.FC<SwarmProps> = ({ particleCount = 45 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorPositionRef = useRef({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const cursorParticlesRef = useRef<CursorParticle[]>([]);
  const requestRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastSparkleTime = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const deformOffsetRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Initialize canvas and particles
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize particles when dimensions change
  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const initialParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    setParticles(initialParticles);
  }, [particleCount, dimensions]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Initialize cursor position on first mouse movement if it's at origin
      if (cursorPositionRef.current.x === 0 && cursorPositionRef.current.y === 0) {
        cursorPositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Drawing function
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply background color based on theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    const backgroundColor = isDarkMode ? '#171717' : '#f5f2ea';
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw particles only
    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = isDarkMode 
        ? `rgba(255, 255, 255, ${particle.opacity})` 
        : `rgba(0, 0, 0, ${particle.opacity})`;
      ctx.fill();
    }
    
    // Draw cursor sparkle particles from ref (no state updates)
    for (const particle of cursorParticlesRef.current) {
      const opacityFade = particle.life / particle.maxLife;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * opacityFade, 0, Math.PI * 2);
      ctx.fillStyle = isDarkMode 
        ? `rgba(255, 255, 255, ${particle.opacity * opacityFade})` 
        : `rgba(0, 0, 0, ${particle.opacity * opacityFade})`;
      ctx.fill();
    }
    
    // Add a larger dot that lags behind cursor with deformation
    ctx.beginPath();
    
    // Calculate deformation values for the cursor
    const now = Date.now() * 0.001;
    deformOffsetRef.current += 0.01;
    const pulseSize = 3.5 + Math.sin(now * 2) * 0.5;
    
    // Add subtle deformation to cursor shape
    const deformX = Math.cos(now * 3) * 0.7;
    const deformY = Math.sin(now * 2.5) * 0.7;
    
    // Draw deformed cursor with gradient
    const gradient = ctx.createRadialGradient(
      cursorPositionRef.current.x, cursorPositionRef.current.y, 0,
      cursorPositionRef.current.x + deformX, cursorPositionRef.current.y + deformY, pulseSize * 2
    );
    
    if (isDarkMode) {
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.arc(cursorPositionRef.current.x, cursorPositionRef.current.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Simplified mouse interaction - just a few connections to closest particles
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Find 3 closest particles
    const distances = particles.map((particle, index) => {
      const dx = mousePosition.x - particle.x;
      const dy = mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { index, distance };
    }).sort((a, b) => a.distance - b.distance).slice(0, 3);
    
    // Draw connections only to these closest particles
    for (const { index, distance } of distances) {
      if (distance < 150) {
        ctx.beginPath();
        ctx.moveTo(particles[index].x, particles[index].y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.stroke();
      }
    }
  };

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0) return;
    
    const canvas = canvasRef.current;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const animateParticles = () => {
      frameCountRef.current += 1;
      
      // Update cursor position with lag effect - direct ref manipulation
      const dx = mousePosition.x - cursorPositionRef.current.x;
      const dy = mousePosition.y - cursorPositionRef.current.y;
      cursorPositionRef.current = {
        x: cursorPositionRef.current.x + dx * 0.15,
        y: cursorPositionRef.current.y + dy * 0.15
      };
      
      // Only update particles state every 3 frames for better performance
      const shouldUpdateParticleState = frameCountRef.current % 3 === 0;
      
      // Check if we should create a new sparkle particle
      const now = Date.now();
      if (now - lastSparkleTime.current > 100) { // Create sparkles every 100ms
        lastSparkleTime.current = now;
        
        if (mousePosition.x !== 0 && mousePosition.y !== 0) {
          // Create a new sparkle particle
          const newParticle = {
            x: cursorPositionRef.current.x + (Math.random() - 0.5) * 10,
            y: cursorPositionRef.current.y + (Math.random() - 0.5) * 10,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            life: 1,
            maxLife: 1
          };
          
          // Update the cursor particles with direct ref manipulation
          cursorParticlesRef.current = [...cursorParticlesRef.current.filter(p => p.life > 0.05), newParticle];
        }
      }
      
      // Update sparkle particles life with direct ref manipulation
      cursorParticlesRef.current = cursorParticlesRef.current.map(particle => ({
        ...particle,
        life: particle.life * 0.9 // Decay factor
      }));
      
      // Only update particle state every few frames to improve performance
      if (shouldUpdateParticleState) {
        setParticles(prevParticles => {
          return prevParticles.map(particle => {
            // Calculate distance to mouse
            const dx = mousePosition.x - particle.x;
            const dy = mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Mouse influence (very light)
            let newSpeedX = particle.speedX;
            let newSpeedY = particle.speedY;
            
            if (distance < 100) {
              // Very light attraction
              newSpeedX += dx / distance * 0.015;
              newSpeedY += dy / distance * 0.015;
            }
            
            // Apply maximum speed limit
            const maxSpeed = 0.4;
            const speedMagnitude = Math.sqrt(newSpeedX * newSpeedX + newSpeedY * newSpeedY);
            if (speedMagnitude > maxSpeed) {
              newSpeedX = (newSpeedX / speedMagnitude) * maxSpeed;
              newSpeedY = (newSpeedY / speedMagnitude) * maxSpeed;
            }

            // Update position
            let newX = particle.x + newSpeedX;
            let newY = particle.y + newSpeedY;
            
            // Wrap around edges
            if (newX < 0) newX = dimensions.width;
            if (newX > dimensions.width) newX = 0;
            if (newY < 0) newY = dimensions.height;
            if (newY > dimensions.height) newY = 0;
            
            return {
              ...particle,
              x: newX,
              y: newY,
              speedX: newSpeedX,
              speedY: newSpeedY,
            };
          });
        });
      }

      draw();
      requestRef.current = requestAnimationFrame(animateParticles);
    };
    
    requestRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [mousePosition, particles, dimensions]);

  return (
    <div className="swarm-container fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full -z-10"
      />
    </div>
  );
};

export default Swarm;
