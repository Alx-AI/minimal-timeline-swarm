
import React, { useEffect, useRef, useState } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

interface SwarmProps {
  particleCount?: number;
}

const Swarm: React.FC<SwarmProps> = ({ particleCount = 40 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize particles
  useEffect(() => {
    const initialParticles: Particle[] = [];
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
      initialParticles.push({
        x: Math.random() * windowWidth,
        y: Math.random() * windowHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    setParticles(initialParticles);

    // Handle resize
    const handleResize = () => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x % window.innerWidth,
          y: p.y % window.innerHeight,
        }))
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [particleCount]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Calculate distance to mouse
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Mouse influence (subtle attraction)
          let newSpeedX = particle.speedX;
          let newSpeedY = particle.speedY;
          
          if (distance < 150) {
            // Gentle attraction to mouse
            newSpeedX += dx / distance * 0.02;
            newSpeedY += dy / distance * 0.02;
          }
          
          // Apply maximum speed limit
          const maxSpeed = 1;
          const speedMagnitude = Math.sqrt(newSpeedX * newSpeedX + newSpeedY * newSpeedY);
          if (speedMagnitude > maxSpeed) {
            newSpeedX = (newSpeedX / speedMagnitude) * maxSpeed;
            newSpeedY = (newSpeedY / speedMagnitude) * maxSpeed;
          }

          // Update position
          let newX = particle.x + newSpeedX;
          let newY = particle.y + newSpeedY;
          
          // Wrap around edges
          if (newX < 0) newX = window.innerWidth;
          if (newX > window.innerWidth) newX = 0;
          if (newY < 0) newY = window.innerHeight;
          if (newY > window.innerHeight) newY = 0;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            speedX: newSpeedX,
            speedY: newSpeedY,
          };
        });
      });
      
      requestRef.current = requestAnimationFrame(animateParticles);
    };
    
    requestRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [mousePosition]);

  return (
    <div className="swarm-container" ref={containerRef}>
      {particles.map((particle, index) => (
        <div
          key={index}
          className="swarm-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default Swarm;
