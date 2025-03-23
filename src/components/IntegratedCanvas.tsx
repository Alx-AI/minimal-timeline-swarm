import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Calendar, Briefcase, MapPin, CircleOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Define types for our integrated component
export interface TimelineItem {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  imageUrl?: string;
}

// Structure to hold information about timeline card positions and dimensions
interface TimelineCardPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  position: 'left' | 'center' | 'right';
  index: number;
}

// Particle types
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

type ConnectionDot = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  opacity: number;
  progress: number;
  speed: number;
  connectionIndex: number;
};

interface IntegratedCanvasProps {
  timelineItems: TimelineItem[];
  particleCount?: number;
}

const IntegratedCanvas: React.FC<IntegratedCanvasProps> = ({ 
  timelineItems, 
  particleCount = 45 
}) => {
  // Refs for the canvas and DOM elements
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const cardRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // State for mouse and particles
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorPositionRef = useRef({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const cursorParticlesRef = useRef<CursorParticle[]>([]);
  const connectionDotsRef = useRef<ConnectionDot[]>([]);
  const timelineCardPositionsRef = useRef<TimelineCardPosition[]>([]);
  
  // Animation refs
  const requestRef = useRef<number>();
  const lastSparkleTime = useRef<number>(0);
  const deformOffsetRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const scrollYRef = useRef<number>(0);
  
  // Dimensions state
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight,
    documentHeight: 0
  });
  
  // Update on scroll
  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (document.body) {
        setDimensions({ 
          width: window.innerWidth, 
          height: window.innerHeight,
          documentHeight: document.body.scrollHeight
        });
      }
    };

    // Initial call and event listener
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    
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
  }, [particleCount, dimensions.width, dimensions.height]);
  
  // Handle mouse movement with throttling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    // Initialize cursor position on first mouse movement if it's at origin
    if (cursorPositionRef.current.x === 0 && cursorPositionRef.current.y === 0) {
      cursorPositionRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);
  
  useEffect(() => {
    const throttledMouseMove = (e: MouseEvent) => {
      // Only update mouse position every 16ms (approx 60fps)
      requestAnimationFrame(() => handleMouseMove(e));
    };
    
    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', throttledMouseMove);
  }, [handleMouseMove]);
  
  // Calculate timeline card positions
  useEffect(() => {
    if (!timelineContainerRef.current) return;
    
    // Timeout to ensure refs are populated
    const timeoutId = setTimeout(() => {
      const cards: TimelineCardPosition[] = [];
      
      // Iterate through the timeline items and get their positions
      timelineItems.forEach((item, index) => {
        const element = cardRefsMap.current.get(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const position = index % 4;
          
          let positionType: 'left' | 'center' | 'right';
          switch(position) {
            case 0: positionType = 'left'; break;
            case 2: positionType = 'right'; break;
            default: positionType = 'center';
          }
          
          cards.push({
            id: item.id,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2 + window.scrollY, // Adjust for scroll
            width: rect.width,
            height: rect.height,
            position: positionType,
            index
          });
        }
      });
      
      // Save card positions
      timelineCardPositionsRef.current = cards;
      
      // Create connection dots between cards
      const newConnectionDots: ConnectionDot[] = [];
      
      // Create connections between each card
      for (let i = 0; i < cards.length - 1; i++) {
        const startCard = cards[i];
        const endCard = cards[i + 1];
        
        // Number of dots for this connection (increased for higher density)
        const dotCount = Math.floor(Math.random() * 20) + 35; // Increased from 15-25 to 35-55 dots
        
        for (let j = 0; j < dotCount; j++) {
          newConnectionDots.push({
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            size: Math.random() * 1.2 + 0.3, // Slightly more size variation
            opacity: Math.random() * 0.4 + 0.1, // Increased max opacity
            progress: (j / dotCount) + Math.random() * 0.15, // More random distribution
            speed: Math.random() * 0.0005 + 0.0002, // Slightly faster movement
            connectionIndex: i
          });
        }
      }
      
      connectionDotsRef.current = newConnectionDots;
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [timelineItems]);
  
  // Main drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply background color based on theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    const backgroundColor = isDarkMode ? '#171717' : '#f5f2ea';
    
    // Clear canvas with background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw background particles
    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = isDarkMode 
        ? `rgba(255, 255, 255, ${particle.opacity})` 
        : `rgba(0, 0, 0, ${particle.opacity})`;
      ctx.fill();
    }
    
    // Draw connections between timeline cards with dots
    const cards = timelineCardPositionsRef.current;
    
    if (cards.length > 1) {
      for (let i = 0; i < cards.length - 1; i++) {
        const startCard = cards[i];
        const endCard = cards[i + 1];
        
        // Calculate scroll-adjusted positions
        const startX = startCard.x;
        const startY = startCard.y - scrollYRef.current;
        const endX = endCard.x;
        const endY = endCard.y - scrollYRef.current;
        
        // Skip if either point is offscreen
        if (startY < -100 || startY > dimensions.height + 100 ||
            endY < -100 || endY > dimensions.height + 100) {
          continue;
        }
        
        // Determine control point based on card positions
        let controlPointX: number;
        
        if (startCard.position === 'left' && endCard.position === 'center') {
          controlPointX = startX + (endX - startX) * 0.8;
        } else if (startCard.position === 'right' && endCard.position === 'center') {
          controlPointX = startX + (endX - startX) * 0.2;
        } else {
          controlPointX = (startX + endX) / 2;
        }
        
        const controlPointY = (startY + endY) / 2;
        
        // Get the dots for this connection
        const connectionDots = connectionDotsRef.current.filter(dot => 
          dot.connectionIndex === i
        );
        
        // Draw each connection dot
        for (const dot of connectionDots) {
          // Update progress
          dot.progress += dot.speed;
          if (dot.progress > 1) {
            dot.progress = 0;
            dot.size = Math.random() * 1.2 + 0.3;
            dot.opacity = Math.random() * 0.4 + 0.1;
          }
          
          // Calculate position on the curve
          const t = dot.progress;
          
          // Quadratic bezier calculation
          let x = Math.pow(1-t, 2) * startX + 2 * (1-t) * t * controlPointX + Math.pow(t, 2) * endX;
          let y = Math.pow(1-t, 2) * startY + 2 * (1-t) * t * controlPointY + Math.pow(t, 2) * endY;
          
          // Apply mouse interaction effect - enhanced
          const dx = mousePosition.x - x;
          const dy = mousePosition.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Enhanced cursor interaction range and effect
          if (distance < 150) { // Increased radius from 120 to 150
            const distanceFactor = 1 - Math.min(1, distance / 150);
            const angle = Math.atan2(dy, dx);
            
            // Variable repulsion/attraction strength based on dot properties
            const interactionStrength = 8 * (dot.size + 0.5); // Larger dots respond more
            
            // More nuanced attraction/repulsion effect
            // Some dots are attracted, others repelled, creates more organic movement
            const attractionFactor = Math.sin(t * Math.PI * 4 + frameCountRef.current * 0.02) * 0.7;
            
            // Apply position influence
            x += Math.cos(angle) * interactionStrength * distanceFactor * attractionFactor;
            y += Math.sin(angle) * interactionStrength * distanceFactor * attractionFactor;
            
            // Increase opacity slightly when interacting with cursor
            dot.opacity = Math.min(0.7, dot.opacity * 1.2);
          }
          
          // Store position for future reference
          dot.x = x;
          dot.y = y;
          
          // Draw dot
          ctx.beginPath();
          ctx.arc(x, y, dot.size, 0, Math.PI * 2);
          ctx.fillStyle = isDarkMode 
            ? `rgba(255, 255, 255, ${dot.opacity})` 
            : `rgba(0, 0, 0, ${dot.opacity})`;
          ctx.fill();
        }
      }
    }
    
    // Draw cursor sparkle particles
    for (const particle of cursorParticlesRef.current) {
      const opacityFade = particle.life / particle.maxLife;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * opacityFade, 0, Math.PI * 2);
      ctx.fillStyle = isDarkMode 
        ? `rgba(255, 255, 255, ${particle.opacity * opacityFade})` 
        : `rgba(0, 0, 0, ${particle.opacity * opacityFade})`;
      ctx.fill();
    }
    
    // Draw cursor with deformation effect
    ctx.beginPath();
    
    const now = Date.now() * 0.001;
    deformOffsetRef.current += 0.01;
    const pulseSize = 3.5 + Math.sin(now * 2) * 0.5;
    
    // Calculate deformation
    const deformX = Math.cos(now * 3) * 0.7;
    const deformY = Math.sin(now * 2.5) * 0.7;
    
    // Create gradient for cursor
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
    
    // Draw connections to closest particles
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Find 3 closest particles
    const distances = particles.map((particle, index) => {
      const dx = mousePosition.x - particle.x;
      const dy = mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { index, distance };
    }).sort((a, b) => a.distance - b.distance).slice(0, 3);
    
    // Draw connections to closest particles
    for (const { index, distance } of distances) {
      if (distance < 150) {
        ctx.beginPath();
        ctx.moveTo(particles[index].x, particles[index].y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.stroke();
      }
    }
  }, [dimensions.width, dimensions.height, mousePosition, particles]);
  
  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0) return;
    
    const canvas = canvasRef.current;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const animateParticles = () => {
      frameCountRef.current += 1;
      
      // Update cursor position with lag effect
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
      if (now - lastSparkleTime.current > 100) {
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
          
          // Update cursor particles
          cursorParticlesRef.current = [
            ...cursorParticlesRef.current.filter(p => p.life > 0.05), 
            newParticle
          ];
        }
      }
      
      // Update sparkle particles life with direct ref manipulation
      cursorParticlesRef.current = cursorParticlesRef.current.map(particle => ({
        ...particle,
        life: particle.life * 0.9 // Decay factor
      }));
      
      // Only update particle state every few frames
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
  }, [dimensions, draw, mousePosition, particles]);
  
  // Utility function to get position class based on index
  const getPositionClass = (index: number): string => {
    // Create a wave pattern: left -> center -> right -> center -> left...
    const position = index % 4;
    
    switch(position) {
      case 0: return "mr-auto ml-0"; // Left
      case 1: return "mx-auto"; // Center
      case 2: return "ml-auto mr-0"; // Right
      case 3: return "mx-auto"; // Center
      default: return "mx-auto";
    }
  };

  // Get offset class for vertical staggering
  const getOffsetClass = (index: number): string => {
    // Add vertical offset to enhance wave-like appearance
    const offset = index % 3;
    
    switch(offset) {
      case 0: return "mt-4";
      case 1: return "mt-16";
      case 2: return "mt-8";
      default: return "";
    }
  };

  // Get year from date string (format: "Mon YYYY")
  const getYearFromDate = (date: string): number => {
    const parts = date.split(' ');
    if (parts.length > 1) {
      return parseInt(parts[parts.length - 1]);
    }
    return parseInt(date);
  };
  
  return (
    <div className="relative">
      {/* Fixed canvas covering the entire viewport */}
      <canvas 
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      />
      
      {/* Timeline container */}
      <div ref={timelineContainerRef} className="relative py-10 z-10">
        {timelineItems.map((item, index) => {
          const currentYear = getYearFromDate(item.startDate);
          const showYearMarker = index === 0 || 
            getYearFromDate(timelineItems[index-1].startDate) !== currentYear;
          
          const positionClass = getPositionClass(index);
          const offsetClass = getOffsetClass(index);
          const isImageLeft = index % 2 === 0;
          
          return (
            <div 
              key={item.id}
              ref={el => el && cardRefsMap.current.set(item.id, el)}
              className={`relative pl-0 pb-20 ${offsetClass} group`}
              data-timeline-index={index}
            >
              {/* Year marker */}
              {showYearMarker && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-background/90 backdrop-blur-sm border border-border/50 px-4 py-1 rounded-full text-sm font-mono text-primary animate-pulse-subtle">
                    {currentYear}
                  </div>
                </div>
              )}
              
              {/* Timeline card */}
              <div className={`timeline-card relative max-w-2xl ${positionClass} group-hover:shadow-lg transition-all`}>
                <div className={`flex ${isImageLeft ? 'flex-row-reverse' : 'flex-row'} gap-5 items-start`}>
                  {/* Image container */}
                  {item.imageUrl ? (
                    <div className="w-20 h-20 shrink-0 overflow-hidden bg-card rounded-md border border-border/50 shadow-sm transform transition-transform duration-300 group-hover:scale-105">
                      <AspectRatio ratio={1} className="h-full w-full">
                        <img 
                          src={item.imageUrl} 
                          alt={`${item.company} logo`} 
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </AspectRatio>
                    </div>
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center shrink-0 bg-secondary/50 rounded-md border border-border/50">
                      <CircleOff size={24} className="text-muted-foreground/40" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <Card className="flex-1 bg-card/80 backdrop-blur-sm border border-border/50 rounded-md overflow-hidden transition-all duration-300 group-hover:border-border">
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                        <Calendar size={12} />
                        <span>{item.startDate} - {item.endDate}</span>
                      </div>
                      
                      <h3 className="text-lg font-sans font-medium tracking-tight">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                        <Briefcase size={12} className="text-primary" />
                        <span className="font-medium">{item.company}</span>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-muted-foreground" />
                          <span className="text-muted-foreground">{item.location}</span>
                        </div>
                      </div>
                      
                      <p className="mt-3 text-sm font-mono text-foreground/80 max-w-2xl">{item.description}</p>
                      
                      {item.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.skills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-secondary/50 text-secondary-foreground text-xs font-mono rounded-sm border border-border/50"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntegratedCanvas; 