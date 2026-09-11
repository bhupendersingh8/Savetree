-- SurviveFirst Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES
CREATE TYPE user_role AS ENUM ('PUBLIC', 'TREE_OWNER', 'STEWARD', 'VERIFIER', 'PROJECT_ADMIN', 'SUPER_ADMIN');

-- STATUSES
CREATE TYPE tree_status AS ENUM ('ALIVE', 'WEAK', 'DEAD', 'REPLACED', 'NOT_FOUND');
CREATE TYPE registration_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'NEEDS_CORRECTION', 'VERIFIED', 'REJECTED', 'ACTIVE');
CREATE TYPE risk_level AS ENUM ('GREEN', 'YELLOW', 'RED', 'CRITICAL');
CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFICATION_REQUIRED', 'VERIFIED', 'REJECTED', 'CANCELLED');

-- ORGANIZATIONS
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'PUBLIC'::user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    target_survival_rate INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLUSTERS
CREATE TABLE clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TREES
CREATE TABLE trees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id TEXT UNIQUE NOT NULL, -- e.g., SF-TEH-0001
    project_id UUID REFERENCES projects(id),
    cluster_id UUID REFERENCES clusters(id),
    owner_id UUID REFERENCES profiles(id),
    species TEXT NOT NULL,
    common_name TEXT,
    planting_date TIMESTAMPTZ DEFAULT NOW(),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    gps_accuracy DOUBLE PRECISION,
    water_availability TEXT,
    protection_status TEXT,
    grazing_risk BOOLEAN DEFAULT false,
    grass_cutting_risk BOOLEAN DEFAULT false,
    caretaker TEXT,
    notes TEXT,
    status tree_status DEFAULT 'ALIVE'::tree_status,
    registration_status registration_status DEFAULT 'PENDING_REVIEW'::registration_status,
    risk_level risk_level DEFAULT 'GREEN'::risk_level,
    risk_score INTEGER DEFAULT 0,
    original_tree_id UUID REFERENCES trees(id), -- For replacements
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHOTOS
CREATE TABLE tree_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES profiles(id),
    photo_url TEXT NOT NULL,
    photo_type TEXT, -- 'PLANTING', '30_DAY', 'INTERVENTION', etc.
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    verification_status TEXT DEFAULT 'PENDING'
);

-- TASKS
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES clusters(id),
    project_id UUID REFERENCES projects(id),
    assigned_to UUID REFERENCES profiles(id),
    status task_status DEFAULT 'PENDING'::task_status,
    priority INTEGER DEFAULT 2,
    cause TEXT,
    recommended_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ
);

-- ACTIVITY LOG
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL, -- 'REGISTERED', 'WATERED', 'VERIFIED'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_trees_project ON trees(project_id);
CREATE INDEX idx_trees_cluster ON trees(cluster_id);
CREATE INDEX idx_trees_owner ON trees(owner_id);
CREATE INDEX idx_trees_status ON trees(status);
CREATE INDEX idx_trees_registration ON trees(registration_status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);

-- RLS POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trees: Public can read, authenticated can insert, owner/org-admins can update
CREATE POLICY "Trees are viewable by org members" ON trees FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        JOIN projects pr ON pr.id = trees.project_id 
        WHERE p.id = auth.uid() 
        AND p.organization_id = pr.organization_id
    )
);
CREATE POLICY "Authenticated users can create trees" ON trees FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own trees or org admins" ON trees FOR UPDATE USING (
    auth.uid() = owner_id OR 
    EXISTS (
        SELECT 1 FROM profiles p 
        JOIN projects pr ON pr.id = trees.project_id 
        WHERE p.id = auth.uid() 
        AND p.organization_id = pr.organization_id
        AND p.role IN ('STEWARD', 'VERIFIER', 'PROJECT_ADMIN', 'SUPER_ADMIN')
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trees_modtime BEFORE UPDATE ON trees FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- EXTRA RLS POLICIES FOR MULTI-TENANT ISOLATION
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Clusters
CREATE POLICY "Users can read clusters in their org" ON clusters FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        JOIN projects pr ON pr.id = clusters.project_id 
        WHERE p.id = auth.uid() 
        AND p.organization_id = pr.organization_id
    )
);

-- Tasks
CREATE POLICY "Users can read tasks in their org" ON tasks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        JOIN projects pr ON pr.id = tasks.project_id 
        WHERE p.id = auth.uid() 
        AND p.organization_id = pr.organization_id
    )
);
CREATE POLICY "Users can insert tasks in their org" ON tasks FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles p 
        JOIN projects pr ON pr.id = project_id 
        WHERE p.id = auth.uid() 
        AND p.organization_id = pr.organization_id
    )
);
CREATE POLICY "Users can update tasks in their org" ON tasks FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        JOIN projects pr ON pr.id = tasks.project_id 
        WHERE p.id = auth.uid() 
        AND p.organization_id = pr.organization_id
    )
);

-- Tree Photos
CREATE POLICY "Users can read photos in their org" ON tree_photos FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM trees t
        JOIN projects pr ON pr.id = t.project_id
        JOIN profiles p ON p.organization_id = pr.organization_id
        WHERE t.id = tree_photos.tree_id AND p.id = auth.uid()
    )
);
CREATE POLICY "Users can insert photos in their org" ON tree_photos FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM trees t
        JOIN projects pr ON pr.id = t.project_id
        JOIN profiles p ON p.organization_id = pr.organization_id
        WHERE t.id = tree_id AND p.id = auth.uid()
    )
);

-- Activity Logs
CREATE POLICY "Users can read activity logs in their org" ON activity_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM trees t
        JOIN projects pr ON pr.id = t.project_id
        JOIN profiles p ON p.organization_id = pr.organization_id
        WHERE t.id = activity_logs.tree_id AND p.id = auth.uid()
    )
);
CREATE POLICY "Users can insert activity logs in their org" ON activity_logs FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM trees t
        JOIN projects pr ON pr.id = t.project_id
        JOIN profiles p ON p.organization_id = pr.organization_id
        WHERE t.id = tree_id AND p.id = auth.uid()
    )
);

-- SUPABASE STORAGE BUCKETS & RLS
INSERT INTO storage.buckets (id, name, public) VALUES ('tree_photos', 'tree_photos', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload tree photos to their org" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'tree_photos' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view tree photos in their org" ON storage.objects FOR SELECT USING (
    bucket_id = 'tree_photos' AND auth.uid() IS NOT NULL
);

-- PUBLIC TREE VIEW (Sanitized)
CREATE OR REPLACE VIEW public_trees AS
SELECT 
    public_id,
    species,
    common_name,
    planting_date,
    status,
    risk_level
FROM trees;
