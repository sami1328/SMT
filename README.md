# saql (SMT) Documentation

## Abstract
saql is a comprehensive platform developed by SMT for managing and evaluating scout activities in Saudi Arabia. This document outlines the technical implementation, architecture, and deployment details of the system.

## Introduction
The saql platform serves as a centralized system for managing the entire scouting process, from trainee registration to final club selection. It incorporates advanced AI analysis for player evaluation and provides a seamless experience for all stakeholders.

## Objectives
- Streamline the scouting and evaluation process
- Provide data-driven insights for player development
- Facilitate efficient communication between trainees and clubs
- Ensure secure and reliable system operation
- Maintain high performance and scalability

## System Overview
The system consists of four main user roles:
1. Trainees: Register, take tests, and apply to clubs
2. Clubs: Review applications and manage team members
3. Scouters: Evaluate trainees and manage test sessions
4. Administrators: Oversee the entire system and manage user accounts

## Features
### Trainee Features
- Profile management
- Test completion and results tracking
- Club application system
- Performance analysis and recommendations

### Club Features
- Application review and management
- Team member tracking
- Performance analytics
- Communication tools

### Scouter Features
- Trainee evaluation and assessment
- Test session management
- Performance data entry and analysis
- Report generation
- Communication with clubs and trainees
- AI-assisted player analysis

### Admin Features
- User management
- System monitoring
- Analytics and reporting
- Configuration management

## Tech Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: Supabase (PostgreSQL)
- Authentication: NextAuth.js
- AI Integration: DeepSeek which we used in cloud (make ai)

## AI Integration
### Current Implementation
- DeepSeek AI integration for player analysis
- Cloud-based AI processing
- Real-time player evaluation
- Position-specific scoring system

### AI Analysis Process
1. Data Collection
   - Position-specific metrics
   - Historical performance data
   - Club-specific requirements

2. Analysis Components
   - Physical attributes evaluation
   - Technical skills assessment
   - Tactical understanding analysis
   - Position suitability scoring
   - Development potential prediction

3. Output Generation
   - Detailed position ratings
   - Performance insights
   - Development recommendations
   - Club compatibility scores

### Integration Points
1. Test Result Processing
   - Automatic analysis of test data
   - Real-time scoring updates
   - Performance trend identification

2. Position Analysis
   - Multi-position evaluation
   - Best-fit position determination
   - Position-specific development paths

3. Club Matching
   - Club requirement analysis
   - Player-club compatibility scoring
   - Strategic fit recommendations

### Future AI Enhancements
1. Advanced Player Analysis
   - Multiple test comparison
   - Development tracking
   - Performance prediction
   - Trend analysis

2. Club-Specific AI
   - Club playing style simulation
   - ai coaching advice
   - Development recommendations
   - Strategic fit analysis

## Architecture Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Frontend       │◄───►│  API Routes     │◄───►│  Database       │
│  (Next.js)      │     │  (Next.js)      │     │  (Supabase)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                                               ▲
        │                                               │
        ▼                                               ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Authentication │     │  AI Analysis    │◄───►│  File Storage   │
│  (NextAuth)     │     │  (DeepSeek)     │     │  (Supabase)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Database Schema
### Core Tables

#### admins (5 columns)
- aid: uuid primary key
- name: text
- email: text
- created_at: timestamp with time zone default now()
- password: text

#### club_applications (8 columns)
- id: uuid primary key default uuid_generate_v4()
- trainee_uid: uuid references trainees(tid)
- club_id: uuid references clubs(cid)
- status: varchar(20) default 'Pending' check (status in ('Pending', 'Accepted', 'Rejected'))
- submitted_at: timestamp with time zone default current_timestamp
- updated_at: timestamp with time zone default current_timestamp
- feedback: text
- notes: text
- unique(trainee_uid, club_id)

#### clubs (10 columns)
- cid: uuid primary key default uuid_generate_v4()
- name: text not null
- email: text not null unique
- password: text not null
- location: text
- phone: text
- contact_person: text
- logo_url: text
- description: text
- created_at: timestamptz default now()

#### contact_messages (6 columns)
- id: serial primary key
- name: varchar(100) not null
- email: varchar(150) not null
- subject: varchar(50) not null
- message: text not null
- submitted_at: timestamp default current_timestamp

#### position_results (18 columns)
- id: uuid primary key default uuid_generate_v4()
- tid: uuid references trainees(tid) not null
- st: integer (Striker score)
- lw: integer (Left Winger score)
- rw: integer (Right Winger score)
- cam: integer (Central Attacking Midfielder score)
- cm: integer (Central Midfielder score)
- cdm: integer (Central Defensive Midfielder score)
- lm: integer (Left Midfielder score)
- rm: integer (Right Midfielder score)
- lb: integer (Left Back score)
- rb: integer (Right Back score)
- cb: integer (Center Back score)
- gk: integer (Goalkeeper score)
- best_position: text
- created_at: timestamp without time zone default now()
- updated_at: timestamp without time zone default now()
- notes: text

