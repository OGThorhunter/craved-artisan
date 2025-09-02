# Project Rules - Craved Artisan TypeScript Project

## 🎯 Core Principles

This document outlines the coding standards and best practices for the Craved Artisan marketplace project. Our goal is to maintain clean, maintainable, and performant code that prioritizes accessibility and user experience.

## 📝 Code Quality Standards

### TypeScript Best Practices
- **Use strict TypeScript configuration** - Enable all strict mode options
- **Type everything explicitly** - Avoid `any` type, use proper interfaces and types
- **Prefer interfaces over types** for object shapes and API contracts
- **Use union types and discriminated unions** for better type safety
- **Leverage TypeScript's utility types** (Partial, Pick, Omit, etc.)

### Function and Method Standards
```typescript
// ✅ Good: Explicit types, descriptive names, single responsibility
interface UserProfile {
  id: string;
  email: string;
  name: string;
}

async function createUserProfile(userData: Omit<UserProfile, 'id'>): Promise<UserProfile> {
  // Implementation
}

// ❌ Bad: No types, unclear purpose
function process(data: any) {
  // Implementation
}
```

### Variable and Constant Naming
- **Use descriptive names** that explain the purpose
- **Follow camelCase** for variables and functions
- **Use PascalCase** for classes, interfaces, and types
- **Use UPPER_SNAKE_CASE** for constants
- **Avoid abbreviations** unless they're widely understood

```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3;
const userAuthenticationToken = '...';
const isUserLoggedIn = true;

// ❌ Bad
const max = 3;
const token = '...';
const logged = true;
```

## 🧪 Testing Requirements

### Test Coverage Standards
- **Write tests for ALL business logic** - Aim for 90%+ coverage
- **Use descriptive test names** that explain the scenario and expected outcome
- **Test both success and failure cases** - Include edge cases and error states
- **Mock external dependencies** to ensure isolated testing

### Testing Framework: Jest + React Testing Library
```typescript
// ✅ Good: Descriptive test names, comprehensive coverage
describe('UserAuthentication', () => {
  describe('loginUser', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      // Test implementation
    });

    it('should reject login with invalid email format', async () => {
      // Test implementation
    });

    it('should handle network errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## 🚀 Performance Standards

### React Performance
- **Avoid unnecessary re-renders** - Use React.memo, useMemo, useCallback
- **Implement proper dependency arrays** in useEffect hooks
- **Use React.lazy() for code splitting** on route level
- **Optimize bundle size** - Tree shake unused imports

```typescript
// ✅ Good: Memoized components and callbacks
const ExpensiveComponent = React.memo(({ data, onUpdate }: Props) => {
  const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);
  const handleClick = useCallback(() => onUpdate(memoizedValue), [onUpdate, memoizedValue]);
  
  return <div onClick={handleClick}>{memoizedValue}</div>;
});

// ❌ Bad: Component re-renders on every parent update
const ExpensiveComponent = ({ data, onUpdate }: Props) => {
  const value = expensiveCalculation(data); // Runs on every render
  const handleClick = () => onUpdate(value); // New function on every render
  
  return <div onClick={handleClick}>{value}</div>;
};
```

### API Call Optimization
- **Implement request deduplication** - Use React Query or SWR
- **Cache responses appropriately** - Set proper cache invalidation
- **Batch API calls** when possible
- **Use optimistic updates** for better UX

```typescript
// ✅ Good: Optimized API calls with React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## ♿ Accessibility Standards

### Semantic HTML
- **Use proper HTML elements** - buttons for actions, headings for structure
- **Implement ARIA labels** for complex interactions
- **Ensure keyboard navigation** works for all interactive elements
- **Provide alt text** for all images

```typescript
// ✅ Good: Accessible component
const AccessibleButton = ({ children, onClick, ariaLabel }: ButtonProps) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    {children}
  </button>
);

// ❌ Bad: Non-accessible
const Button = ({ children, onClick }: ButtonProps) => (
  <div onClick={onClick}>{children}</div>
);
```

### Color and Contrast
- **Ensure sufficient color contrast** (WCAG AA minimum)
- **Don't rely solely on color** to convey information
- **Test with color blindness simulators**
- **Provide high contrast mode** option

## 🔒 Error Handling

### Exception Handling
- **Use specific error types** - Create custom error classes
- **Avoid generic error catching** - Handle specific error scenarios
- **Provide meaningful error messages** to users
- **Log errors appropriately** for debugging

```typescript
// ✅ Good: Specific error handling
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

try {
  validateUserInput(input);
} catch (error) {
  if (error instanceof ValidationError) {
    showFieldError(error.field, error.message);
  } else {
    logger.error('Unexpected error during validation:', error);
    showGenericError();
  }
}

// ❌ Bad: Generic error handling
try {
  validateUserInput(input);
} catch (error) {
  console.log('Something went wrong');
}
```

### Error Boundaries
- **Implement React Error Boundaries** for component-level error handling
- **Provide fallback UI** when errors occur
- **Log errors to monitoring service** (Sentry, LogRocket, etc.)

## 📚 Documentation Standards

