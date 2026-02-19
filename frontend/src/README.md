# Frontend Source Structure

This document outlines the refactored frontend source code organization for TestGenie.

## Directory Structure

```
src/
├── App.tsx                 # Main App component
├── main.tsx               # Application entry point
├── index.css               # Global styles
├── App.css                # App-specific styles
├── assets/                # Static assets
├── components/            # Reusable UI components
│   ├── CodeEditor.jsx
│   ├── Configuration.jsx
│   ├── FileUpload.jsx
│   ├── Footer.css
│   ├── Footer.jsx
│   ├── GenerateButton.jsx
│   ├── Hero.css
│   ├── Hero.jsx
│   ├── LanguageSelector.jsx
│   ├── Navbar.css
│   ├── Navbar.jsx
│   ├── ProcessingOverlay.jsx
│   ├── ResultsSection.css
│   ├── ResultsSection.jsx
│   ├── TestCaseCard.jsx
│   ├── UploadSection.css
│   └── UploadSection.jsx
├── hooks/                 # Custom React hooks
│   ├── index.ts         # Hook exports
│   ├── useApi.ts        # API integration logic
│   └── useUI.ts         # UI state management
├── pages/                 # Page components
│   └── TestGenie.tsx    # Main test generation page
├── services/              # External service integrations
│   └── api.ts           # API service layer
├── types/                 # TypeScript type definitions
│   └── index.ts         # Type exports
├── utils/                 # Utility functions
│   └── index.ts         # Helper functions
└── constants/             # Application constants
    └── index.ts         # Configuration constants
```

## Key Improvements

### 1. **Separation of Concerns**
- **Types**: Centralized in `/types/index.ts`
- **Hooks**: Custom hooks for reusable logic
- **Services**: API layer separated from UI components
- **Utils**: Helper functions for common operations
- **Constants**: Configuration values centralized

### 2. **Custom Hooks**

#### `useApi` Hook
- Encapsulates API state management
- Handles loading states and error handling
- Provides methods for text and file generation

#### `useUI` Hook
- **useToast**: Toast notification system
- **useFileUpload**: File upload state and handlers
- **useDragDrop**: Drag and drop functionality
- **useExpandedCards**: Test case expansion state
- **useScrollTo**: Smooth scroll to results

### 3. **Type Safety**
- All interfaces properly typed
- Type-only imports where appropriate
- Consistent typing across components

### 4. **Utility Functions**
- `formatSize`: File size formatting
- `copyToClipboard`: Clipboard operations
- `getCategoryColor`: Dynamic styling based on test category
- `getPriorityColor`: Dynamic styling based on priority

### 5. **Constants Management**
- Language options
- File extensions
- Coverage depth configurations
- Test framework options
- Placeholder code snippets

## Benefits

1. **Maintainability**: Clear separation of concerns
2. **Reusability**: Hooks and utilities can be shared
3. **Type Safety**: Centralized type definitions
4. **Testing**: Easier unit testing of isolated functions
5. **Scalability**: Modular structure supports growth

## Usage

```typescript
// Import types
import type { TestCase, GenerateTestResponse } from '../types';

// Import hooks
import { useApi, useToast } from '../hooks';

// Import utilities
import { formatSize, copyToClipboard } from '../utils';

// Import constants
import { LANGUAGES, COVERAGE_DEPTH_OPTIONS } from '../constants';
```

This refactored structure provides a solid foundation for future development and maintenance.
