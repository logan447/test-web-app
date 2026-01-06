# Olera - Elder Care Platform

Olera is a nationwide platform designed to make finding and establishing elder care simple, transparent, and human. It connects families with care providers across home care, assisted living, memory care, hospice, and independent caregivers.

## Features

- **Comprehensive Directory**: Browse home care, assisted living, memory care, hospice, nursing homes, and independent caregivers
- **Two-Way Matching**: Families and providers can discover and connect with each other
- **Care Profiles**: Families create detailed profiles describing their needs
- **Consult Requests**: Send and receive consultation requests between families and providers
- **Structured Messaging**: Communicate through organized, request-based conversations

## Tech Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Password Hashing**: bcryptjs
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd olera
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the following:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate a secure secret (run `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Core Models

- **User**: Accounts for families, providers, and admins
- **FamilyProfile**: Care needs and preferences for families
- **Provider**: Care provider listings (agencies, facilities, caregivers)
- **ConsultRequest**: Consultation requests between families and providers
- **Message**: Messages within consultation threads
- **SavedProvider**: Families can save providers they're interested in

### Key Relationships

- Users can be either FAMILY or PROVIDER role
- Family users have one FamilyProfile
- Provider users can claim one Provider listing
- ConsultRequests connect families with providers
- Messages belong to ConsultRequests

## Development

### Useful Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Prisma Studio (database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Project Structure

```
olera/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── providers/         # Provider directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── auth.ts           # NextAuth configuration
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
├── public/               # Static files
└── types/                # TypeScript type definitions
```

## Roadmap

### Phase 1: Foundation (Current)
- [x] User authentication (families and providers)
- [x] Database schema
- [x] Basic homepage and navigation

### Phase 2: Provider Directory
- [ ] Provider listing pages
- [ ] Search and filtering
- [ ] Location-based search
- [ ] Provider profile pages
- [ ] Claim provider functionality

### Phase 3: Family Care Profiles
- [ ] Care profile creation flow
- [ ] Needs assessment forms
- [ ] Privacy controls

### Phase 4: Matching & Requests
- [ ] Consult request system
- [ ] Two-way matching
- [ ] Request dashboard

### Phase 5: Communication
- [ ] Messaging system
- [ ] Notifications
- [ ] Request tracking

## Contributing

This is a private project. If you have access and want to contribute, please follow standard git practices:

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

Proprietary - All rights reserved
