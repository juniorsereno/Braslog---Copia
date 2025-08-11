module.exports = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/braslog_test',
    NODE_ENV: process.env.NODE_ENV || 'test',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon',
  }
};

