// Load environment variables FIRST using require (before ES6 imports)
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Debug: Check if environment variables are available
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✅ Set" : "❌ Not set");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Not set");

// Use dynamic import to ensure environment variables are loaded first
async function runScript() {
  try {
    // Import after environment variables are loaded
    const { updateSongs } = await import("../GlobalState/ApiCalls/updateSongs");
    
    // Run the update songs function
    const result = await updateSongs();
    console.log("🎉 Song update completed successfully!", result);
    process.exit(0);
  } catch (error: any) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }
}

// Start the script
runScript();