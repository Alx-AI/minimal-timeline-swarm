
import React from 'react';
import { GitBranch } from 'lucide-react';

interface HeaderProps {
  name: string;
  title: string;
  summary: string;
}

const Header: React.FC<HeaderProps> = ({ name, title, summary }) => {
  return (
    <header className="relative px-4 md:px-8 pt-24 pb-16 flex flex-col items-center text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-fade-in">
        {name}
      </h1>
      
      <div className="flex items-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <GitBranch size={16} className="text-primary" />
        <h2 className="text-xl md:text-2xl font-medium text-foreground/80">
          {title}
        </h2>
      </div>
      
      <p className="max-w-2xl text-balance text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
        {summary}
      </p>
    </header>
  );
};

export default Header;
