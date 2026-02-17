// scripts/seed-scenarios.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const data = JSON.parse(readFileSync(new URL("../seeds/seed_scenarios_40.json", import.meta.url), "utf8"));

for (const s of data) {
  const { error } = await supabase.from("scenarios").insert({
    chapter: s.chapter,
    title: s.title,
    context: s.context,
    tags: s.tags,
    choices: s.choices,
    is_published: true
  });
  if (error) {
    console.error("Insert failed:", s.title, error.message);
    process.exit(1);
  }
}

console.log("✅ Inserted", data.length, "scenarios");
