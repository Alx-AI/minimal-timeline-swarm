
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Timeline, { TimelineItem } from '@/components/Timeline';
import Swarm from '@/components/Swarm';
import ThemeToggle from '@/components/ThemeToggle';

// Placeholder image URL
const PLACEHOLDER_IMAGE = '/placeholder.svg';

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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
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
    imageUrl: PLACEHOLDER_IMAGE
  }
];

const Index = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <ThemeToggle />
      <Swarm particleCount={30} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header 
          name="Alex Resume"
          title="AI Engineer & Team Builder"
          summary="Building teams and tools to empower people through artificial intelligence. Specializing in generative AI, machine learning, and creating innovative solutions across multiple industries."
        />
        
        <main>
          <Timeline items={timelineData} />
        </main>
        
        <footer className="py-10 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} • Built with modern web technologies</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
