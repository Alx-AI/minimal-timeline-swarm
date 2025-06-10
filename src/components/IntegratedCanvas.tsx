import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ClickableImage from './ClickableImage';
import { Calendar, Briefcase, MapPin, CircleOff, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import useCursorStore from '@/utils/cursorStore';
import { Tag, tagColors } from './Header';

// Define types for our integrated component
export interface TimelineItem {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  location: string;
  description: string | React.ReactElement;
  tags: Tag[];
  imageUrl?: string;
  imageSlot?: {
    url: string;
    type: 'image' | 'video' | 'youtube';
    caption?: string;
    position?: 'left' | 'right' | 'auto'; // Control preferred position of media
    aspectRatio?: number; // Custom aspect ratio, defaults to 16/9
    youtubeEmbed?: string; // YouTube iframe embed code
    href?: string; // URL for clickable images
  };
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
  imageAreaY?: number; // Bottom of the image area (if any)
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
  activeTag?: Tag | null;
  rainbowActive?: boolean;
}

// Utility function to get year from date string (format: "Mon YYYY")
const getYearFromDate = (date: string): number => {
  const parts = date.split(' ');
  if (parts.length > 1) {
    return parseInt(parts[parts.length - 1]);
  }
  return parseInt(date);
};

const IntegratedCanvas: React.FC<IntegratedCanvasProps> = ({ 
  timelineItems, 
  particleCount = 45,
  activeTag,
  rainbowActive = false
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
  
  // Get the global cursor position from our store
  const { x: globalCursorX, y: globalCursorY, updatePosition } = useCursorStore();
  
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
  
  // State for timeline order and year scrollbar
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const yearsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollbarVisibleRef = useRef<boolean>(false);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  
  // State to track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  // Extract unique years from timeline items
  const timelineYears = useMemo(() => {
    const years = new Set<number>();
    timelineItems.forEach(item => {
      const year = getYearFromDate(item.startDate);
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort in descending order
  }, [timelineItems]);
  
  // Reverse the timeline items to display most recent first
  const reversedTimelineItems = useMemo(() => {
    return [...timelineItems].reverse();
  }, [timelineItems]);
  
  // Get years that contain the active tag
  const activeYears = useMemo(() => {
    if (!activeTag) return new Set<number>();
    const years = new Set<number>();
    timelineItems.forEach(item => {
      if (item.tags.includes(activeTag)) {
        years.add(getYearFromDate(item.startDate));
      }
    });
    return years;
  }, [timelineItems, activeTag]);
  
  // Update on scroll
  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Update dimensions and check for mobile layout on resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileView = width < 768; // Standard mobile breakpoint
      
      setDimensions({ 
        width, 
        height,
        documentHeight: document.documentElement.scrollHeight
      });
      setIsMobile(isMobileView);
      
      // When resizing, we need to recalculate timeline card positions
      // Use a timeout to avoid excessive calculations during resize
      if (timelineContainerRef.current) {
        setTimeout(() => {
          const cards: TimelineCardPosition[] = [];
          
          reversedTimelineItems.forEach((item, index) => {
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
              
              const timelineCardElement = element.querySelector('.timeline-card');
              let cardRect = rect;
              
              if (timelineCardElement) {
                cardRect = timelineCardElement.getBoundingClientRect();
              }
              
              let imageAreaY = undefined;
              const mediaSlotElement = timelineCardElement?.querySelector('.media-slot, .media-slot-placeholder');
              
              if (mediaSlotElement) {
                const mediaRect = mediaSlotElement.getBoundingClientRect();
                // Check if media is beside content (horizontal layout) or below (vertical)
                const isHorizontalLayout = window.innerWidth >= 768 && 
                  ((mediaRect.left > cardRect.left + cardRect.width / 2) || 
                   (mediaRect.right < cardRect.left + cardRect.width / 2));
                
                if (isHorizontalLayout) {
                  // For horizontal layout, use the bottom of the entire card
                  imageAreaY = Math.max(cardRect.bottom, mediaRect.bottom) + window.scrollY;
                } else {
                  // For vertical layout, use the bottom of the media area
                  imageAreaY = mediaRect.bottom + window.scrollY;
                }
              }
              
              cards.push({
                id: item.id,
                x: cardRect.left + cardRect.width / 2,
                y: cardRect.top + cardRect.height / 2 + window.scrollY,
                width: cardRect.width,
                height: cardRect.height,
                position: positionType,
                index,
                imageAreaY
              });
            }
          });
          
          timelineCardPositionsRef.current = cards;
        }, 100);
      }
    };
    
    // Initial call and event listener
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Also listen for media query changes specifically for the breakpoint we care about
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleMediaQueryChange = () => {
      // When media query changes, trigger a resize to recalculate layouts
      updateDimensions();
    };
    
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [reversedTimelineItems]);
  
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
    // Update local mouse position
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    // Update global cursor position
    updatePosition(e.clientX, e.clientY);
    
    // Initialize cursor position on first mouse movement if it's at origin
    if (cursorPositionRef.current.x === 0 && cursorPositionRef.current.y === 0) {
      cursorPositionRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [updatePosition]);
  
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
      
      // Iterate through the reversed timeline items and get their positions
      reversedTimelineItems.forEach((item, index) => {
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
          
          // Find the timeline card element to get proper horizontal position
          const timelineCardElement = element.querySelector('.timeline-card');
          let cardRect = rect;
          
          if (timelineCardElement) {
            cardRect = timelineCardElement.getBoundingClientRect();
          }
          
          // Find the image/media slot area if it exists
          let imageAreaY = undefined;
          const mediaSlotElement = timelineCardElement?.querySelector('.media-slot, .media-slot-placeholder');
          
          if (mediaSlotElement) {
            const mediaRect = mediaSlotElement.getBoundingClientRect();
            // Check if media is beside content (horizontal layout) or below (vertical)
            const isHorizontalLayout = window.innerWidth >= 768 && 
              ((mediaRect.left > cardRect.left + cardRect.width / 2) || 
               (mediaRect.right < cardRect.left + cardRect.width / 2));
            
            if (isHorizontalLayout) {
              // For horizontal layout, use the bottom of the entire card
              imageAreaY = Math.max(cardRect.bottom, mediaRect.bottom) + window.scrollY;
            } else {
              // For vertical layout, use the bottom of the media area
              imageAreaY = mediaRect.bottom + window.scrollY;
            }
          }
          
          cards.push({
            id: item.id,
            x: cardRect.left + cardRect.width / 2,
            y: cardRect.top + cardRect.height / 2 + window.scrollY,
            width: cardRect.width,
            height: cardRect.height,
            position: positionType,
            index,
            imageAreaY
          });
        }
      });
      
      // Sort cards by actual DOM position (top to bottom) for proper connections
      cards.sort((a, b) => a.y - b.y);
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
  }, [reversedTimelineItems]);
  
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

    // Define rainbow colors
    const rainbowColors = [
      { r: 138, g: 43, b: 226 },   // Purple (AI)
      { r: 59, g: 130, b: 246 },   // Blue (Education)
      { r: 34, g: 197, b: 94 },    // Green (Robotics)
      { r: 250, g: 204, b: 21 },   // Yellow (Games)
      { r: 239, g: 68, b: 68 },    // Red (Media)
      { r: 6, g: 182, b: 212 },    // Cyan (Data)
      { r: 236, g: 72, b: 153 }    // Pink (Life Sciences)
    ];
    
    // Draw background particles
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      
      if (rainbowActive) {
        // Use a random rainbow color for each particle
        const colorIndex = Math.floor(Math.random() * rainbowColors.length);
        const color = rainbowColors[colorIndex];
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.opacity})`;
      } else {
        ctx.fillStyle = isDarkMode 
          ? `rgba(255, 255, 255, ${particle.opacity})` 
          : `rgba(0, 0, 0, ${particle.opacity})`;
      }
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
        // Use the bottom of the image area if available, otherwise use card center
        const startY = (startCard.imageAreaY ? startCard.imageAreaY : startCard.y) - scrollYRef.current;
        const endX = endCard.x;
        const endY = endCard.y - scrollYRef.current;
        
        // Skip if either point is offscreen with a larger margin
        if (startY < -200 || startY > dimensions.height + 200 ||
            endY < -200 || endY > dimensions.height + 200) {
          continue;
        }
        
        // Determine control point based on card positions
        let controlPointX: number;
        
        // Create more pronounced curves based on the relative positions of the cards
        if (startCard.position === 'left' && endCard.position === 'center') {
          controlPointX = startX + (endX - startX) * 0.7;
        } else if (startCard.position === 'center' && endCard.position === 'right') {
          controlPointX = startX + (endX - startX) * 0.3;
        } else if (startCard.position === 'right' && endCard.position === 'center') {
          controlPointX = startX + (endX - startX) * 0.3;
        } else if (startCard.position === 'center' && endCard.position === 'left') {
          controlPointX = startX + (endX - startX) * 0.7;
        } else if (startCard.position === 'left' && endCard.position === 'right') {
          controlPointX = (startX + endX) / 2;
        } else if (startCard.position === 'right' && endCard.position === 'left') {
          controlPointX = (startX + endX) / 2;
        } else {
          controlPointX = (startX + endX) / 2;
        }
        
        // Create a more pronounced curve for the connection
        const midY = (startY + endY) / 2;
        const controlPointY = startCard.imageAreaY 
          ? startY + (endY - startY) * 0.3 // Control point closer to start when connecting from image area
          : midY - Math.abs(endX - startX) * 0.2; // Add a slight arc to the curve
        
        // Draw debug lines to show control points (debug only)
        // ctx.beginPath();
        // ctx.moveTo(startX, startY);
        // ctx.lineTo(controlPointX, controlPointY);
        // ctx.lineTo(endX, endY);
        // ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        // ctx.stroke();
        
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
          
          if (rainbowActive) {
            // Use a random rainbow color for each dot
            const colorIndex = Math.floor(Math.random() * rainbowColors.length);
            const color = rainbowColors[colorIndex];
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${dot.opacity})`;
          } else {
            ctx.fillStyle = isDarkMode 
              ? `rgba(255, 255, 255, ${dot.opacity})` 
              : `rgba(0, 0, 0, ${dot.opacity})`;
          }
          ctx.fill();
        }
      }
    }
    
    // Draw cursor sparkle particles
    for (let i = 0; i < cursorParticlesRef.current.length; i++) {
      const particle = cursorParticlesRef.current[i];
      const opacityFade = particle.life / particle.maxLife;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * opacityFade, 0, Math.PI * 2);
      
      if (rainbowActive) {
        // Use a random rainbow color for each sparkle
        const colorIndex = Math.floor(Math.random() * rainbowColors.length);
        const color = rainbowColors[colorIndex];
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.opacity * opacityFade})`;
      } else {
        ctx.fillStyle = isDarkMode 
          ? `rgba(255, 255, 255, ${particle.opacity * opacityFade})` 
          : `rgba(0, 0, 0, ${particle.opacity * opacityFade})`;
      }
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
  }, [dimensions.width, dimensions.height, mousePosition, particles, rainbowActive]);
  
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
  
  // Add scroll to year functionality
  const scrollToYear = useCallback((year: number, e?: React.MouseEvent) => {
    // Always prevent default behavior to ensure no page reload
    if (e) {
      e.preventDefault();
      
      // If the clicked year is already active, do nothing
      if (year === activeYear) {
        return;
      }
    }

    const yearElements = document.querySelectorAll('[data-year]');
    for (let i = 0; i < yearElements.length; i++) {
      const element = yearElements[i];
      if (element.getAttribute('data-year') === year.toString()) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveYear(year);
        
        // Update URL but don't reload
        if (typeof history !== 'undefined' && history.pushState) {
          history.pushState(null, '', `#year-${year}`);
        }
        break;
      }
    }
  }, [activeYear]);
  
  // Handle scrollbar visibility
  useEffect(() => {
    const handleScroll = () => {
      // Update active year based on scroll position
      const yearElements = document.querySelectorAll('[data-year]');
      let closestYear = null;
      let closestDistance = Infinity;
      
      const viewportMiddle = window.scrollY + window.innerHeight / 2;
      
      yearElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementMiddle = rect.top + window.scrollY + rect.height / 2;
        const distance = Math.abs(elementMiddle - viewportMiddle);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestYear = parseInt(element.getAttribute('data-year') || '0');
        }
      });
      
      if (closestYear !== activeYear) {
        setActiveYear(closestYear);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeYear]);
  
  // Add mouse enter/leave handlers for scrollbar
  const handleScrollbarMouseEnter = useCallback(() => {
    scrollbarVisibleRef.current = true;
    setScrollbarVisible(true);
  }, []);
  
  const handleScrollbarMouseLeave = useCallback(() => {
    scrollbarVisibleRef.current = false;
    setScrollbarVisible(false);
  }, []);
  
  // Add proper padding to the first timeline item if mobile scrollbar is showing
  const getTimelineTopPadding = (): string => {
    return isMobile ? "pt-20" : ""; // Add padding when horizontal scrollbar is visible
  };
  
  // Add a listener to prevent hash changes from reloading the page
  useEffect(() => {
    const handleHashChange = (e: HashChangeEvent) => {
      // Prevent default if the hash is just a year marker
      if (e.newURL.includes('#year-')) {
        e.preventDefault();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return (
    <div className="relative w-full">
      {/* Fixed canvas covering the entire viewport */}
      <canvas 
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      />
      
      {/* Timeline container */}
      <div 
        ref={timelineContainerRef}
        className={`container mx-auto relative py-4 ${getTimelineTopPadding()}`}
      >

        
        {reversedTimelineItems.map((item, index) => {
          const currentYear = getYearFromDate(item.startDate);
          const showYearMarker = index === 0 || 
            getYearFromDate(reversedTimelineItems[index-1].startDate) !== currentYear;
          
          const positionClass = getPositionClass(index);
          const offsetClass = getOffsetClass(index);
          const isImageLeft = index % 2 === 0;
          
          return (
            <div 
              key={item.id}
              ref={el => el && cardRefsMap.current.set(item.id, el)}
              className={`relative pl-0 pb-12 ${offsetClass} group`}
              data-timeline-index={index}
              data-year={currentYear}
            >
              {/* Year marker */}
              {showYearMarker && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-background/90 backdrop-blur-sm border border-border/50 px-4 py-1 rounded-full text-sm font-mono text-primary animate-pulse-subtle flex items-center gap-2">
                    {currentYear}
                    {currentYear === 2025 && (
                      <span className="text-xs text-primary/80 font-medium">(Right Now)</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Timeline card - made more compact */}
              <div 
                className={`timeline-card relative ${positionClass} group-hover:shadow-lg transition-all ${!item.imageSlot ? 'full-width-card' : ''}`}
              >
                {/* Card content with potential adaptive media layout */}
                <div className="flex flex-col gap-4">
                  {/* Top section with logo and content */}
                  <div className="flex flex-row gap-3 items-start w-full lg:w-auto">
                    {/* Content - more compact */}
                    <Card className={`flex-1 bg-card/80 backdrop-blur-sm border border-border/50 rounded-md overflow-hidden transition-all duration-300 group-hover:border-border`}>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
                          <Calendar size={12} />
                          <span>{item.startDate}</span>
                        </div>
                        
                        <h3 className="text-lg font-sans font-medium tracking-tight">{item.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                          <Briefcase size={12} className="text-primary" />
                          <span className="font-medium">{item.company}</span>
                          {item.location && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex items-center gap-1">
                                <MapPin size={12} className="text-muted-foreground" />
                                <span className="text-muted-foreground">{item.location}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="mt-3 text-sm font-mono text-foreground/90 max-w-none">{item.description}</div>
                        
                        {item.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {item.tags.map((tag, idx) => {
                              const colors = tagColors[tag];
                              return (
                                <span 
                                  key={idx} 
                                  className={`px-2 py-0.5 text-xs font-mono rounded-sm border border-border/10 ${colors.bg} ${colors.text}`}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                  
                  {/* Adaptive Media Content */}
                  {item.imageSlot && (
                    <div 
                      className={`
                        media-slot 
                        ${positionClass} 
                        opacity-100 hover:opacity-100 transition-opacity
                        natural-media
                        ${item.imageSlot.position ? `media-position-${item.imageSlot.position}` : 'media-position-auto'}
                      `}
                      data-media-slot={item.id}
                    >
                      <div className="border border-border/50 rounded-md overflow-hidden shadow-md h-auto">
                        {item.imageSlot.type === 'image' ? (
                          <ClickableImage
                            src={item.imageSlot.url}
                            alt={item.imageSlot.caption || `${item.company} project`}
                            href={item.imageSlot.href || '#'}
                            caption={item.imageSlot.caption}
                          />
                        ) : item.imageSlot.type === 'video' ? (
                          <div className="max-h-[500px] bg-black/90">
                            <video 
                              src={item.imageSlot.url} 
                              controls
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-auto max-h-[500px] object-contain"
                            />
                            {item.imageSlot.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 text-xs font-mono">
                                {item.imageSlot.caption}
                              </div>
                            )}
                          </div>
                        ) : item.imageSlot.type === 'youtube' && item.imageSlot.youtubeEmbed ? (
                          <div className="relative w-full aspect-video bg-black max-h-[500px]">
                            <div 
                              className="w-full h-full"
                              dangerouslySetInnerHTML={{ __html: item.imageSlot.youtubeEmbed }}
                            />
                            {item.imageSlot.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 text-xs font-mono">
                                {item.imageSlot.caption}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full h-full max-h-[450px]">
                            <p className="text-xs font-mono text-muted-foreground">Media content will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Custom year scrollbar - Vertical for desktop, Horizontal for mobile */}
      {isMobile ? (
        // Horizontal scrollbar for mobile
        <div 
          ref={scrollbarRef}
          className={`fixed top-0 left-0 w-full z-20 transition-all duration-300 ${scrollbarVisible ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          onMouseEnter={handleScrollbarMouseEnter}
          onMouseLeave={handleScrollbarMouseLeave}
          onTouchStart={handleScrollbarMouseEnter}
          onTouchEnd={() => setTimeout(handleScrollbarMouseLeave, 3000)}
        >
          <div className="relative bg-background/30 backdrop-blur-sm border-b border-border/50 py-1 px-2 shadow-md flex items-center justify-center">
            {/* Scroll left button */}
            <button 
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary/50 transition-colors"
              onClick={(e) => scrollToYear(timelineYears[0], e)}
              aria-label="Scroll to most recent year"
            >
              <ChevronLeft size={16} className="text-foreground/80" />
            </button>
            
            {/* Year markers - horizontal layout */}
            <div className="py-1 px-2 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {timelineYears.map(year => {
                const isHighlighted = activeTag && activeYears.has(year);
                const colors = activeTag && isHighlighted ? tagColors[activeTag] : null;
                const isCurrentYear = year === 2025;
                
                return (
                  <div 
                    key={year} 
                    ref={el => el && yearsRef.current.set(year, el)}
                    className={`
                      px-3 py-1.5 text-xs font-mono rounded-md cursor-pointer whitespace-nowrap
                      transition-all duration-200 flex items-center gap-1
                      ${activeYear === year ? 'font-bold scale-110' : 'hover:bg-secondary/40'}
                      ${colors ? `${colors.bg} ${colors.text} shadow-sm backdrop-blur-sm` : 'hover:bg-secondary/40'}
                    `}
                    onClick={(e) => scrollToYear(year, e)}
                  >
                    {year}
                    {isCurrentYear && (
                      <span className="text-[10px] text-primary/90 font-medium">(Right Now)</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Scroll right button */}
            <button 
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary/50 transition-colors"
              onClick={(e) => scrollToYear(timelineYears[timelineYears.length - 1], e)}
              aria-label="Scroll to earliest year"
            >
              <ChevronRight size={16} className="text-foreground/80" />
            </button>
          </div>
        </div>
      ) : (
        // Original vertical scrollbar for desktop
        <div 
          ref={scrollbarRef}
          className={`fixed right-8 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 ${scrollbarVisible ? 'opacity-100 transform translate-x-0' : 'opacity-30 hover:opacity-60 transform translate-x-2'}`}
          onMouseEnter={handleScrollbarMouseEnter}
          onMouseLeave={handleScrollbarMouseLeave}
        >
          <div className="relative bg-background/30 backdrop-blur-sm border border-border/50 rounded-full py-2 px-1 shadow-md flex flex-col items-center">
            {/* Scroll up button */}
            <button 
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary/50 transition-colors"
              onClick={(e) => scrollToYear(timelineYears[0], e)}
              aria-label="Scroll to most recent year"
            >
              <ChevronUp size={16} className="text-foreground/80" />
            </button>
            
            {/* Year markers */}
            <div className="py-2 flex flex-col items-center">
              {timelineYears.map(year => {
                const isHighlighted = activeTag && activeYears.has(year);
                const colors = activeTag && isHighlighted ? tagColors[activeTag] : null;
                const isCurrentYear = year === 2025;
                
                return (
                  <div 
                    key={year} 
                    ref={el => el && yearsRef.current.set(year, el)}
                    className={`
                      my-1 px-3 py-1.5 text-xs font-mono rounded-md cursor-pointer 
                      transition-all duration-200 flex items-center gap-2
                      ${activeYear === year ? 'font-bold scale-110' : 'hover:bg-secondary/40'}
                      ${colors ? `${colors.bg} ${colors.text} shadow-sm backdrop-blur-sm` : 'hover:bg-secondary/40'}
                    `}
                    onClick={(e) => scrollToYear(year, e)}
                  >
                    {year}
                    {isCurrentYear && (
                      <span className="text-[10px] text-primary/90 font-medium">(Right Now)</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Scroll down button */}
            <button 
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary/50 transition-colors"
              onClick={(e) => scrollToYear(timelineYears[timelineYears.length - 1], e)}
              aria-label="Scroll to earliest year"
            >
              <ChevronDown size={16} className="text-foreground/80" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedCanvas; 