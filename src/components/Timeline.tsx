import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Calendar, Briefcase, MapPin, CircleOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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

interface TimelineProps {
  items: TimelineItem[];
}

type ConnectionDot = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  progress: number;
  speed: number;
};

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

const TimelineItem: React.FC<{ 
  item: TimelineItem; 
  index: number; 
  showYearMarker: boolean;
  year?: number;
  connectionRef?: React.RefObject<HTMLDivElement>;
}> = ({ item, index, showYearMarker, year, connectionRef }) => {
  const positionClass = getPositionClass(index);
  const offsetClass = getOffsetClass(index);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Determine if image should be on left or right side
  const isImageLeft = index % 2 === 0;
  
  // Calculate curvature direction based on position
  const position = index % 4;
  const curveDirection = position === 0 ? "right" : position === 2 ? "left" : "center";
  
  return (
    <div 
      ref={timelineRef}
      className={`relative pl-0 pb-20 ${offsetClass} group`}
      data-timeline-index={index}
    >
      {/* Year marker */}
      {showYearMarker && year && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 px-4 py-1 rounded-full text-sm font-mono text-primary animate-pulse-subtle">
            {year}
          </div>
        </div>
      )}
      
      {/* Container for timeline cards with proper positioning */}
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
};

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  // Find unique years in the timeline to create year markers
  const years = new Set<number>();
  items.forEach(item => {
    const startYear = getYearFromDate(item.startDate);
    years.add(startYear);
  });
  
  // Sort years
  const sortedYears = Array.from(years).sort((a, b) => b - a);
  
  // Ref for connection paths container
  const connectionContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const animationFramesRef = useRef<number[]>([]);
  const connectionsRef = useRef<HTMLCanvasElement[]>([]);
  
  // Keep dot calculations in a ref to avoid recalculations
  const dotsRef = useRef<{
    connectionIndex: number;
    dots: ConnectionDot[];
  }[]>([]);
  
  // Throttled mouse move handler for better performance
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);
  
  // Track mouse position with throttling
  useEffect(() => {
    const throttledMouseMove = (e: MouseEvent) => {
      // Only update mouse position every 16ms (approx 60fps)
      requestAnimationFrame(() => handleMouseMove(e));
    };
    
    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', throttledMouseMove);
  }, [handleMouseMove]);
  
  // Create path connections between timeline items with animated dots
  useEffect(() => {
    if (!timelineRef.current) return;
    
    // Cleanup previous animation frames
    animationFramesRef.current.forEach(id => cancelAnimationFrame(id));
    animationFramesRef.current = [];
    
    // Clear previous canvas elements
    connectionsRef.current.forEach(canvas => canvas.remove());
    connectionsRef.current = [];
    
    // Function to calculate connections
    const calculateConnections = () => {
      if (!timelineRef.current || !connectionContainerRef.current) return;
      
      // Get all timeline items
      const timelineItems = Array.from(timelineRef.current.querySelectorAll('[data-timeline-index]'));
      
      // Create path connections between items
      const connections: Array<{
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        curveDirection: string;
      }> = [];
      
      timelineItems.forEach((item, index) => {
        if (index < timelineItems.length - 1) {
          const rect1 = item.getBoundingClientRect();
          const rect2 = timelineItems[index + 1].getBoundingClientRect();
          
          // Calculate start and end points centered on each item
          const startX = rect1.left + rect1.width / 2;
          const startY = rect1.top + rect1.height / 2;
          const endX = rect2.left + rect2.width / 2;
          const endY = rect2.top + rect2.height / 2;
          
          // Calculate curve direction based on item position
          const itemIndex = parseInt(item.getAttribute('data-timeline-index') || '0');
          const position = itemIndex % 4;
          const curveDirection = position === 0 ? "right" : position === 2 ? "left" : "center";
          
          connections.push({
            startX: startX - window.scrollX,
            startY: startY - window.scrollY,
            endX: endX - window.scrollX,
            endY: endY - window.scrollY,
            curveDirection
          });
        }
      });
      
      // Clear container
      if (connectionContainerRef.current.firstChild) {
        connectionContainerRef.current.innerHTML = '';
      }
      
      // Reset dots ref
      dotsRef.current = [];
      
      // Create a component for each connection
      connections.forEach((connection, index) => {
        const { startX, startY, endX, endY, curveDirection } = connection;
        
        // Create canvas for this connection
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.className = 'absolute top-0 left-0 w-full h-full pointer-events-none';
        connectionContainerRef.current?.appendChild(canvas);
        connectionsRef.current.push(canvas);
        
        // Draw dots on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Create dots
        const dotCount = Math.floor(Math.random() * 10) + 15; // 15-25 dots per connection
        const dots: ConnectionDot[] = [];
        
        for (let i = 0; i < dotCount; i++) {
          dots.push({
            x: 0,
            y: 0,
            size: Math.random() * 0.8 + 0.4,
            opacity: Math.random() * 0.3 + 0.1,
            progress: (i / dotCount) + Math.random() * 0.1,
            speed: Math.random() * 0.0004 + 0.0002
          });
        }
        
        // Store dots for this connection
        dotsRef.current.push({
          connectionIndex: index,
          dots
        });
        
        // Animation function with optimized rendering
        const animate = () => {
          // Clear canvas with optimized method
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Get theme colors
          const isDarkMode = document.documentElement.classList.contains('dark');
          
          // Update and draw dots
          dots.forEach(dot => {
            // Update progress
            dot.progress += dot.speed;
            if (dot.progress > 1) {
              dot.progress = 0;
              dot.size = Math.random() * 0.8 + 0.4;
              dot.opacity = Math.random() * 0.3 + 0.1;
            }
            
            // Calculate position on the curved path
            let t = dot.progress;
            let controlPointX: number;
            
            // Set control point based on curve direction
            if (curveDirection === "right") {
              controlPointX = startX + (endX - startX) * 0.8;
            } else if (curveDirection === "left") {
              controlPointX = startX + (endX - startX) * 0.2;
            } else {
              controlPointX = (startX + endX) / 2;
            }
            
            const controlPointY = (startY + endY) / 2;
            
            // Quadratic bezier curve calculation
            let x = Math.pow(1-t, 2) * startX + 2 * (1-t) * t * controlPointX + Math.pow(t, 2) * endX;
            let y = Math.pow(1-t, 2) * startY + 2 * (1-t) * t * controlPointY + Math.pow(t, 2) * endY;
            
            // Apply subtle mouse attraction/repulsion to each dot
            const dx = mousePosition.x - x;
            const dy = mousePosition.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only apply effect within certain radius
            if (distance < 120) {
              // Subtle attraction/repulsion - creates a wave effect around the cursor
              const distanceFactor = 1 - Math.min(1, distance / 120);
              const angle = Math.atan2(dy, dx);
              const repulsionStrength = 5;
              
              // Apply a gentle influence based on dot's position in the path
              // Some dots attracted, others repelled - creates a flowing effect
              const attractionFactor = Math.sin(t * Math.PI * 2 + Date.now() * 0.001) * 0.5;
              
              // Apply the influence to the dot
              x += Math.cos(angle) * repulsionStrength * distanceFactor * attractionFactor;
              y += Math.sin(angle) * repulsionStrength * distanceFactor * attractionFactor;
            }
            
            dot.x = x;
            dot.y = y;
            
            // Draw dot with optimized rendering
            ctx.beginPath();
            ctx.arc(x, y, dot.size, 0, Math.PI * 2);
            ctx.fillStyle = isDarkMode 
              ? `rgba(255, 255, 255, ${dot.opacity})` 
              : `rgba(0, 0, 0, ${dot.opacity})`;
            ctx.fill();
          });
          
          // Store animation frame ID for cleanup
          const frameId = requestAnimationFrame(animate);
          animationFramesRef.current.push(frameId);
        };
        
        // Start animation
        const frameId = requestAnimationFrame(animate);
        animationFramesRef.current.push(frameId);
      });
    };
    
    // Initial calculation
    calculateConnections();
    
    // Update connections on resize and scroll with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Cleanup previous animations
        animationFramesRef.current.forEach(id => cancelAnimationFrame(id));
        animationFramesRef.current = [];
        
        // Recalculate connections
        calculateConnections();
      }, 200); // Debounce for better performance
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleResize, { passive: true });
    
    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      clearTimeout(resizeTimeout);
      
      // Cancel all animation frames
      animationFramesRef.current.forEach(id => cancelAnimationFrame(id));
    };
  }, [items]); // Only recalculate when items change, not on every mouse move
  
  return (
    <div className="relative py-10">
      {/* Container for animated dot paths */}
      <div 
        ref={connectionContainerRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      />
      
      {/* Timeline items container */}
      <div ref={timelineRef} className="relative z-10">
        {items.map((item, index) => {
          const currentYear = getYearFromDate(item.startDate);
          const showYearMarker = index === 0 || 
            getYearFromDate(items[index-1].startDate) !== currentYear;
          
          return (
            <TimelineItem 
              key={item.id}
              item={item} 
              index={index}
              showYearMarker={showYearMarker}
              year={showYearMarker ? currentYear : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