### Code Comments
- **Add comments for complex algorithms** and business logic
- **Explain "why" not "what"** - Code should be self-documenting
- **Use JSDoc format** for function documentation
- **Keep comments up-to-date** with code changes

```typescript
/**
 * Calculates the optimal delivery route using the nearest neighbor algorithm.
 * This algorithm provides a good approximation for the traveling salesman problem
 * with O(n²) complexity, suitable for routes with up to 50 stops.
 * 
 * @param locations - Array of delivery locations with coordinates
 * @param startLocation - Starting point for the route
 * @returns Optimized route order and total distance
 * 
 * @example
 * const route = calculateOptimalRoute(locations, warehouse);
 */
function calculateOptimalRoute(
  locations: Location[],
  startLocation: Location
): RouteResult {
  // Implementation with complex algorithm
}
```

### README and Documentation
- **Maintain comprehensive README** with setup instructions
- **Document API endpoints** with examples
- **Include architecture diagrams** for complex systems
- **Provide troubleshooting guides** for common issues

## 🏗️ Project Structure

### File Organization
```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # Business logic and API calls
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
├── styles/             # CSS and styling
└── tests/              # Test files
```

### Import Organization
```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules
import { UserService } from '@/services/UserService';
import { UserType } from '@/types/User';

// 3. Relative imports
import { UserCard } from './UserCard';
import { useUser } from '../hooks/useUser';
```

## 🔄 Git and Version Control

### Commit Message Standards
- **Use conventional commit format** - feat:, fix:, docs:, etc.
- **Write descriptive commit messages** that explain the change
- **Reference issue numbers** when applicable
- **Keep commits atomic** - one logical change per commit

```bash
# ✅ Good commit messages
feat: add user authentication with JWT tokens
fix: resolve infinite loop in pagination component
docs: update API documentation with new endpoints
refactor: extract common validation logic into utility

# ❌ Bad commit messages
fix: stuff
update: things
wip: working on it
```

### Branch Naming
- **Use descriptive branch names** - feature/user-authentication
- **Include issue numbers** - feature/123-user-authentication
- **Use kebab-case** for consistency

## 🧹 Code Cleanliness

### Code Formatting
- **Use Prettier** for consistent code formatting
- **Configure ESLint** with strict rules
- **Use consistent indentation** (2 spaces for TypeScript)
- **Remove unused imports and variables**

### Function and Method Design
- **Single responsibility principle** - One function, one purpose
- **Keep functions small** - Maximum 20-30 lines
- **Use descriptive parameter names**
- **Return early** to reduce nesting

```typescript
// ✅ Good: Single responsibility, early return
function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!email.includes('@')) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true, error: null };
}

// ❌ Bad: Multiple responsibilities, deep nesting
function validateEmail(email: string): ValidationResult {
  if (email) {
    if (email.includes('@')) {
      // More validation logic...
      return { isValid: true, error: null };
    } else {
      return { isValid: false, error: 'Invalid email format' };
    }
  } else {
    return { isValid: false, error: 'Email is required' };
  }
}
```

## 🚫 Anti-Patterns to Avoid

### TypeScript Anti-Patterns
- **Don't use `any` type** - Use proper typing or `unknown`
- **Avoid type assertions** - Use type guards instead
- **Don't ignore TypeScript errors** - Fix them properly
- **Avoid non-null assertions** (`!`) - Handle null cases explicitly

### React Anti-Patterns
- **Don't mutate state directly** - Use setState or useReducer
- **Avoid inline object creation** in render methods
- **Don't use index as key** in lists
- **Avoid prop drilling** - Use Context or state management

## 📊 Code Review Checklist

Before submitting code for review, ensure:

- [ ] All tests pass
- [ ] Code follows TypeScript strict mode
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced

## 🔧 Development Tools

### Required Tools
- **TypeScript** - For type safety
- **ESLint** - For code quality
- **Prettier** - For code formatting
- **Jest** - For testing
- **React Testing Library** - For component testing
- **Husky** - For pre-commit hooks

### Recommended Extensions
- **ESLint** - VS Code extension
- **Prettier** - VS Code extension
- **TypeScript Importer** - VS Code extension
- **Error Lens** - VS Code extension

## 📈 Performance Monitoring

### Metrics to Track
- **Bundle size** - Keep under 250KB gzipped
- **First Contentful Paint** - Target < 1.5s
- **Largest Contentful Paint** - Target < 2.5s
- **Time to Interactive** - Target < 3.8s

### Tools
- **Lighthouse** - Performance auditing
- **Bundle Analyzer** - Bundle size analysis
- **React DevTools Profiler** - Component performance

---

## 📝 Quick Reference

### Common Commands
```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev:server    # Backend on port 3001
npm run dev:client    # Frontend on port 5173

# Run tests
npm run test

# Build for production
npm run build

# Lint code
npm run lint
```

### File Extensions
- **TypeScript**: `.ts`, `.tsx`
- **JavaScript**: `.js`, `.jsx` (avoid in new code)
- **CSS**: `.css`, `.scss`, `.module.css`
- **Tests**: `.test.ts`, `.test.tsx`, `.spec.ts`

### Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Types/Interfaces**: PascalCase (`UserProfile`)

---

*This document should be reviewed and updated regularly as the project evolves.*
