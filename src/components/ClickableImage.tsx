import React, { useState, useEffect, useRef } from 'react';

interface ClickableImageProps {
  src: string;
  alt: string;
  href: string;
  caption?: string;
}

const ClickableImage: React.FC<ClickableImageProps> = ({ src, alt, href, caption }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative max-h-[500px] w-auto overflow-hidden bg-black/10">
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {/* Placeholder skeleton */}
        {!isLoaded && (
          <div className="w-full h-[300px] bg-secondary/20 animate-pulse" />
        )}
        
        {/* Lazy loaded image */}
        {isInView && (
          <img 
            src={src} 
            alt={alt} 
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-auto object-contain max-h-[500px] transition-opacity hover:opacity-90 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        )}
      </a>
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 text-xs font-mono">
          {caption}
        </div>
      )}
    </div>
  );
};

export default ClickableImage;
