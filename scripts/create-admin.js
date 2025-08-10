import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghqivevrwfkmdmduyjzv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdocWl2ZXZyd2ZrbWRtZHV5anp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2MDA4NSwiZXhwIjoyMDY5MDM2MDg1fQ.Vr-F5qNrOOJhVNZUK-1hXrfV1qVLhVzUJRe5n0KPOCE'; // Need service role key

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Create the admin user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: '123@gmail.com',
      password: '123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Admin User'
      }
    });

    if (createError) {
      console.error('Error creating admin user:', createError);
      return;
    }

    console.log('Admin user created successfully:', user.user.id);
    console.log('Email:', user.user.email);
    console.log('Role:', user.user.user_metadata.role);

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();