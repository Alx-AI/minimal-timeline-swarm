import React, { useEffect, useRef, useState, useCallback } from 'react';
import useCursorStore from '@/utils/cursorStore';

interface Dot {
  x: number;
  y: number;
  r: number;
  opacity: number;
  originalX: number;
  originalY: number;
}

interface TitleDotsProps {
  svgPath: string;
  position: 'left' | 'right' | 'center';
  width: number;
  height: number;
  rainbowActive?: boolean;
}

const TitleDots: React.FC<TitleDotsProps> = ({ svgPath, position, width, height, rainbowActive = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dots, setDots] = useState<Dot[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const [svgViewBox, setSvgViewBox] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [extractedDots, setExtractedDots] = useState<{cx: number, cy: number, r: number}[]>([]);
  
  // Get global cursor position from store
  const { x: globalCursorX, y: globalCursorY, updatePosition } = useCursorStore();
  const [localMousePosition, setLocalMousePosition] = useState({ x: 0, y: 0 });
  
  // A flag to track if this is a mobile device
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parse the SVG and extract dot positions
  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch(svgPath);
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        
        // Extract the SVG dimensions and viewBox
        const svgElement = svgDoc.querySelector('svg');
        if (!svgElement) return;
        
        let svgWidth, svgHeight;
        const viewBox = svgElement.getAttribute('viewBox');
        
        if (viewBox) {
          const [_, __, vbWidth, vbHeight] = viewBox.split(' ').map(parseFloat);
          svgWidth = vbWidth;
          svgHeight = vbHeight;
        } else {
          svgWidth = parseFloat(svgElement.getAttribute('width') || '100');
          svgHeight = parseFloat(svgElement.getAttribute('height') || '100');
        }
        
        setSvgViewBox({ width: svgWidth, height: svgHeight });
        
        // Extract all circle elements
        const circles = svgDoc.querySelectorAll('circle');
        
        // Store the raw circle data for rescaling
        const extracted: {cx: number, cy: number, r: number}[] = [];
        
        circles.forEach(circle => {
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          const cy = parseFloat(circle.getAttribute('cy') || '0');
          const r = parseFloat(circle.getAttribute('r') || '0');
          
          extracted.push({ cx, cy, r });
        });
        
        setExtractedDots(extracted);
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };
    
    fetchSvg();
  }, [svgPath]);
  
  // Function to calculate dot positions based on container size
  const calculateDotPositions = useCallback(() => {
    if (!containerRef.current || extractedDots.length === 0 || svgViewBox.width === 0) return;
    
    // Get actual container dimensions
    const rect = containerRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    // Update the container size state
    setContainerSize({ width: containerWidth, height: containerHeight });
    
    // Calculate the scale to fit the SVG in our container
    // We'll maintain the aspect ratio of the original SVG
    const svgAspectRatio = svgViewBox.width / svgViewBox.height;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let scaleX, scaleY, offsetX = 0, offsetY = 0;
    
    if (svgAspectRatio > containerAspectRatio) {
      // SVG is wider than container (relative to height)
      scaleX = containerWidth / svgViewBox.width;
      scaleY = scaleX;
      offsetY = (containerHeight - (svgViewBox.height * scaleY)) / 2;
    } else {
      // SVG is taller than container (relative to width)
      scaleY = containerHeight / svgViewBox.height;
      scaleX = scaleY;
      offsetX = (containerWidth - (svgViewBox.width * scaleX)) / 2;
    }
    
    // Transform the dot positions
    const scaledDots: Dot[] = extractedDots.map(dot => {
      // Transform coordinates directly using the calculated scale and offset
      const x = dot.cx * scaleX + offsetX;
      const y = dot.cy * scaleY + offsetY;
      const scaledR = dot.r * Math.min(scaleX, scaleY);
      
      return {
        x,
        y,
        r: Math.max(scaledR, 0.5), // Ensure minimum size
        opacity: Math.random() * 0.5 + 0.2,
        originalX: x,
        originalY: y
      };
    });
    
    setDots(scaledDots);
  }, [extractedDots, svgViewBox]);
  
  // Set up ResizeObserver to detect container size changes
  useEffect(() => {
    calculateDotPositions();
    
    const observer = new ResizeObserver(() => {
      calculateDotPositions();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [calculateDotPositions]);
  
  // Recalculate on explicit width/height prop changes
  useEffect(() => {
    calculateDotPositions();
  }, [width, height, calculateDotPositions]);

  // Handle mouse movement with better mobile support
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    // Update the global cursor position
    updatePosition(e.clientX, e.clientY);
    
    // Calculate local position relative to our container
    const rect = containerRef.current.getBoundingClientRect();
    setLocalMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [updatePosition]);
  
  // Handle touch events for mobile
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    
    // Update the global cursor position
    updatePosition(touch.clientX, touch.clientY);
    
    // Calculate local position relative to our container
    const rect = containerRef.current.getBoundingClientRect();
    setLocalMousePosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  }, [updatePosition]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || dots.length === 0 || containerSize.width === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with device pixel ratio for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerSize.width * dpr;
    canvas.height = containerSize.height * dpr;
    
    // Scale the context to ensure correct drawing dimensions
    ctx.scale(dpr, dpr);
    
    // Set the canvas CSS dimensions
    canvas.style.width = `${containerSize.width}px`;
    canvas.style.height = `${containerSize.height}px`;
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, containerSize.width, containerSize.height);
      
      // Draw dots with cursor interaction
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Define rainbow colors (same as in IntegratedCanvas)
      const rainbowColors = [
        { r: 138, g: 43, b: 226 },   // Purple (AI)
        { r: 59, g: 130, b: 246 },   // Blue (Education)
        { r: 34, g: 197, b: 94 },    // Green (Robotics)
        { r: 250, g: 204, b: 21 },   // Yellow (Games)
        { r: 239, g: 68, b: 68 },    // Red (Media)
        { r: 6, g: 182, b: 212 },    // Cyan (Data)
        { r: 236, g: 72, b: 153 }    // Pink (Life Sciences)
      ];
      
      dots.forEach((dot, index) => {
        // Calculate distance to cursor - use local cursor position
        const dx = localMousePosition.x - dot.x;
        const dy = localMousePosition.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if cursor is inside our container
        const isCursorLocal = 
          localMousePosition.x >= 0 && 
          localMousePosition.x <= containerSize.width && 
          localMousePosition.y >= 0 && 
          localMousePosition.y <= containerSize.height;
        
        // Apply cursor influence
        let x = dot.x;
        let y = dot.y;
        
        // Adjust interaction radius based on device type
        const interactionRadius = isMobile ? 100 : 150;
        
        if (distance < interactionRadius && isCursorLocal) {
          const distanceFactor = 1 - Math.min(1, distance / interactionRadius);
          const angle = Math.atan2(dy, dx);
          
          // Make interaction strength proportional to dot size
          const interactionStrength = 5 * distanceFactor * (dot.r / 2);
          
          // Some dots should be attracted, others repelled (more organic)
          const attractionFactor = Math.sin(dot.originalX * 0.05 + dot.originalY * 0.05) * 0.7;
          
          x += Math.cos(angle) * interactionStrength * attractionFactor;
          y += Math.sin(angle) * interactionStrength * attractionFactor;
          
          // Increase opacity when interacting
          dot.opacity = Math.min(0.75, dot.opacity * 1.2);
        } else {
          // Return to original position
          x = dot.x + (dot.originalX - dot.x) * 0.1;
          y = dot.y + (dot.originalY - dot.y) * 0.1;
          
          // Return to original opacity
          dot.opacity = dot.opacity * 0.95 + (Math.random() * 0.3 + 0.2) * 0.05;
        }
        
        // Update dot position
        dot.x = x;
        dot.y = y;
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(x, y, dot.r, 0, Math.PI * 2);
        
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
      });
      
      // Only draw connections if we have a reasonable number of dots
      // to prevent performance issues
      if (dots.length < 300) {
        // Connect dots to closest particles
        ctx.lineWidth = 0.5;
        
        // Draw connections between nearby dots
        for (let i = 0; i < dots.length; i++) {
          for (let j = i + 1; j < dots.length; j++) {
            const dx = dots[i].x - dots[j].x;
            const dy = dots[i].y - dots[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Adjust connection distance based on device type
            const connectionRadius = isMobile ? 30 : 40;
            
            if (distance < connectionRadius) {
              const opacity = 0.1 * (1 - distance / connectionRadius);
              
              if (rainbowActive) {
                // Use a random rainbow color for each connection
                const colorIndex = Math.floor(Math.random() * rainbowColors.length);
                const color = rainbowColors[colorIndex];
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
              } else {
                ctx.strokeStyle = isDarkMode 
                  ? `rgba(255, 255, 255, ${opacity})` 
                  : `rgba(0, 0, 0, ${opacity})`;
              }
                
              ctx.beginPath();
              ctx.moveTo(dots[i].x, dots[i].y);
              ctx.lineTo(dots[j].x, dots[j].y);
              ctx.stroke();
            }
          }
        }
        
        // Draw connections to cursor if it's close and inside our container
        if (
          localMousePosition.x >= 0 && 
          localMousePosition.x <= containerSize.width && 
          localMousePosition.y >= 0 && 
          localMousePosition.y <= containerSize.height
        ) {
          // Adjust cursor connection radius based on device type
          const cursorConnectionRadius = isMobile ? 70 : 100;
          
          dots.forEach(dot => {
            const dx = localMousePosition.x - dot.x;
            const dy = localMousePosition.y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < cursorConnectionRadius) {
              const opacity = 0.15 * (1 - distance / cursorConnectionRadius);
              
              if (rainbowActive) {
                // Use a random rainbow color for cursor connections
                const colorIndex = Math.floor(Math.random() * rainbowColors.length);
                const color = rainbowColors[colorIndex];
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
              } else {
                ctx.strokeStyle = isDarkMode 
                  ? `rgba(255, 255, 255, ${opacity})` 
                  : `rgba(0, 0, 0, ${opacity})`;
              }
                
              ctx.beginPath();
              ctx.moveTo(dot.x, dot.y);
              ctx.lineTo(localMousePosition.x, localMousePosition.y);
              ctx.stroke();
            }
          });
        }
      }
      
      // Request next frame
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [dots, localMousePosition, containerSize, isMobile, rainbowActive]);

  return (
    <div 
      ref={containerRef}
      className={`relative h-full ${position === 'left' ? 'ml-2' : position === 'right' ? 'mr-2' : ''} pointer-events-auto flex-1 flex items-center justify-center`}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default TitleDots; 