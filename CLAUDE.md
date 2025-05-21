# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Site Structure

- Single page application with a responsive timeline view
- Interactive animated particle background integrated with timeline elements
- Interactive timeline with curved dot connections that respond to cursor
- Category-based exploration with color-coded tags
- Year-based scrollbar navigation with tag highlighting
- Dark/light theme toggle
- Key components:
  - IntegratedCanvas: Manages both the interactive background and timeline display
  - Header: Profile information and tag-based filtering system
  - TitleDots: SVG-to-dots conversion for visual elements

## Timeline Features

- Reverse chronological order (newest to oldest)
- Animated particle swarm background with cursor interaction
- Curved dot connections between timeline entries that respond to mouse movement
- Category tags with consistent color scheme across components
- Image/video slots for each timeline entry
- Custom scrollbar with year markers and tag-based highlighting
- Responsive layout with wave-like pattern

## Tag System

- Seven main categories with consistent color schemes:
  - AI (Purple): bg-purple-200/80 dark:bg-purple-900/30
  - Education (Blue): bg-blue-200/80 dark:bg-blue-900/30
  - Robotics (Green): bg-green-200/80 dark:bg-green-900/30
  - Games (Yellow): bg-yellow-200/80 dark:bg-yellow-900/30
  - Media (Red): bg-red-200/80 dark:bg-red-900/30
  - Data (Cyan): bg-cyan-200/80 dark:bg-cyan-900/30
  - Life Sciences (Pink): bg-pink-200/80 dark:bg-pink-900/30
- Interactive features:
  - Click to filter timeline by category
  - Visual feedback on timeline years containing selected category
  - Consistent color application across components
  - Responsive hover and active states

## Build & Development Commands

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run build:dev`: Build for development mode
- `npm run lint`: Run ESLint to check code quality
- `npm run preview`: Preview the built application

## Code Style Guidelines

### Imports
- React imports first, then third-party libraries, then local imports
- Group imports by type (React, components, hooks, utilities)
- Import tag types and colors from Header component

### Typing
- Use TypeScript interfaces for component props and React.FC<PropType> for functional components
- Type state properly with appropriate generics
- Use type aliases for commonly used types
- Define Tag type as union of available categories

### Naming Conventions
- PascalCase for component files and names (e.g., IntegratedCanvas.tsx)
- camelCase for functions, variables, and instance methods
- Use descriptive names for props interfaces (e.g., IntegratedCanvasProps)

### Component Structure
- Define prop interfaces outside component
- Functional components with destructured props
- Helper functions defined before the main component
- Consistent tag color application using tagColors object

### Code Formatting
- Use shadcn/ui components with tailwind classes via the cn utility
- Use JSX with proper spacing and indentation
- Maintain consistent color scheme application across components

### Error Handling
- Check for null/undefined with optional chaining and nullish coalescing
- Validate tag values against defined Tag type

### Canvas Animation
- Use requestAnimationFrame for smooth animations
- Optimize performance by throttling updates
- Keep references to animation IDs and cancel them on cleanup
- Separate draw and update logic
- Handle tag-based highlighting efficiently