
import { createClient } from "@supabase/supabase-js";
import { SYSTEM_IDS } from "../src/lib/ids";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Starting fix for SYSTEM_IDS...");
    const systemValues = Object.entries(SYSTEM_IDS);

    // Attempt inserting into 'missions'
    console.log("Attempting to insert into 'missions'...");
    for (const [key, uuid] of systemValues) {
        const { error } = await supabase.from('missions').upsert({
            id: uuid,
            title: `System Event: ${key}`,
            description: "Automatically generated system event",
            xp_reward: 0,
            is_system: true // Assuming is_system might exist, if not it will error but hopefully partial success
        }, { onConflict: 'id' });

        if (error) {
            console.log(`Failed to insert into missions for ${key} (${uuid}): ${error.message}`);
            // Try simpler insert
            const { error: err2 } = await supabase.from('missions').upsert({
                id: uuid,
                title: `System Event: ${key}`
            }, { onConflict: 'id' });
            if (err2) console.log(`Retry missions failed: ${err2.message}`);
        } else {
            console.log(`Success inserting ${key} into missions.`);
        }
    }

    // Attempt inserting into 'scenarios' just in case
    console.log("Attempting to insert into 'scenarios'...");
    for (const [key, uuid] of systemValues) {
        // Scenarios usually need more fields.
        const { error } = await supabase.from('scenarios').upsert({
            id: uuid,
            title: `System Event: ${key}`,
            context: "System Generated",
            chapter: 0,
            tags: [],
            choices: [] // Might be needed too
        }, { onConflict: 'id' });

        if (error) {
            console.log(`Failed to insert into scenarios for ${key} (${uuid}): ${error.message}`);
        } else {
            console.log(`Success inserting ${key} into scenarios.`);
        }
    }
}

fix();
