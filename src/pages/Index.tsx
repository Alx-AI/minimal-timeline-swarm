import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ThemeToggle from '@/components/ThemeToggle';
import IntegratedCanvas, { TimelineItem } from '@/components/IntegratedCanvas';

// Company logos
const EVERY_LOGO = '/lovable-uploads/45cfada8-9bdd-44a4-9f79-1f2a5d71dfde.png';
const SALT_LOGO = '/lovable-uploads/6859b6fe-f690-41e6-8953-3a3fa57f3477.png';
const AI_CAMP_LOGO = '/lovable-uploads/4a58e442-1dc1-425e-9361-c71e37310536.png';
const NOUNS_LOGO = '/lovable-uploads/f6b10736-b309-4f98-8072-3d959d42117c.png';
const EY_LOGO = '/lovable-uploads/5d37d3c9-8c6e-4d84-8652-836e2a82ab98.png';
const AMAZON_LOGO = '/lovable-uploads/bbd9f23e-4fb2-4352-b93a-a358e2b1d686.png';
const HASBRO_LOGO = '/lovable-uploads/24ff5449-1252-4005-b37b-3807fc35b067.png';
const CPI_LOGO = '/lovable-uploads/b463aa7f-21f8-4fa8-8ce7-88de4d245355.png';
const ENSEEIHT_LOGO = '/lovable-uploads/6574c0b8-ac62-44bf-b418-c94b7252fc7c.png';

