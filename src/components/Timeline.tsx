
import React from 'react';
import { Calendar, Briefcase, MapPin } from 'lucide-react';

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

const TimelineItem: React.FC<{ item: TimelineItem; index: number }> = ({ item, index }) => {
  const positionClass = getPositionClass(index);
  const offsetClass = getOffsetClass(index);
  
  return (
    <div className={`relative pl-0 pb-16 ${offsetClass}`}>
      <div className={`timeline-card max-w-xs sm:max-w-sm md:max-w-md ${positionClass}`}>
        <div className="flex flex-col gap-4">
          {item.imageUrl && (
            <div className="w-12 h-12 shrink-0 overflow-hidden rounded-none border border-border bg-secondary">
              <img 
                src={item.imageUrl} 
                alt={`${item.company} logo`} 
                className="w-full h-full object-cover mix-blend-multiply grayscale contrast-125"
              />
            </div>
          )}
          
          <div>
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
                {item.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-mono rounded-none border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="relative py-10">      
      {items.map((item, index) => (
        <TimelineItem 
          key={item.id}
          item={item} 
          index={index}
        />
      ))}
    </div>
  );
};

export default Timeline;
