
import React from 'react';
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
}> = ({ item, index, showYearMarker, year }) => {
  const positionClass = getPositionClass(index);
  const offsetClass = getOffsetClass(index);
  
  // Determine if image should be on left or right side
  const isImageLeft = index % 2 === 0;
  
  return (
    <div className={`relative pl-0 pb-20 ${offsetClass} group`}>
      {/* Year marker */}
      {showYearMarker && year && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 px-4 py-1 rounded-full text-sm font-mono text-primary animate-pulse-subtle">
            {year}
          </div>
        </div>
      )}
      
      {/* Connection line to next item */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 h-[calc(100%+2rem)] w-[1px] bg-gradient-to-b from-border via-border/50 to-transparent -z-10"></div>
      
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
        
        {/* Connection dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-10"></div>
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
  
  return (
    <div className="relative py-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-border/30 -z-10"></div>
      
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
  );
};

export default Timeline;
