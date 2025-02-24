# qontxt Project Structure

## Current Architecture

### `/src`
Root directory for all source code.

#### `/app`
Next.js app router with feature-based organization.
- `/api` - RESTful API routes
  - `/ai` - AI processing endpoints (✓ Complete)
    - `/analyze` - Resume analysis
    - `/parse-job` - Job description parsing
  - `/auth` - Authentication endpoints (✓ Complete)
  - `/settings` - User preferences (✓ Complete)
- `/dashboard` - Protected routes
  - `/resumes` - Resume management
  - `/settings` - User settings panel

#### `/components`
React components with domain-driven organization.
- `/ai` - AI-related components (✓ Complete)
  - `ATSScoring.tsx` - ATS compatibility display
  - `JobParser.tsx` - Job description analysis
- `/ui` - Reusable UI components (using shadcn/ui)
- `/resume` - Resume editing components
- `/settings` - Settings management components

#### `/lib`
Core business logic with clear separation of concerns.
- `/ai` - AI integration (✓ Complete)
  - `/providers` - AI model providers
  - `types.ts` - AI-related types
  - `provider.factory.ts` - Provider factory
  - `ai.service.ts` - Main AI service
- `/resume` - Resume processing (✓ Complete)
  - `resume.service.ts` - Resume management
  - `index.ts` - Public API
- `/settings` - Settings management
- `/utils` - Shared utilities

#### `/types`
TypeScript definitions with domain separation.
- `resume.types.ts` - Resume-related types (✓ Complete)
- `settings.ts` - Settings types (✓ Complete)
- `api.types.ts` - API types (✓ Complete)

## File Naming Conventions

### Components
- PascalCase for component files: `ATSScoring.tsx`
- Subcomponents in feature directories: `/ai/components/ScoreCard.tsx`
- Tests alongside components: `ATSScoring.test.tsx`

### Services
- Singular form: `resume.service.ts`
- Implementation separated from interface: `ai.service.ts`
- Types in separate files: `resume.types.ts`

### API Routes
- Use `route.ts` for handlers
- Group by feature: `/api/ai/analyze/route.ts`
- Validation in same directory: `/api/ai/analyze/validation.ts`

## Code Organization Guidelines

### Components
1. **Feature-First Organization**
   - Group by feature domain
   - Shared components in `/ui`
   - Clear component boundaries

2. **Component Structure**
   ```
   /components
     /[feature]
       /components     # Internal components
       /hooks         # Feature-specific hooks
       /utils        # Feature-specific utilities
       index.ts      # Public API
   ```

3. **State Management**
   - Local state for UI
   - Service pattern for business logic
   - Clear data flow

### Services
1. **Service Pattern**
   - Singleton instances
   - Clear public API
   - Strong type safety
   - Comprehensive error handling

2. **Directory Structure**
   ```
   /lib
     /[feature]
       /interfaces   # Type definitions
       /utils       # Internal utilities
       service.ts   # Main service
       index.ts     # Public API
   ```

### API Routes
1. **RESTful Design**
   - Clear resource mapping
   - Consistent error handling
   - Input validation
   - Rate limiting

2. **Directory Structure**
   ```
   /api
     /[feature]
       /[endpoint]
         route.ts     # Request handler
         schema.ts    # Validation schema
         types.ts     # Type definitions
   ```

## Testing Strategy

### Unit Tests
- Components: Component behavior and rendering
- Services: Business logic and error handling
- Utils: Pure function testing

### Integration Tests
- API routes: End-to-end request flow
- Service interactions: Cross-service behavior
- User flows: Complete feature testing

### Test Organization
```
/__tests__
  /unit
    /components
    /services
    /utils
  /integration
    /api
    /features
  /e2e
    /flows
```

## Documentation Guidelines

### Code Documentation
- JSDoc for public APIs
- Inline comments for complex logic
- README for each feature module
- Type documentation in separate files

### API Documentation
- OpenAPI/Swagger specifications
- Request/response examples
- Error documentation
- Authentication details

## Future Considerations

### Scalability
- Microservices separation
- Serverless functions
- Edge computing optimization

### Performance
- Code splitting strategy
- Caching implementation
- Bundle optimization

### Monitoring
- Error tracking setup
- Performance metrics
- Usage analytics

### Security
- Authentication flow
- Rate limiting
- Input validation
- Data sanitization
