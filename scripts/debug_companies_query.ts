

import { createClient } from "@supabase/supabase-js"
import * as fs from 'fs';
import * as path from 'path';

// Manual .env parser since dotenv might not be available
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars = envFile.split('\n');
        for (const line of envVars) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    } catch (e) {
        console.log("Could not load .env.local", e);
    }
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!


if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQuery() {
    console.log("Testing companies query...")
    try {
        const { data: companies, error } = await supabase
            .from("companies")
            .select("*, organization:organizations(name)")
            .order("name")

        if (error) {
            console.error("Error fetching companies:", error)
        } else {
            console.log("Success! Found", companies.length, "companies")
            if (companies.length > 0) {
                console.log("First company:", companies[0])
            }
        }
    } catch (err) {
        console.error("Exception:", err)
    }
}

testQuery()
