import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('Checking storage buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }
    
    console.log('Current buckets:', buckets.map(b => b.name));
    
    const announcementsBucket = buckets.find(b => b.name === 'announcements');
    if (!announcementsBucket) {
        console.log('Creating "announcements" bucket...');
        const { data, error: createError } = await supabase.storage.createBucket('announcements', {
            public: true,
            fileSizeLimit: 5242880, // 5MB limit
        });
        if (createError) {
            console.error('Error creating bucket:', createError);
        } else {
            console.log('Bucket "announcements" created successfully (Public).');
        }
    } else {
        console.log('Bucket "announcements" already exists.');
    }
}

checkStorage().catch(console.error);
