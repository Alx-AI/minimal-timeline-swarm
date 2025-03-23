
import React, { useEffect, useRef, useState } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  connections: number[];
};

interface SwarmProps {
  particleCount?: number;
}

const Swarm: React.FC<SwarmProps> = ({ particleCount = 100 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const connectionDistance = 150; // Maximum distance for particle connections

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
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        connections: []
      });
    }

    setParticles(initialParticles);
  }, [particleCount, dimensions]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
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

    // Update particles and reset connections
    const updatedParticles = particles.map(particle => ({
      ...particle,
      connections: []
    }));

    // Draw connections
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;

    // Find connections
    for (let i = 0; i < updatedParticles.length; i++) {
      for (let j = i + 1; j < updatedParticles.length; j++) {
        const dx = updatedParticles[i].x - updatedParticles[j].x;
        const dy = updatedParticles[i].y - updatedParticles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(updatedParticles[i].x, updatedParticles[i].y);
          ctx.lineTo(updatedParticles[j].x, updatedParticles[j].y);
          
          // Make opacity proportional to distance
          const opacity = 1 - (distance / connectionDistance);
          ctx.strokeStyle = isDarkMode 
            ? `rgba(255, 255, 255, ${opacity * 0.15})` 
            : `rgba(0, 0, 0, ${opacity * 0.15})`;
            
          ctx.stroke();
          
          // Add to connections
          updatedParticles[i].connections.push(j);
          updatedParticles[j].connections.push(i);
        }
      }
    }

    // Draw particles
    for (const particle of updatedParticles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = isDarkMode 
        ? `rgba(255, 255, 255, ${particle.opacity})` 
        : `rgba(0, 0, 0, ${particle.opacity})`;
      ctx.fill();
    }
    
    // Mouse interaction - draw connections to nearby particles
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 0.5;
    
    for (const particle of updatedParticles) {
      const dx = mousePosition.x - particle.x;
      const dy = mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < connectionDistance * 2) {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        
        // Make opacity proportional to distance
        const opacity = 1 - (distance / (connectionDistance * 2));
        ctx.strokeStyle = isDarkMode 
          ? `rgba(255, 255, 255, ${opacity * 0.3})` 
          : `rgba(0, 0, 0, ${opacity * 0.3})`;
          
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
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Calculate distance to mouse
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Mouse influence (stronger attraction)
          let newSpeedX = particle.speedX;
          let newSpeedY = particle.speedY;
          
          if (distance < 200) {
            // Stronger attraction to mouse
            newSpeedX += dx / distance * 0.05;
            newSpeedY += dy / distance * 0.05;
          }
          
          // Apply maximum speed limit
          const maxSpeed = 1.2;
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
    <div className="swarm-container" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full -z-10"
      />
    </div>
  );
};

export default Swarm;
