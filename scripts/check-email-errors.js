const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uzliavlaicwnehnjvkuv.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGlhdmxhaWN3bmVobmp2a3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NzI4NzYsImV4cCI6MjA4NjQ0ODg3Nn0.kkEsPAJ4NAOBsW4DCJx-NE_phU4OvpccArsNJAtO4GM';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('announcement_recipients')
        .select('id, recipient_email, email_status, error_message, created_at')
        .eq('email_status', 'failed')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching data:', error);
    } else {
        console.log('Failed recipients:');
        console.log(JSON.stringify(data, null, 2));
    }
}

main();
