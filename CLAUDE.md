# CLAUDE.md - Guidelines for working with this repository

## Site Structure

- Single page application with a responsive timeline view
- Interactive animated particle background integrated with timeline elements
- Interactive timeline with curved dot connections that respond to cursor
- Year-based scrollbar navigation
- Dark/light theme toggle
- Key components:
  - IntegratedCanvas: Manages both the interactive background and timeline display
  - Header: Profile information and introduction

## Timeline Features

- Reverse chronological order (newest to oldest)
- Animated particle swarm background with cursor interaction
- Curved dot connections between timeline entries that respond to mouse movement
- Image/video slots for each timeline entry
- Custom scrollbar with year markers for quick navigation
- Responsive layout with wave-like pattern

## Build & Development Commands

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint to check code quality
- `npm run preview`: Preview the built application

## Code Style Guidelines

### Imports
- React imports first, then third-party libraries, then local imports
- Group imports by type (React, components, hooks, utilities)

### Typing
- Use TypeScript interfaces for component props and React.FC<PropType> for functional components
- Type state properly with appropriate generics
- Use type aliases for commonly used types

### Naming Conventions
- PascalCase for component files and names (e.g., IntegratedCanvas.tsx)
- camelCase for functions, variables, and instance methods
- Use descriptive names for props interfaces (e.g., IntegratedCanvasProps)

### Component Structure
- Define prop interfaces outside component
- Functional components with destructured props
- Helper functions defined before the main component

### Code Formatting
- Use shadcn/ui components with tailwind classes via the cn utility
- Use JSX with proper spacing and indentation

### Error Handling
- Check for null/undefined with optional chaining and nullish coalescing

### Canvas Animation
- Use requestAnimationFrame for smooth animations
- Optimize performance by throttling updates
- Keep references to animation IDs and cancel them on cleanup
- Separate draw and update logic