import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadLogo() {
    const filePath = 'c:\\Users\\fabia\\Desktop\\Personal\\personal\\work\\XIXIM\\System\\crm-for-business-clusters\\public\\logocluster.png'
    const fileBuffer = fs.readFileSync(filePath)
    const fileName = 'logocluster.png'

    const { data, error } = await supabase.storage
        .from('announcements')
        .upload(fileName, fileBuffer, {
            contentType: 'image/png',
            upsert: true
        })

    if (error) {
        console.error('Upload Error Message:', error.message)
        console.error('Upload Error Details:', JSON.stringify(error, null, 2))
        return
    }

    const { data: publicData } = supabase.storage
        .from('announcements')
        .getPublicUrl(fileName)

    console.log('PUBLIC_URL=' + publicData.publicUrl)
}

uploadLogo()
