# SQAL (Saudi Quality Assurance League) Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Authentication System](#authentication-system)
5. [User Roles](#user-roles)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Key Features](#key-features)
9. [Development Setup](#development-setup)
10. [Deployment](#deployment)

## Project Overview
SQAL is a comprehensive platform developed by the SMT (Saudi Medical Tracker) team for managing medical trainees, clubs, and scouters in Saudi Arabia. The system facilitates the tracking of trainee applications, test results, and club management, ensuring quality assurance in medical training programs.

## Tech Stack
- **Frontend**: Next.js 15.2.2, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Authentication**: NextAuth.js, Supabase Auth
- **Password Hashing**: bcrypt/bcryptjs
- **State Management**: Zustand
- **Charts**: Chart.js, react-chartjs-2
- **Animations**: Framer Motion

## Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── (auth)/           # Authentication pages
│   └── ...               # Other pages
├── components/            # Reusable components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── types/                # TypeScript types
└── templates/            # Email templates
```

## Authentication System
The system uses a hybrid authentication approach:
- **Trainees**: Use Supabase Auth
- **Admins/Clubs/Scouters**: Use custom authentication with bcrypt hashing

### Password Hashing
- Uses bcrypt with 10 salt rounds
- Password generator script available in `generate-hash.js`
- Example usage:
```javascript
const hashedPassword = await bcrypt.hash(password, 10)
```

## User Roles
1. **Admin**
   - Full system access
   - Can manage clubs and scouters
   - Access to admin dashboard

2. **Club**
   - Manage trainee applications
   - View test results
   - Access to club dashboard

3. **Scouter**
   - Add and manage trainees
   - Record test results
   - Access to scouter dashboard

4. **Trainee**
   - View applications
   - Check test results
   - Access to trainee dashboard

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth configuration

### Admin
- `GET /api/admin-stats` - Get admin dashboard statistics
- `POST /api/scouters` - Create new scouter
- `POST /api/clubs` - Create new club


### Club
- `GET /api/clubs/[cid]` - Get club details
- `GET /api/clubs/[cid]/applications` - Get club applications
- `GET /api/clubs/[cid]/trainee/[id]` - Get trainee details

### Scouter
- `GET /api/scouter-dashboard` - Get scouter dashboard data
- `GET /api/scouters/[sid]` - Get scouter details
- `POST /api/trainees` - Create new trainee
- `GET /api/trainees/[tid]` - Get trainee details

### Trainee
- `GET /api/trainees/[tid]/tests` - Get trainee test results
- `GET /api/trainees/[tid]/status` - Get trainee status
- `POST /api/trainees/[tid]/verify` - Verify trainee

## Database Schema

### Tables
1. **admins**
   - aid (uuid, primary key)
   - name (text)
   - email (text, unique)
   - password (text, hashed)
   - created_at (timestamp)

2. **clubs**
   - cid (uuid, primary key)
   - name (text)
   - email (text, unique)
   - password (text, hashed)
   - location (text)
   - phone (text)
   - contact_person (text)
   - logo_url (text, optional)
   - description (text, optional)
   - created_at (timestamp)

3. **scouters**
   - sid (uuid, primary key)
   - name (text)
   - email (text, unique)
   - password (text, hashed)
   - created_at (timestamp)

4. **trainees**
   - tid (uuid, primary key)
   - name (text)
   - email (text, unique)
   - birth_date (date)
   - phone (text)
   - preferred_postion (text)
   - final_club_id (uuid)
   - created_at (timestamp)

5. **club_applications**
   - aid (uuid, primary key)
   - tid (uuid, foreign key)
   - cid (uuid, foreign key)
   - status (text)
   - notes (text)
   - feedback (text)
   - created_at (timestamp)

6. **test_results**
   - id (uuid, primary key)
   - tid (uuid, foreign key)
   - sid (uuid, foreign key)
   - score (integer)
   - date (timestamp)
   - created_at (timestamp)

## Key Features

### Admin Dashboard
- View system statistics
- Manage clubs and scouters
- Monitor applications and test results

### Club Dashboard
- View and manage trainee applications
- Track test results
- Manage club profile

### Scouter Dashboard
- Add and manage trainees
- Record test results
- View trainee progress

### Trainee Dashboard
- View applications
- Check test results
- Browse available clubs

## Development Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

4. Run the development server:
```bash
npm run dev
```

## Deployment
The application is configured for deployment on Vercel:
1. Build the application:
```bash
npm run build
```


### Environment Variables
Ensure all required environment variables are set in your deployment environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Security Considerations
1. All passwords are hashed using bcrypt
2. API routes are protected with authentication
3. Role-based access control implemented
4. Environment variables for sensitive data
5. Secure session management with NextAuth.js

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Team Information
- **Development Team**: SMT (Saudi Medical Tracker)
- **Project Name**: SQAL (Saudi Quality Assurance League)
- **Purpose**: Quality assurance and management system for medical training programs
- **Target Users**: Medical trainees, clubs, and scouters in Saudi Arabia

## License
[Add your license information here] 