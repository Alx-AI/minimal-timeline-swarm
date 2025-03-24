import React, { useEffect, useState } from 'react';
import Header, { Tag } from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import IntegratedCanvas, { TimelineItem } from '@/components/IntegratedCanvas';
import TitleDots from '@/components/TitleDots';
import { Twitter, Mail, Youtube, Copy, Check } from 'lucide-react';

const timelineData: TimelineItem[] = [
  {
    id: "1",
    startDate: "June 2013",
    endDate: "Present",
    title: "Airplane Route Simulation In C++",
    company: "ENSEEIHT",
    location: "Toulouse, France",
    description: "Worked with the Parallel Algorithms and Optimization team to realistically model plane routes around a simulation of the earth in C++.",
    tags: ['Data', 'Education'],
    imageUrl: ""
  },
  {
    id: "20",
    startDate: "May 2015",
    endDate: "Present",
    title: "Started My Journey into AI - Thanks Andrej!",
    company: "Self-Directed Research",
    location: "Remote",
    description: "Read \"The Unreasonable Effectiveness of Recurrent Neural Networks\" by Andrej Karpathy, which sparked my journey into AI and machine learning. This seminal paper showed how neural networks could generate coherent text, code, and baby names that were surprisingly creative. It inspired me to learn about AI to enable me to do more with less. Also drove home how impactful having an expert sharing their point of view could be.",
    tags: ['AI', 'Education', 'Data', 'Media'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/baby.png",
      type: "image",
      caption: "RNN Generated Baby Names",
      position: "auto"
    }
  },
  {
    id: "2",
    startDate: "July 2016",
    endDate: "Present", 
    title: "Radar Component Validation",
    company: "Communications & Power Industries",
    location: "Beverly, Massachusetts",
    description: "Validated radar communication components (pre-transmission response devices), to ensure high accuracy for military radar systems.",
    tags: ['Robotics', 'Data'],
    imageUrl: ""
  },
  {
    id: "3",
    startDate: "August 2017",
    endDate: "Present",
    title: "Made Toys",
    company: "Hasbro",
    location: "Los Angeles, California",
    description: "Built interactive toy prototypes—wired circuits, coded custom chips— and pitched my own toy, a \"Bop-It\" that taught you about music as you played.",
    tags: ['Games', 'Education', 'Robotics', 'AI'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/hasbro.mp4",
      type: "video",
      caption: "Hasbro Toy Prototype",
      position: "auto"
    }
  },
  {
    id: "4",
    startDate: "September 2018",
    endDate: "Present",
    title: "Helped Autonomous Robots See",
    company: "Amazon Robotics",
    location: "Boston, Massachusetts",
    description: "Built a computer vision system for autonomous warehouse robots. Made it possible for robots to see and navigate around the warehouses safely around humans.",
    tags: ['AI', 'Robotics', 'Data'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/ar.mp4",
      type: "video",
      caption: "Amazon Robotics Vision System",
      position: "auto"
    }
  },
  {
    id: "5",
    startDate: "November 2019",
    endDate: "Present",
    title: "Disney+ Launch",
    company: "EY Consulting – Disney+",
    location: "Los Angeles, California",
    description: "Led data team that built the payment processing system for Disney+, handled billions of transactions, and built a predictive analytics initiative improving user acquisition.",
    tags: ['Data', 'Media', 'AI'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/disney.png",
      type: "image",
      caption: "Disney+ Launch",
      position: "auto"
    }
  },
  {
    id: "6",
    startDate: "June 2020",
    endDate: "Present",
    title: "State Public Health Planning",
    company: "EY Consulting, Georgia's Department of Public Health",
    location: "Georgia",
    description: "Defined 5 years strategic roadmap shaping Georgia's public health policy.",
    tags: ['Life Sciences', 'Data'],
    imageUrl: "",
  },
  {
    id: "7",
    startDate: "August 2020",
    endDate: "Present",
    title: "AI Research Paper Summarization",
    company: "Byte Size Arxiv",
    location: "Remote",
    description: "Founded Byte Size Arxiv, used NLP to autonomously turn all research papers on Arxiv.org into accessible summaries every single day.",
    tags: ['AI', 'Education', 'Data'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/bsa.mp4",
      type: "video",
      caption: "Byte Size Arxiv Interface",
      position: "auto"
    }
  },
  {
    id: "8",
    startDate: "October 2020",
    endDate: "Present",
    title: "AI-assisted Grading and Feedback Platform",
    company: "Inertia Education",
    location: "Remote",
    description: "Created Inertia Education, AI-driven software helping teachers use AI to save time grading and provide students with more tailored feedback. Finalist for the Future Forum on Learning - Tools Competition.",
    tags: ['AI', 'Education', 'Data'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/inertia.png",
      type: "image",
      caption: "Inertia Education Platform",
      position: "auto"
    }
  },
  {
    id: "9",
    startDate: "December 2020",
    endDate: "Present",
    title: "FAA Data Infrastructure Modernization",
    company: "EY Consulting, Federal Aviation Administration",
    location: "Remote",
    description: "Modernized the FAA's data infrastructure and built ML-powered analytics dashboards to empower the team.",
    tags: ['Data', 'AI', 'Education'],
    imageUrl: "",
  },
  {
    id: "10",
    startDate: "January 2021",
    endDate: "Present",
    title: "Co-founded an AI Education Startup",
    company: "AI Camp",
    location: "San Francisco",
    description: "Launched AI Camp at scale, teaching thousands of students AI and machine learning concepts. Generated $3M+ revenue while offering 10% of students full scholarships and the majority partial scholarships. Alumni have gone on to work for major AI labs like Google, Stability AI, Pika Labs, and more.",
    tags: ['AI', 'Education'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/aic.png",
      type: "image",
      caption: "AI Camp Student Projects",
      position: "auto"
    }
  },
  {
    id: "11",
    startDate: "July 2022",
    endDate: "Present",
    title: "Pioneered First AI Video, Audio, and Data Interfaces for DAOs",
    company: "NounsAI",
    location: "Remote",
    description: "Founded NounsAI, providing generative AI and dynamic knowledge tools for DAOs, engaging tens of thousands of users. Built some of the first dedicated AI video and AI audio interfaces ever made.",
    tags: ['AI', 'Media', 'Data'],
    imageUrl: "",
    imageSlot: {
      url: "",
      type: "youtube",
      caption: "NounsAI Interface Demo",
      position: "auto",
      youtubeEmbed: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dvRuodQLXoc?si=E0Cc2TYK6x3jFT7u&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    }
  },
  {
    id: "12",
    startDate: "September 2022",
    endDate: "Present",
    title: "AI Talent Partnerships",
    company: "Team Tomorrow (AI Camp)",
    location: "San Francisco",
    description: "Launched Team Tomorrow, hiring the best and brightest from AI Camp to work for our team internally and professional partners including: Notable Health, Obico 3d printing, and others.",
    tags: ['AI', 'Education'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/tt.png",
      type: "image",
      caption: "Team Tomorrow Project",
      position: "auto"
    }
  },
  {
    id: "13",
    startDate: "August 2023",
    endDate: "Present",
    title: "Generative AI Social Media to Democratize Access to AI",
    company: "PlaiDay App",
    location: "Los Angeles",
    description: "Launched PlaiDay, democratizing personalized generative AI. Released the first personalized text to video generator ever. Partnered with Lionsgate for \"The Hunger Games\" movie launch.",
    tags: ['AI', 'Media', 'Games', 'Data'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/plai.png",
      type: "image",
      caption: "PlaiDay App Launch",
      position: "auto"
    }
  },
  {
    id: "14",
    startDate: "December 2023",
    endDate: "Present",
    title: "Generative AI for Luxury Architectural Design",
    company: "Kelly Wearstler",
    location: "Los Angeles",
    description: "Collaborated with Kelly Wearstler's design and architecture agents, using generative AI to help design a luxury hotel in Lake Tahoe.",
    tags: ['AI', 'Media'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/kw.png",
      type: "image",
      caption: "Luxury Hotel Design",
      position: "auto"
    }
  },
  {
    id: "15",
    startDate: "May 2024",
    endDate: "Present",
    title: "AI Workflow Creation Platform — Drug Discovery & More.",
    company: "Salt AI",
    location: "Los Angeles",
    description: "Launched Salt AI's Python visualization platform, accelerating design and deployment of generative AI workflows including: drug discovery research, generative art, chat with my data, etc.",
    tags: ['AI', 'Life Sciences', 'Data', 'Education', 'Media', 'Games'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/salt.png",
      type: "image",
      caption: "Salt AI Visualization Platform",
      position: "auto"
    }
  },
  {
    id: "16",
    startDate: "June 2024",
    endDate: "Present",
    title: "Delivered keynote on AI interfaces used in films and Coachella projects",
    company: "ComfyUI Global Leadership Summit",
    location: "Los Angeles",
    description: "Delivered keynote at the inaugural ComfyUI Leadership Summit, discussing accessible AI interfaces where teams showed work at Coachella, on major motion pictures, and epic real world laser shows.",
    tags: ['AI', 'Media', 'Games'],
    imageUrl: "",
    imageSlot: {
      url: "",
      type: "youtube",
      caption: "ComfyUI Summit Keynote",
      position: "auto",
      youtubeEmbed: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/_eu05argfOI?si=gr3fgNw1yQ7s4ks5&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    }
  },
  {
    id: "17",
    startDate: "November 2024",
    endDate: "Present",
    title: "Led Six-Figure AI Implementation Deals with PE, VC, and Hedge Funds",
    company: "Every Inc.",
    location: "Brooklyn, New York",
    description: "Began consulting with Every Inc., guiding enterprise AI strategies and implementations. Led multiple six-figure deals training private equity, VC, hedge fund, and tech companies on best practices of AI adoption with strategic implementation.",
    tags: ['AI', 'Education', 'Data'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/every.png",
      type: "image",
      caption: "Enterprise AI Strategy",
      position: "auto"
    }
  },
  {
    id: "18",
    startDate: "January 2025",
    endDate: "Present",
    title: "AI Drug Discovery to Accelerate Cancer Research",
    company: "Salt AI x Ellison Medical Institute",
    location: "Los Angeles",
    description: "Partnered with the Ellison Medical Institute to accelerate their drug discovery research. Optimized Alphafold to run 22x faster than vanilla and implemented many different models. Enabled life science specialists, machine learning engineers, and leadership all share the same language.",
    tags: ['AI', 'Life Sciences', 'Data'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/emi.png",
      type: "image",
      caption: "Alphafold Optimization",
      position: "auto"
    }
  },
  {
    id: "19",
    startDate: "January 2025",
    endDate: "Present",
    title: "AI Consulting and Staff Writer",
    company: "Every Inc.",
    location: "Brooklyn, New York",
    description: "Leading AI training and consulting, expanding clientele among Fortune 500 companies, technology companies, and financial firms internationally; authoring the \"Context Window\" column on our 100,000 subscriber newsletter—about what comes next.",
    tags: ['AI', 'Education', 'Media', 'Data'],
    imageUrl: "",
    imageSlot: {
      url: "/assets/cw.png",
      type: "image",
      caption: "Context Window Newsletter",
      position: "auto"
    }
  }
];

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: 350
  });
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('Alex@alxai.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    setMounted(true);
    
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

  if (!mounted) {
    return null;
  }
  
  const bottomDotWidth = Math.min(dimensions.width * 0.6, 600);

  const handleTagClick = (tag: Tag) => {
    setActiveTag(activeTag === tag ? null : tag);
  };

  return (
    <div className="relative min-h-screen">
      <ThemeToggle />
      
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20 sm:px-6 lg:px-8 relative z-10 font-mono">
        <Header 
          name="Al  x  Ai"
          title="Building teams & tools to empower people with AI."
          onTagClick={handleTagClick}
          activeTag={activeTag}
        />
        
        <main className="mt-8">
          <IntegratedCanvas 
            timelineItems={timelineData} 
            particleCount={45} 
            activeTag={activeTag}
          />
        </main>
        
        <div className="text-center mt-20 mb-12">
          <h3 className="text-xl font-semibold mb-4">Questions? Ideas?</h3>
          <p className="text-lg mb-6">Reach out</p>
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://x.com/theHeroShep/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-primary transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter size={24} />
            </a>
            <a 
              href="https://www.youtube.com/@AlxAi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-primary transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={24} />
            </a>
            <button
              onClick={handleCopyEmail}
              className="text-foreground/80 hover:text-primary transition-colors relative group"
              aria-label="Copy email address"
            >
              <div className="flex items-center gap-1">
                <Mail size={24} />
                {emailCopied && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border/50 px-2 py-1 rounded text-xs whitespace-nowrap">
                    Email copied!
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
        
        <div className="w-full relative h-[350px] flex items-center justify-center mb-8">
          <div className="relative w-full max-w-[600px] mx-auto">
            <TitleDots 
              svgPath="/assets/me.svg" 
              position="center" 
              width={bottomDotWidth}
              height={350}
            />
          </div>
        </div>
        
        <footer className="py-10 text-center text-muted-foreground text-xs font-mono">
          <p>&copy; {new Date().getFullYear()} • AlxAi</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
