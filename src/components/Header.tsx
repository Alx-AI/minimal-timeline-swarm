import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import TitleDots from './TitleDots';

export type Tag = 'AI' | 'Education' | 'Robotics' | 'Games' | 'Media' | 'Data' | 'Life Sciences';

export const tagColors: Record<Tag, { bg: string, text: string, selectedBg: string }> = {
  'AI': { 
    bg: 'bg-purple-200/80 dark:bg-purple-900/30', 
    text: 'text-purple-800 dark:text-purple-200',
    selectedBg: 'bg-purple-300 dark:bg-purple-800'
  },
  'Education': { 
    bg: 'bg-blue-200/80 dark:bg-blue-900/30', 
    text: 'text-blue-800 dark:text-blue-200',
    selectedBg: 'bg-blue-300 dark:bg-blue-800'
  },
  'Robotics': { 
    bg: 'bg-green-200/80 dark:bg-green-900/30', 
    text: 'text-green-800 dark:text-green-200',
    selectedBg: 'bg-green-300 dark:bg-green-800'
  },
  'Games': { 
    bg: 'bg-yellow-200/80 dark:bg-yellow-900/30', 
    text: 'text-yellow-800 dark:text-yellow-200',
    selectedBg: 'bg-yellow-300 dark:bg-yellow-800'
  },
  'Media': { 
    bg: 'bg-red-200/80 dark:bg-red-900/30', 
    text: 'text-red-800 dark:text-red-200',
    selectedBg: 'bg-red-300 dark:bg-red-800'
  },
  'Data': { 
    bg: 'bg-cyan-200/80 dark:bg-cyan-900/30', 
    text: 'text-cyan-800 dark:text-cyan-200',
    selectedBg: 'bg-cyan-300 dark:bg-cyan-800'
  },
  'Life Sciences': { 
    bg: 'bg-pink-200/80 dark:bg-pink-900/30', 
    text: 'text-pink-800 dark:text-pink-200',
    selectedBg: 'bg-pink-300 dark:bg-pink-800'
  }
};

interface HeaderProps {
  name: string;
  title: string;
  onTagClick?: (tag: Tag) => void;
  activeTag?: Tag | null;
}

const Header: React.FC<HeaderProps> = ({ name, title, onTagClick, activeTag }) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: 350
  });
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: 350
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dotWidth = Math.min(dimensions.width * 0.5, 500);

  return (
    <header className="relative px-4 md:px-8 pt-6 pb-8 flex flex-col items-center text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      
      <div className="w-full relative h-[350px] flex items-center justify-center mb-4">
        <div className="relative w-full max-w-[500px] mx-auto">
          <TitleDots 
            svgPath="/assets/alxai.svg" 
            position="center" 
            width={dotWidth}
            height={dimensions.height}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4 animate-fade-in">
        <Sparkles size={16} className="text-primary" />
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
          Building teams & tools to empower{' '}
          <span className="relative">
            people
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"></span>
          </span>
          {' '}with AI
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto mb-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {Object.entries(tagColors).map(([tag, colors]) => (
          <button
            key={tag}
            onClick={() => onTagClick?.(tag as Tag)}
            className={`
              px-3 py-1.5 rounded-md font-mono text-sm transition-all
              ${activeTag === tag ? colors.selectedBg : colors.bg} ${colors.text}
              ${activeTag === tag ? 'scale-110 shadow-md ring-2 ring-primary/20' : 'hover:scale-105'}
              backdrop-blur-sm border border-border/10
            `}
          >
            {tag}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;