#### scouters (5 columns)
- sid: uuid primary key default uuid_generate_v4()
- name: text not null
- email: text not null unique
- created_at: timestamp with time zone default now()
- password: text not null

#### test_results (39 columns)
- id: uuid primary key default uuid_generate_v4()
- tid: uuid references trainees(tid) not null
- submitted_by: uuid references scouters(sid) not null
- acceleration: integer check (1-99)
- agility: integer check (1-99)
- balance: integer check (1-99)
- jumping: integer check (1-99)
- reactions: integer check (1-99)
- sprint_speed: integer check (1-99)
- stamina: integer check (1-99)
- strength: integer check (1-99)
- aggression: integer check (1-99)
- att_position: integer check (1-99)
- composure: integer check (1-99)
- interceptions: integer check (1-99)
- vision: integer check (1-99)
- ball_control: integer check (1-99)
- crossing: integer check (1-99)
- curve: integer check (1-99)
- defensive_awareness: integer check (1-99)
- dribbling: integer check (1-99)
- fk_accuracy: integer check (1-99)
- finishing: integer check (1-99)
- heading_accuracy: integer check (1-99)
- long_passing: integer check (1-99)
- long_shots: integer check (1-99)
- penalties: integer check (1-99)
- short_passing: integer check (1-99)
- shot_power: integer check (1-99)
- sliding_tackle: integer check (1-99)
- standing_tackle: integer check (1-99)
- volleys: integer check (1-99)
- gk_diving: integer check (1-99)
- gk_handling: integer check (1-99)
- gk_kicking: integer check (1-99)
- gk_positioning: integer check (1-99)
- gk_reflexes: integer check (1-99)
- created_at: timestamp with time zone default now()

#### trainees (10 columns)
- tid: uuid primary key default uuid_generate_v4()
- name: text not null
- email: text not null unique
- birth_date: date not null
- phone: text not null
- preferred_position: text not null
- status: text default 'Pending Test'
- created_at: timestamp with time zone default now()
- final_club_id: uuid references clubs(cid)



### Security Policies
1. Trainees can view their own applications
2. Trainees can create applications
3. Clubs can view their applications
4. Clubs can update application status
5. Test completion check before application
6. Final club selection validation

## Modules/Components
### Frontend Modules
1. Authentication Module
2. Dashboard Module
3. Test Module
4. Application Module
5. Profile Module
6. Admin Module
7. Scouter Module

### Backend Services
1. Authentication Service
2. Test Processing Service
3. AI Analysis Service
4. Application Management Service
5. Data Analytics Service
6. Scouter Management Service

## Implementation
### Setup Requirements
1. Node.js environment
2. Supabase project
3. Environment variables configuration
4. AI API integration

### Deployment Steps
1. Environment setup
2. Database initialization
3. Application build
4. Deployment to production



## Future Work
1. Enhanced AI analysis capabilities
   - Development of a dedicated AI system for player analysis
   - Capability to analyze multiple tests for the same player
   - Historical test comparison and development tracking
   - Performance trend analysis and prediction
2. Club-specific AI simulation
   - AI models for each club's playing style and requirements
   - Automated coaching advice based on player performance
   - Club-specific player development recommendations
   - Strategic fit analysis for clubs
3. Advanced analytics dashboard


## References
1. Next.js Documentation
2. Supabase Documentation
3. NextAuth.js Documentation
4. DeepSeek API Documentation
5. Tailwind CSS Documentation

## Environment Setup

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_URL=your_production_url
NEXTAUTH_SECRET=your_nextauth_secret
```

### Database Configuration
- Supabase project must be properly configured
- All tables and relationships must be set up
- Security rules must be properly configured
- Regular backups must be scheduled

## Security Considerations

### Authentication
- All API endpoints require proper authentication
- Password hashing is implemented using bcrypt
- Role-based access control is implemented



## Performance Optimization

### Build Optimization
- Images are optimized using Next.js Image component
- Code splitting is implemented
- Proper caching headers are set
- Static page generation where possible

### Database Optimization
- Indexes are created for frequently queried fields
- Query optimization is implemented
- Connection pooling is configured
- Regular database maintenance is scheduled



## User Roles and Permissions

### Admin
- Full system access
- User management
- Content management
- System configuration

### Club
- Trainee management
- Application review
- Test result viewing
- Profile management

### Scouter
- Trainee evaluation and assessment
- Test session management
- Performance data entry
- Limited profile management
- Test administration
- Result submission and verification

### Trainee
- Profile management
- Test participation
- Application submission
- Result viewing

## Deployment Checklist

### Pre-deployment
- [ ] All environment variables are set
- [ ] Database is properly configured
- [ ] Security rules are reviewed
- [ ] Performance optimizations are in place
- [ ] All tests are passing
- [ ] Documentation is updated
- [ ] Test session management is configured

### Post-deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all user roles
- [ ] Test critical workflows
- [ ] Verify backup systems
- [ ] Update monitoring tools
- [ ] Validate scouter access and features
- [ ] Test evaluation workflows



## Contact Information

### Development Team
- Team Name: SMT
- Project Name: saql
- Support Email: smt4business@gmail.com
