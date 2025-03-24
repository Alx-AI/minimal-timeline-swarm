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
}

const TitleDots: React.FC<TitleDotsProps> = ({ svgPath, position, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dots, setDots] = useState<Dot[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const [svgViewBox, setSvgViewBox] = useState({ width: 0, height: 0 });
  
  // Get global cursor position from store
  const { x: globalCursorX, y: globalCursorY, updatePosition } = useCursorStore();
  const [localMousePosition, setLocalMousePosition] = useState({ x: 0, y: 0 });

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
        
        console.log(`SVG loaded: ${svgPath}, dimensions: ${svgWidth}x${svgHeight}, viewBox found: ${!!viewBox}`);
        
        // Extract all circle elements
        const circles = svgDoc.querySelectorAll('circle');
        console.log(`Found ${circles.length} circles in SVG`);
        
        const extractedDots: Dot[] = [];
        
        // Calculate the scale to fit the SVG in our container
        // We'll maintain the aspect ratio of the original SVG
        const svgAspectRatio = svgWidth / svgHeight;
        const containerAspectRatio = width / height;
        
        let scaleX, scaleY, offsetX = 0, offsetY = 0;
        
        if (svgAspectRatio > containerAspectRatio) {
          // SVG is wider than container (relative to height)
          scaleX = width / svgWidth;
          scaleY = scaleX;
          offsetY = (height - (svgHeight * scaleY)) / 2;
        } else {
          // SVG is taller than container (relative to width)
          scaleY = height / svgHeight;
          scaleX = scaleY;
          offsetX = (width - (svgWidth * scaleX)) / 2;
        }
        
        console.log(`Scaling: ${scaleX}x${scaleY}, Offset: ${offsetX}x${offsetY}`);
        
        circles.forEach(circle => {
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          const cy = parseFloat(circle.getAttribute('cy') || '0');
          const r = parseFloat(circle.getAttribute('r') || '0');
          
          // Transform coordinates directly using the calculated scale and offset
          const x = cx * scaleX + offsetX;
          const y = cy * scaleY + offsetY;
          const scaledR = r * Math.min(scaleX, scaleY);
          
          // Don't filter any dots - include all of them
          extractedDots.push({
            x,
            y,
            r: Math.max(scaledR, 0.5), // Ensure minimum size
            opacity: Math.random() * 0.5 + 0.2,
            originalX: x,
            originalY: y
          });
        });
        
        console.log(`Extracted ${extractedDots.length} dots`);
        setDots(extractedDots);
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };
    
    fetchSvg();
  }, [svgPath, width, height]);

  // Handle mouse movement
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

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || dots.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with device pixel ratio for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale the context to ensure correct drawing dimensions
    ctx.scale(dpr, dpr);
    
    // Set the canvas CSS dimensions
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw dots with cursor interaction
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      dots.forEach(dot => {
        // Calculate distance to cursor - use local cursor position
        const dx = localMousePosition.x - dot.x;
        const dy = localMousePosition.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if cursor is inside our container
        const isCursorLocal = 
          localMousePosition.x >= 0 && 
          localMousePosition.x <= width && 
          localMousePosition.y >= 0 && 
          localMousePosition.y <= height;
        
        // Apply cursor influence
        let x = dot.x;
        let y = dot.y;
        
        if (distance < 150 && isCursorLocal) {
          const distanceFactor = 1 - Math.min(1, distance / 150);
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
        ctx.fillStyle = isDarkMode 
          ? `rgba(255, 255, 255, ${dot.opacity})` 
          : `rgba(0, 0, 0, ${dot.opacity})`;
        ctx.fill();
      });
      
      // Only draw connections if we have a reasonable number of dots
      // to prevent performance issues
      if (dots.length < 300) {
        // Connect dots to closest particles
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        
        // Draw connections between nearby dots
        for (let i = 0; i < dots.length; i++) {
          for (let j = i + 1; j < dots.length; j++) {
            const dx = dots[i].x - dots[j].x;
            const dy = dots[i].y - dots[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 40) {
              const opacity = 0.1 * (1 - distance / 40);
              ctx.strokeStyle = isDarkMode 
                ? `rgba(255, 255, 255, ${opacity})` 
                : `rgba(0, 0, 0, ${opacity})`;
                
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
          localMousePosition.x <= width && 
          localMousePosition.y >= 0 && 
          localMousePosition.y <= height
        ) {
          dots.forEach(dot => {
            const dx = localMousePosition.x - dot.x;
            const dy = localMousePosition.y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              const opacity = 0.15 * (1 - distance / 100);
              ctx.strokeStyle = isDarkMode 
                ? `rgba(255, 255, 255, ${opacity})` 
                : `rgba(0, 0, 0, ${opacity})`;
                
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
  }, [dots, localMousePosition, width, height]);

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