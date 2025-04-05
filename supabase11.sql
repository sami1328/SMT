-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trainees table
CREATE TABLE trainees (
    tid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- Trainee ID
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    phone TEXT NOT NULL,
    preferred_position TEXT NOT NULL,
    status TEXT DEFAULT 'Pending Test',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() 
);

-- Create clubs table
CREATE TABLE clubs (
    cid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- Club ID
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    location TEXT,
    phone TEXT,
    contact_person TEXT,
    logo_url TEXT,         -- Optional: link to the club's logo in storage
    description TEXT,      -- Optional: club bio/summary
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scouters table
CREATE TABLE scouters (
    sid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- Scouter ID
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    password TEXT NOT NULL
);

-- Create test_results table
CREATE TABLE test_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tid UUID REFERENCES trainees(tid) NOT NULL,  -- Trainee reference
    submitted_by UUID REFERENCES scouters(sid) NOT NULL,  -- Scouter reference
    acceleration INTEGER CHECK (acceleration BETWEEN 1 AND 99),
    agility INTEGER CHECK (agility BETWEEN 1 AND 99),
    balance INTEGER CHECK (balance BETWEEN 1 AND 99),
    jumping INTEGER CHECK (jumping BETWEEN 1 AND 99),
    reactions INTEGER CHECK (reactions BETWEEN 1 AND 99),
    sprint_speed INTEGER CHECK (sprint_speed BETWEEN 1 AND 99),
    stamina INTEGER CHECK (stamina BETWEEN 1 AND 99),
    strength INTEGER CHECK (strength BETWEEN 1 AND 99),
    aggression INTEGER CHECK (aggression BETWEEN 1 AND 99),
    att_position INTEGER CHECK (att_position BETWEEN 1 AND 99),
    composure INTEGER CHECK (composure BETWEEN 1 AND 99),
    interceptions INTEGER CHECK (interceptions BETWEEN 1 AND 99),
    vision INTEGER CHECK (vision BETWEEN 1 AND 99),
    ball_control INTEGER CHECK (ball_control BETWEEN 1 AND 99),
    crossing INTEGER CHECK (crossing BETWEEN 1 AND 99),
    curve INTEGER CHECK (curve BETWEEN 1 AND 99),
    defensive_awareness INTEGER CHECK (defensive_awareness BETWEEN 1 AND 99),
    dribbling INTEGER CHECK (dribbling BETWEEN 1 AND 99),
    fk_accuracy INTEGER CHECK (fk_accuracy BETWEEN 1 AND 99),
    finishing INTEGER CHECK (finishing BETWEEN 1 AND 99),
    heading_accuracy INTEGER CHECK (heading_accuracy BETWEEN 1 AND 99),
    long_passing INTEGER CHECK (long_passing BETWEEN 1 AND 99),
    long_shots INTEGER CHECK (long_shots BETWEEN 1 AND 99),
    penalties INTEGER CHECK (penalties BETWEEN 1 AND 99),
    short_passing INTEGER CHECK (short_passing BETWEEN 1 AND 99),
    shot_power INTEGER CHECK (shot_power BETWEEN 1 AND 99),
    sliding_tackle INTEGER CHECK (sliding_tackle BETWEEN 1 AND 99),
    standing_tackle INTEGER CHECK (standing_tackle BETWEEN 1 AND 99),
    volleys INTEGER CHECK (volleys BETWEEN 1 AND 99),
    gk_diving INTEGER CHECK (gk_diving BETWEEN 1 AND 99),
    gk_handling INTEGER CHECK (gk_handling BETWEEN 1 AND 99),
    gk_kicking INTEGER CHECK (gk_kicking BETWEEN 1 AND 99),
    gk_positioning INTEGER CHECK (gk_positioning BETWEEN 1 AND 99),
    gk_reflexes INTEGER CHECK (gk_reflexes BETWEEN 1 AND 99),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create club_applications table
CREATE TABLE club_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trainee_uid UUID NOT NULL REFERENCES trainees(tid) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(cid) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    feedback TEXT,
    notes TEXT,
    UNIQUE(trainee_uid, club_id) -- Prevent duplicate applications
);

-- Create index for faster queries
CREATE INDEX idx_club_applications_club_id ON club_applications(club_id);
CREATE INDEX idx_club_applications_trainee_uid ON club_applications(trainee_uid);
CREATE INDEX idx_club_applications_status ON club_applications(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_club_applications_updated_at
    BEFORE UPDATE ON club_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE club_applications ENABLE ROW LEVEL SECURITY;

-- Allow trainees to view their own applications
CREATE POLICY "Trainees can view their own applications"
    ON club_applications FOR SELECT
    USING (auth.uid() = trainee_uid);

-- Allow trainees to create applications
CREATE POLICY "Trainees can create applications"
    ON club_applications FOR INSERT
    WITH CHECK (auth.uid() = trainee_uid);

-- Allow clubs to view applications for their club
CREATE POLICY "Clubs can view their applications"
    ON club_applications FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.cid = club_applications.club_id
        AND clubs.cid = auth.uid()
    ));

