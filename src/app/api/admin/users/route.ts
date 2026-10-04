import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We MUST use the service_role key to bypass RLS and fetch all users from Auth API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}
