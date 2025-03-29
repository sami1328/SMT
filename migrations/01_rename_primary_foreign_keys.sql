-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Rename primary key in trainees table
ALTER TABLE trainees RENAME COLUMN uid TO tid;
ALTER TABLE trainees DROP CONSTRAINT IF EXISTS trainees_pkey;
ALTER TABLE trainees ADD PRIMARY KEY (tid);

-- Rename primary key in clubs table and add new fields
ALTER TABLE clubs RENAME COLUMN id TO cid;
ALTER TABLE clubs DROP CONSTRAINT IF EXISTS clubs_pkey;
ALTER TABLE clubs ADD PRIMARY KEY (cid);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS location VARCHAR(255) NOT NULL;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NOT NULL;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255) NOT NULL;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Rename primary key in scouters table
ALTER TABLE scouters RENAME COLUMN id TO sid;
ALTER TABLE scouters DROP CONSTRAINT IF EXISTS scouters_pkey;
ALTER TABLE scouters ADD PRIMARY KEY (sid);
ALTER TABLE scouters ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE scouters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Update foreign keys in test_results table
ALTER TABLE test_results RENAME COLUMN trainee_uid TO tid;
ALTER TABLE test_results DROP CONSTRAINT IF EXISTS test_results_trainee_uid_fkey;
ALTER TABLE test_results ADD CONSTRAINT test_results_tid_fkey 
  FOREIGN KEY (tid) REFERENCES trainees(tid) ON DELETE CASCADE;
ALTER TABLE test_results RENAME COLUMN submitted_by TO sid;
ALTER TABLE test_results DROP CONSTRAINT IF EXISTS test_results_submitted_by_fkey;
ALTER TABLE test_results ADD CONSTRAINT test_results_sid_fkey 
  FOREIGN KEY (sid) REFERENCES scouters(sid) ON DELETE SET NULL;

-- Update foreign keys in applications table
ALTER TABLE applications RENAME COLUMN trainee_uid TO tid;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_trainee_uid_fkey;
ALTER TABLE applications ADD CONSTRAINT applications_tid_fkey 
  FOREIGN KEY (tid) REFERENCES trainees(tid) ON DELETE CASCADE;
ALTER TABLE applications RENAME COLUMN club_id TO cid;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_club_id_fkey;
ALTER TABLE applications ADD CONSTRAINT applications_cid_fkey 
  FOREIGN KEY (cid) REFERENCES clubs(cid) ON DELETE CASCADE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify changes
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_name IN ('trainees', 'clubs', 'scouters', 'test_results', 'applications')
ORDER BY 
  table_name, 
  ordinal_position; 