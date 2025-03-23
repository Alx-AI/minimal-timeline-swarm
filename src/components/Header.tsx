
import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  name: string;
  title: string;
  summary: string;
}

const Header: React.FC<HeaderProps> = ({ name, title, summary }) => {
  return (
    <header className="relative px-4 md:px-8 pt-24 pb-16 flex flex-col items-center text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 animate-fade-in">
        {name}
      </h1>
      
      <div className="flex items-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Sparkles size={16} className="text-primary" />
        <h2 className="text-xl md:text-2xl font-normal text-foreground/80">
          {title}
        </h2>
      </div>
      
      <p className="max-w-lg font-mono text-balance text-foreground text-base animate-fade-in" style={{ animationDelay: '200ms' }}>
        {summary}
      </p>
    </header>
  );
};

export default Header;
