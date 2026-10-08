import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // We use the service key to bypass RLS for admin dashboard
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch unique chapters
    const { data, error } = await supabaseAdmin
      .from('chunks')
      .select('subject, class, chapter');

    if (error) {
      throw error;
    }

    // Group the data
    const grouped: any = {};
    data.forEach((row: any) => {
      if (!row.chapter) return;
      
      const key = `${row.class}_${row.subject}_${row.chapter}`;
      if (!grouped[key]) {
        grouped[key] = {
          class: row.class,
          subject: row.subject,
          chapter: row.chapter,
          chunkCount: 1
        };
      } else {
        grouped[key].chunkCount += 1;
      }
    });

    return NextResponse.json({ 
      success: true, 
      curriculum: Object.values(grouped) 
    });
    
  } catch (error: any) {
    console.error("Failed to fetch curriculum:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