-- Allow clubs to update application status
CREATE POLICY "Clubs can update application status"
    ON club_applications FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.cid = club_applications.club_id
        AND clubs.cid = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.cid = club_applications.club_id
        AND clubs.cid = auth.uid()
    ));

-- Add check constraint to ensure trainee has completed test
CREATE OR REPLACE FUNCTION check_trainee_test_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM trainees
        WHERE tid = NEW.trainee_uid
        AND status = 'Test Completed'
    ) THEN
        RAISE EXCEPTION 'Trainee must complete test before applying to clubs';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_trainee_test_completed
    BEFORE INSERT ON club_applications
    FOR EACH ROW
    EXECUTE FUNCTION check_trainee_test_completed();

-- Add comment to table
COMMENT ON TABLE club_applications IS 'Stores club applications from trainees, including status and feedback';


CREATE OR REPLACE FUNCTION check_final_club_selection()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if trainee has already selected a final club
  IF EXISTS (
    SELECT 1 FROM trainees 
    WHERE tid = NEW.trainee_uid 
    AND final_club_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Cannot apply to clubs after selecting a final club';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent applications after final club selection
CREATE TRIGGER prevent_applications_after_final_club
BEFORE INSERT ON club_applications
FOR EACH ROW
EXECUTE FUNCTION check_final_club_selection();

-- Add RLS policy to enforce this at the database level
   ALTER TABLE trainees
   ADD COLUMN final_club_id UUID REFERENCES clubs(cid);

-- Create position_results table
CREATE TABLE position_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- Unique identifier for each result
    tid UUID REFERENCES trainees(tid) NOT NULL,      -- Reference to the trainee
    st INTEGER,                                       -- Score for Striker position
    lw INTEGER,                                       -- Score for Left Winger position
    rw INTEGER,                                       -- Score for Right Winger position
    cam INTEGER,                                      -- Score for Central Attacking Midfielder position
    cm INTEGER,                                       -- Score for Central Midfielder position
    cdm INTEGER,                                      -- Score for Central Defensive Midfielder position
    lm INTEGER,                                       -- Score for Left Midfielder position
    rm INTEGER,                                       -- Score for Right Midfielder position
    lb INTEGER,                                       -- Score for Left Back position
    rb INTEGER,                                       -- Score for Right Back position
    cb INTEGER,                                       -- Score for Center Back position
    gk INTEGER,                                       -- Score for Goalkeeper position
    best_position TEXT,                               -- Best position based on scores
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),  -- Timestamp for when the result was created
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),  -- Timestamp for when the result was last updated
    notes TEXT                                       -- Additional notes
);

CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE admins (
    aid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    password text NOT NULL
);

-- Insert test users for each role (admin, club, scouter)
-- Each role will have 3 users with different credentials
-- Passwords are hashed using bcrypt
-- admin1@saql.com / Admin123! = $2b$10$h/.QxrVZp4o979e6DJZp8OfCB4N0uRDGolYy4QljAGPtl2FuZjr7m

-- Test Admins
INSERT INTO admins (email, password, name) VALUES
('admin1@saql.com', '$2b$10$h/.QxrVZp4o979e6DJZp8OfCB4N0uRDGolYy4QljAGPtl2FuZjr7m', 'Admin One'),
('admin2@saql.com', '$2b$10$h/.QxrVZp4o979e6DJZp8OfCB4N0uRDGolYy4QljAGPtl2FuZjr7m', 'Admin Two'),
('admin3@saql.com', '$2b$10$h/.QxrVZp4o979e6DJZp8OfCB4N0uRDGolYy4QljAGPtl2FuZjr7m', 'Admin Three');

-- Test Clubs
-- club1@saql.com / Club123! = $2a$10$6KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO
-- club2@saql.com / Club456! = $2a$10$5KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO
-- club3@saql.com / Club789! = $2a$10$4KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO

INSERT INTO clubs (email, password, name) VALUES
('club1@saql.com', '$2a$10$6KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO', 'Al Hilal FC'),
('club2@saql.com', '$2a$10$5KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO', 'Al Nassr FC'),
('club3@saql.com', '$2a$10$4KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO', 'Al Ittihad FC');

-- Test Scouters
-- scouter1@saql.com / Scout123! = $2a$10$3KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO
-- scouter2@saql.com / Scout456! = $2a$10$2KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO
-- scouter3@saql.com / Scout789! = $2a$10$1KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO

INSERT INTO scouters (email, password, name) VALUES
('scouter1@saql.com', '$2a$10$3KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO', 'Scouter One'),
('scouter2@saql.com', '$2a$10$2KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO', 'Scouter Two'),
('scouter3@saql.com', '$2a$10$1KzqY5cBe1jQPDYZJx5U.gJHgGHhTQJfDRhVtxRyXGFpU/0XiKAO', 'Scouter Three');