-- 美甲设计表
CREATE TABLE nail_designs (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    user_uuid VARCHAR(255),
    prompt TEXT NOT NULL,
    full_prompt TEXT,
    image_url VARCHAR(255),
    width INTEGER DEFAULT 1792,
    height INTEGER DEFAULT 1024,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'success'
);

-- 用户使用限制表
CREATE TABLE user_usage_limits (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) UNIQUE NOT NULL,
    daily_usage INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 5,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
); 