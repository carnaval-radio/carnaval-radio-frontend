import { updateSongs } from "@/GlobalState/ApiCalls/updateSongs";
import { NextResponse } from "next/server";

// This endpoint is called by GitHub Actions to update the song cache
export async function POST() {
  try {
    await updateSongs();
    
    return NextResponse.json({ 
      success: true, 
      message: "Songs updated successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Failed to update songs:", error);
    return NextResponse.json({ 
      error: "Failed to update songs", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}