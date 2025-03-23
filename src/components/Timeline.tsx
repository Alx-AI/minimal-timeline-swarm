
import React, { useEffect, useRef } from 'react';
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

const TimelineItem: React.FC<{ item: TimelineItem; isVisible: boolean; index: number }> = ({ item, isVisible, index }) => {
  const positionClass = getPositionClass(index);
  const offsetClass = getOffsetClass(index);
  
  return (
    <div 
      className={`relative pl-0 pb-24 transition-all duration-500 ${offsetClass} ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
    >
      <div className={`timeline-card max-w-xl ${positionClass}`}>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {item.imageUrl && (
            <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden rounded-none border border-border bg-secondary">
              <img 
                src={item.imageUrl} 
                alt={`${item.company} logo`} 
                className="w-full h-full object-cover mix-blend-multiply grayscale contrast-125"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
              <Calendar size={12} />
              <span>{item.startDate} - {item.endDate}</span>
            </div>
            
            <h3 className="text-xl font-sans font-medium tracking-tight">{item.title}</h3>
            <div className="flex items-center gap-2 text-xs mt-1">
              <Briefcase size={12} className="text-primary" />
              <span className="font-medium">{item.company}</span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-muted-foreground" />
                <span className="text-muted-foreground">{item.location}</span>
              </div>
            </div>
            
            <p className="mt-3 text-sm font-mono text-foreground/80 text-balance max-w-2xl">{item.description}</p>
            
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, { element: HTMLDivElement; visible: boolean }>>(new Map());
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('data-id');
        if (id && itemRefs.current.has(id)) {
          const item = itemRefs.current.get(id);
          if (item) {
            item.visible = entry.isIntersecting;
            const element = entry.target as HTMLDivElement;
            if (entry.isIntersecting) {
              element.classList.remove('opacity-0', 'translate-y-10');
              element.classList.add('opacity-100', 'translate-y-0');
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Get all timeline item elements
    const timelineItems = timelineRef.current?.querySelectorAll('.timeline-item');
    if (timelineItems) {
      timelineItems.forEach(item => {
        observer.observe(item);
      });
    }

    return () => {
      if (timelineItems) {
        timelineItems.forEach(item => {
          observer.unobserve(item);
        });
      }
    };
  }, [items]);

  return (
    <div className="relative py-10 flex flex-col items-center" ref={timelineRef}>
      <div className="absolute h-full w-px bg-border mx-auto" style={{ left: 'calc(50% - 0.5px)' }}></div>
      
      {items.map((item, index) => (
        <div 
          key={item.id}
          data-id={item.id}
          className="timeline-item w-full" 
          ref={el => {
            if (el) {
              itemRefs.current.set(item.id, { element: el, visible: false });
            }
          }}
        >
          <TimelineItem 
            item={item} 
            isVisible={!!itemRefs.current.get(item.id)?.visible}
            index={index}
          />
        </div>
      ))}
    </div>
  );
};

export default Timeline;
