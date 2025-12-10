# Notes

A modern note-taking application built with React, TypeScript, and Vite.

## Features

- Create, edit, and delete notes
- Rich text editor with @mention support
- User mentions with autocomplete dropdown
- Responsive grid layout
- Toast notifications
- Error handling and loading states

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vitest + Cypress** - Testing

## Getting Started

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run type-check` - Check TypeScript types
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
- `npm run cy:open` - Open Cypress UI
- `npm run coverage:combined` - Generate combined test coverage report

## Project Structure

- `src/features/notes` - Note management components
- `src/features/mention-editor` - Mention editor functionality
- `src/context` - React context providers
- `src/services` - API client and services
- `src/components` - Shared UI components
