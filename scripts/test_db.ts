import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('API KEY from env:', process.env.SENDGRID_API_KEY ? 'Present' : 'Missing');
    
    const { data: campaign } = await supabase
        .from('announcement_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
    console.log('\nLatest Campaign:');
    if (campaign) {
        console.log(`ID: ${campaign.id}, Status: ${campaign.status}, Sent: ${campaign.emails_sent}, Failed: ${campaign.emails_failed}`);
        
        const { data: recipients } = await supabase
            .from('announcement_recipients')
            .select('*')
            .eq('campaign_id', campaign.id);
            
        console.log('\nRecipients:');
        recipients?.forEach(r => {
            console.log(`- ${r.recipient_email}: ${r.email_status} (MsgID: ${r.sendgrid_message_id})`);
        });
    } else {
        console.log('No recent campaigns found.');
    }
}
main().catch(console.error);
