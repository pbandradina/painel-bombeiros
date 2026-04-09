import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Connection', () => {
  it('should connect to Supabase with service role key', async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseServiceRoleKey).toBeDefined();

    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    // Test connection by querying the bombeiros table
    const { data, error } = await supabase
      .from('bombeiros')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should have correct environment variables', () => {
    expect(process.env.VITE_SUPABASE_URL).toBe('https://gntlcxaoxtzukaizoxoi.supabase.co');
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
  });
});
