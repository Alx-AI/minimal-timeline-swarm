
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Timeline, { TimelineItem } from '@/components/Timeline';
import Swarm from '@/components/Swarm';
import ThemeToggle from '@/components/ThemeToggle';

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
    id: '1',
    startDate: 'Nov 2024',
    endDate: 'Present',
    title: 'Head of AI Training & Consulting',
    company: 'Every Inc.',
    location: 'Brooklyn, New York, United States',
    description: 'Lead AI strategy and implementation for enterprise partners, including private equity firms, venture capital firms, portfolio companies, and Fortune 500 consumer brands.',
    skills: ['Artificial Intelligence (AI)', 'Generative AI', 'Product Development'],
    imageUrl: EVERY_LOGO
  },
  {
    id: '2',
    startDate: 'Nov 2023',
    endDate: 'Present',
    title: 'Vice President of Artificial Intelligence',
    company: 'Salt AI',
    location: 'Los Angeles, California, United States',
    description: 'Developed and launched Salt AI, a cutting-edge AI app development platform designed to expedite the integration of AI into business workflows.',
    skills: ['Generative AI', 'Executive Level Interaction', 'Intelligent Agents'],
    imageUrl: SALT_LOGO
  },
  {
    id: '3',
    startDate: 'Oct 2022',
    endDate: 'Nov 2023',
    title: 'Engineering Manager - Generative AI',
    company: 'Salt AI',
    location: 'Los Angeles Metropolitan Area',
    description: 'As the first hire, grew and led our machine learning and infrastructure teams to develop state of the art generative AI tools for creators.',
    skills: ['Team Leadership', 'Machine Learning', 'Infrastructure'],
    imageUrl: SALT_LOGO
  },
  {
    id: '4',
    startDate: 'Feb 2021',
    endDate: 'May 2024',
    title: 'Co-Founder',
    company: 'AI Camp',
    location: 'San Francisco Bay Area',
    description: 'Developed an end-to-end technical program for students. From introduction to professional experience, supported by a thriving community of practice.',
    skills: ['Artificial Intelligence (AI)', 'Product Management', 'Leadership'],
    imageUrl: AI_CAMP_LOGO
  },
  {
    id: '5',
    startDate: 'Jul 2022',
    endDate: 'Sep 2023',
    title: 'Lead Machine Learning Engineer - NounsAI',
    company: 'Nouns',
    location: 'Remote',
    description: 'Secured funding and assembled a team to pioneer generative AI tools for DAOs, empowering members with tools for creation, communication, and operation.',
    skills: ['Large Language Models (LLM)', 'Stable Diffusion', 'Generative AI'],
    imageUrl: NOUNS_LOGO
  },
  {
    id: '6',
    startDate: 'Jul 2019',
    endDate: 'Jun 2021',
    title: 'Data Science Consultant',
    company: 'Ernst & Young Global Consulting Services',
    location: 'Greater Los Angeles Area',
    description: 'Served as a product manager and applied ML engineer specialized in applied language models.',
    skills: ['Natural Language Processing (NLP)', 'Data Science', 'Project Management'],
    imageUrl: EY_LOGO
  },
  {
    id: '7',
    startDate: 'Jul 2018',
    endDate: 'Dec 2018',
    title: 'Electrical Engineer',
    company: 'Amazon Robotics',
    location: 'Boston, Massachusetts, United States',
    description: 'Built and implemented a visual object recognition system for autonomous robots using computer vision algorithms.',
    skills: ['Computer Vision', 'Robotics', 'Electrical Engineering'],
    imageUrl: AMAZON_LOGO
  },
  {
    id: '8',
    startDate: 'Jul 2017',
    endDate: 'Dec 2017',
    title: 'Electrical & Computer Engineer',
    company: 'Hasbro',
    location: 'Greater Los Angeles Area',
    description: 'Built functional toy prototypes during a 6-month development sprint.',
    skills: ['Electrical Engineering', 'Prototyping', 'Embedded Systems'],
    imageUrl: HASBRO_LOGO
  },
  {
    id: '9',
    startDate: 'Jul 2016',
    endDate: 'Dec 2016',
    title: 'Electrical Engineering Intern',
    company: 'Communications & Power Industries (CPI)',
    location: 'Beverly, Massachusetts',
    description: 'Tested pre-transmission response devices for military use by tuning diodes, measuring refraction via PNA, and ensuring they were within tolerance.',
    skills: ['Electrical Engineering', 'Testing', 'Military Applications'],
    imageUrl: CPI_LOGO
  },
  {
    id: '10',
    startDate: 'Jun 2013',
    endDate: 'Jul 2013',
    title: 'Assistant de Recherche',
    company: 'ENSEEIHT',
    location: 'Toulouse, Occitanie, France',
    description: 'Assisted the Algorithmes Parallèles et Optimisation team with repairing and improving an educational mock GPS and flight pattern program.',
    skills: ['C++', 'Algorithm Development', 'Research'],
    imageUrl: ENSEEIHT_LOGO
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
    <div className="min-h-screen">
      <ThemeToggle />
      <Swarm particleCount={80} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header 
          name="AlxAi"
          title="Building teams & tools to empower people"
          summary="Creating and leading teams to develop innovative AI solutions that enhance human capabilities. Specializing in generative AI, machine learning, and building tools that people love to use."
        />
        
        <main>
          <Timeline items={timelineData} />
        </main>
        
        <footer className="py-10 text-center text-muted-foreground text-xs font-mono">
          <p>&copy; {new Date().getFullYear()} • AlxAi</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
