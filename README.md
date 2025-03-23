# Minimal Timeline Swarm

An interactive timeline portfolio with a dynamic particle background. This project showcases a modern, minimalist approach to displaying a professional timeline with animated elements and cursor interactions.

## Features

- **Integrated Canvas Background & Timeline**: A unified canvas rendering both the interactive particle background and timeline connections
- **Animated Dot Connections**: Curved paths with animated dots that connect timeline entries
- **Cursor Interaction**: Background particles and connection dots respond to cursor movements
- **Image/Video Slots**: Support for media content beneath each timeline entry
- **Year-based Navigation**: Custom scrollbar with year markers for quick navigation
- **Reverse Chronological Order**: Displays most recent experiences first
- **Dark/Light Theme Toggle**: Seamless theme switching with appropriate visual adjustments

## Technologies Used

- **React**: For component-based UI development
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For utility-first styling
- **Shadcn UI**: For accessible UI components
- **HTML Canvas API**: For performant animations and interactions

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd minimal-timeline-swarm

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Component Structure

- **IntegratedCanvas**: The main component that renders both the background particles and timeline
- **Header**: Displays the user profile information
- **ThemeToggle**: Manages theme switching

## Canvas Animation Details

The canvas animation system includes:
- Background particles with subtle movement
- Cursor particle effects
- Dot connections between timeline items
- Mouse interaction with all animated elements

Performance optimizations:
- Throttled mouse event handling
- Conditional state updates
- Ref-based direct DOM manipulations for animations
- Selective rendering based on viewport visibility

## Implementation Notes

The integrated canvas approach combines what were previously separate components (Swarm and Timeline) into a single unified component that shares interaction logic and rendering. This provides a more cohesive user experience and better performance.

## Customization

Timeline entries can be easily customized in the `src/pages/Index.tsx` file by modifying the `timelineData` array. Each entry supports:

- Title, company, and location information
- Date ranges
- Descriptions
- Skills tags
- Optional images/videos for projects

## LICENSE

MIT

---

_See [CLAUDE.md](./CLAUDE.md) for additional development guidelines._
