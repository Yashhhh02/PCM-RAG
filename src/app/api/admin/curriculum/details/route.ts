import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { subject, className, chapter } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch chunks for this specific folder
    const { data, error } = await supabaseAdmin
      .from('chunks')
      .select('id, page_content, metadata')
      .eq('subject', subject)
      .eq('class', className)
      .eq('chapter', chapter);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      chunks: data 
    });
    
  } catch (error: any) {
    console.error("Failed to fetch folder details:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
