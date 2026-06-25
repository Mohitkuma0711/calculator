CREATE TABLE IF NOT EXISTS voice_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    transcript TEXT,
    duration_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voice_posts_user_id ON voice_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_posts_created_at ON voice_posts(created_at DESC);