const timelineData: TimelineItem[] = [
  {
    id: "1",
    startDate: "June 2013",
    endDate: "Present",
    title: "Research Assistant",
    company: "ENSEEIHT",
    location: "Toulouse, France",
    description: "Worked with the Parallel Algorithms and Optimization team to realistically model plane routes around a simulation of the earth in C++.",
    skills: ["C++", "Parallel Computing", "Optimization"],
    imageUrl: "" // To be added later
  },
  {
    id: "2",
    startDate: "July 2016",
    endDate: "Present", 
    title: "Validation Engineer",
    company: "Communications & Power Industries",
    location: "Beverly, Massachusetts",
    description: "Validated radar communication components (pre-transmission response devices), to ensure high accuracy for military radar systems.",
    skills: ["Radar Systems", "Validation", "Testing"],
    imageUrl: "" // To be added later
  },
  {
    id: "3",
    startDate: "August 2017",
    endDate: "Present",
    title: "Toy Prototype Engineer",
    company: "Hasbro",
    location: "Los Angeles, California",
    description: "Built interactive toy prototypes—wired circuits, coded custom chips— and pitched my own toy, a \"Bop-It\" that taught you about music as you played.",
    skills: ["Circuits", "Chip Programming", "Prototyping"],
    imageUrl: "" // To be added later
  },
  {
    id: "4",
    startDate: "September 2018",
    endDate: "Present",
    title: "Computer Vision Engineer",
    company: "Amazon Robotics",
    location: "Boston, Massachusetts",
    description: "Helped autonomous warehouse robots see.",
    skills: ["Computer Vision", "Robotics", "Automation"],
    imageUrl: "" // To be added later
  },
  {
    id: "5",
    startDate: "November 2019",
    endDate: "Present",
    title: "Data Team Lead",
    company: "EY Consulting – Disney+ Launch",
    location: "Los Angeles, California",
    description: "Led data team that built the payment processing system for Disney+, handled billions of transactions, and built a predictive analytics initiative improving user acquisition.",
    skills: ["Payment Processing", "Predictive Analytics", "Data Management"],
    imageUrl: "" // To be added later
  },
  {
    id: "6",
    startDate: "June 2020",
    endDate: "Present",
    title: "Strategic Consultant",
    company: "EY Consulting, Georgia's Department of Public Health",
    location: "Georgia",
    description: "Defined 5 years strategic roadmap shaping Georgia's public health policy.",
    skills: ["Strategic Planning", "Public Health", "Policy Development"],
    imageUrl: "" // To be added later
  },
  {
    id: "7",
    startDate: "August 2020",
    endDate: "Present",
    title: "Founder",
    company: "Byte Size Arxiv",
    location: "Remote",
    description: "Founded Byte Size Arxiv, used NLP to autonomously turn all research papers on Arxiv.org into accessible summaries every single day.",
    skills: ["NLP", "Research Translation", "Automated Summarization"],
    imageUrl: "" // To be added later
  },
  {
    id: "8",
    startDate: "October 2020",
    endDate: "Present",
    title: "Founder",
    company: "Inertia Education",
    location: "Remote",
    description: "Created Inertia Education, AI-driven software helping teachers use AI to save time grading and provide students with more tailored feedback. Finalist for the Future Forum on Learning - Tools Competition.",
    skills: ["EdTech", "AI", "Automated Feedback"],
    imageUrl: "" // To be added later
  },
  {
    id: "9",
    startDate: "December 2020",
    endDate: "Present",
    title: "Data Infrastructure Modernization Lead",
    company: "EY Consulting, Federal Aviation Administration",
    location: "Remote",
    description: "Modernized the FAA's data infrastructure and built ML-powered analytics dashboards to empower the team.",
    skills: ["Data Infrastructure", "ML Analytics", "Dashboards"],
    imageUrl: "" // To be added later
  },
  {
    id: "10",
    startDate: "January 2021",
    endDate: "Present",
    title: "Founder",
    company: "AI Camp",
    location: "San Francisco",
    description: "Launched AI Camp at scale, teaching thousands of students AI and machine learning concepts. Generated $3M+ revenue while offering 10% of students full scholarships and the majority partial scholarships. Alumni have gone on to work for major AI labs like Google, Stability AI, Pika Labs, and more.",
    skills: ["AI Education", "Scholarship Programs", "Educational Scaling"],
    imageUrl: "" // To be added later
  },
  {
    id: "11",
    startDate: "July 2022",
    endDate: "Present",
    title: "Founder",
    company: "NounsAI",
    location: "Remote",
    description: "Founded NounsAI, providing generative AI and dynamic knowledge tools for DAOs, engaging tens of thousands of users. Built some of the first dedicated AI video and AI audio interfaces ever made.",
    skills: ["Generative AI", "DAO Tools", "AI Video & Audio"],
    imageUrl: "" // To be added later
  },
  {
    id: "12",
    startDate: "September 2022",
    endDate: "Present",
    title: "Founder",
    company: "Team Tomorrow (AI Camp)",
    location: "San Francisco",
    description: "Launched Team Tomorrow, hiring the best and brightest from AI Camp to work for our team internally and professional partners including: Notable Health, Obico 3d printing, and others.",
    skills: ["Talent Development", "Professional Partnerships", "Team Building"],
    imageUrl: "" // To be added later
  },
  {
    id: "13",
    startDate: "August 2023",
    endDate: "Present",
    title: "Founder",
    company: "PlaiDay App",
    location: "Los Angeles",
    description: "Launched PlaiDay, democratizing personalized generative AI. Partnered with Lionsgate for \"The Hunger Games\" movie launch.",
    skills: ["Generative AI", "Entertainment Partnerships", "Consumer Applications"],
    imageUrl: "" // To be added later
  },
  {
    id: "14",
    startDate: "December 2023",
    endDate: "Present",
    title: "AI Collaborator",
    company: "Kelly Wearstler",
    location: "Los Angeles",
    description: "Collaborated with Kelly Wearstler's design and architecture agents, using generative AI to help design a luxury hotel in Lake Tahoe.",
    skills: ["Design", "Generative AI", "Luxury Hospitality"],
    imageUrl: "" // To be added later
  },
  {
    id: "15",
    startDate: "May 2024",
    endDate: "Present",
    title: "Platform Lead",
    company: "Salt AI",
    location: "",
    description: "Launched Salt AI's Python visualization platform, accelerating design and deployment of generative AI workflows including: drug discovery research, generative art, chat with my data, etc.",
    skills: ["Python", "Visualization", "Generative AI Workflows"],
    imageUrl: "" // To be added later
  },
  {
    id: "16",
    startDate: "June 2024",
    endDate: "Present",
    title: "Keynote Speaker",
    company: "ComfyUI Global Leadership Summit",
    location: "",
    description: "Delivered keynote at the inaugural ComfyUI Leadership Summit, discussing accessible AI interfaces where teams showed work at Coachella, on major motion pictures, and epic real world laser shows.",
    skills: ["Public Speaking", "AI Interfaces", "Leadership"],
    imageUrl: "" // To be added later
  },
  {
    id: "17",
    startDate: "November 2024",
    endDate: "Present",
    title: "Consultant",
    company: "Every Inc.",
    location: "",
    description: "Began consulting with Every Inc., guiding enterprise AI strategies and implementations. Led multiple six-figure deals training private equity, VC, hedge fund, and tech companies on best practices of AI adoption with strategic implementation.",
    skills: ["Enterprise AI", "Strategic Implementation", "Training"],
    imageUrl: "" // To be added later
  },
  {
    id: "18",
    startDate: "January 2025",
    endDate: "Present",
    title: "Partnership Lead",
    company: "Salt AI x Ellison Medical Institute",
    location: "",
    description: "Partnered with the Ellison Medical Institute to accelerate their drug discovery research. Optimized Alphafold to run 22x faster than vanilla and implemented many different models. Enabled life science specialists, machine learning engineers, and leadership all share the same language.",
    skills: ["Drug Discovery", "Model Optimization", "Cross-discipline Communication"],
    imageUrl: "" // To be added later
  },
  {
    id: "19",
    startDate: "January 2025",
    endDate: "Present",
    title: "AI Lead",
    company: "Every Inc.",
    location: "",
    description: "Leading AI training and consulting, expanding clientele among Fortune 500 companies, technology companies, and financial firms internationally; authoring the \"Context Window\" column on our 100,000 subscriber newsletter—about what comes next.",
    skills: ["AI Training", "Fortune 500 Consulting", "Newsletter Authoring"],
    imageUrl: "" // To be added later
  }
];

const Index = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Set dark mode as default
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <ThemeToggle />
      
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20 sm:px-6 lg:px-8 relative z-10">
        <Header 
          name="AlxAi"
          title="Building teams & tools to empower people"
          summary="Creating and leading teams to develop innovative AI solutions that enhance human capabilities. Specializing in generative AI, machine learning, and building tools that people love to use."
        />
        
        <main className="mt-20">
          <IntegratedCanvas timelineItems={timelineData} particleCount={45} />
        </main>
        
        <footer className="py-10 text-center text-muted-foreground text-xs font-mono">
          <p>&copy; {new Date().getFullYear()} • AlxAi</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
