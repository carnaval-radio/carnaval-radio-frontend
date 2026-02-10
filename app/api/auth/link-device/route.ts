import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/GlobalState/Songs/supabase_client";

// Disable static optimization for this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const deviceId = body?.device_id as string;
    if (!deviceId) {
      return NextResponse.json(
        { error: "device_id is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Link the device to the user account
    const { data, error } = await supabase
      .from("device_profiles")
      .upsert(
        {
          device_id: deviceId,
          user_email: session.user.email,
        },
        {
          onConflict: "device_id",
        }
      )
      .select();

    if (error) {
      console.error("Error linking device:", error);
      return NextResponse.json(
        { error: "Failed to link device" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in link-device endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
