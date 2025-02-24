# qontxt - AI-Powered Resume Builder

## Project Structure

```
src/
├── app/               # Next.js App Router
│   ├── (auth)/        # Authentication pages
│   ├── (dashboard)/   # Dashboard pages
│   │   └── resumes/   # Resume management
│   └── api/           # API routes
│       ├── ai/        # AI processing endpoints
│       ├── auth/      # Authentication endpoints
│       ├── resume/    # Resume management endpoints
│       └── settings/  # User settings endpoints
├── components/        # React components
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard components
│   ├── resume/        # Resume editing components
│   ├── settings/      # Settings components
│   ├── ai/            # AI analysis components
│   └── ui/            # Reusable UI components
├── lib/               # Core business logic
│   ├── services/      # Service layer
│   │   ├── auth/      # Authentication services
│   │   ├── ai/        # AI services
│   │   ├── resume/    # Resume services
│   │   └── settings/  # Settings services
│   └── utils/         # Utility functions
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Firebase (Firestore)
- **Authentication**: Firebase Auth
- **AI Integration**: OpenAI, Google Gemini
- **Hosting**: Vercel
