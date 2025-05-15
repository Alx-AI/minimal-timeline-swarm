import React from 'react';

interface ClickableImageProps {
  src: string;
  alt: string;
  href: string;
  caption?: string;
}

const ClickableImage: React.FC<ClickableImageProps> = ({ src, alt, href, caption }) => {
  return (
    <div className="relative max-h-[500px] w-auto overflow-hidden bg-black/10">
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto object-contain max-h-[500px] transition-opacity hover:opacity-90"
        />
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
