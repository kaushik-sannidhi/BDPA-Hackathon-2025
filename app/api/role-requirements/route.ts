import { NextRequest, NextResponse } from "next/server";
import { getRoleRequirements } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { roleName } = await request.json();
    
    if (!roleName) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }
    
    const requirements = await getRoleRequirements(roleName);
    
    return NextResponse.json(requirements);
  } catch (error) {
    console.error("Error getting role requirements:", error);
    return NextResponse.json(
      { error: "Failed to get role requirements" },
      { status: 500 }
    );
  }
}

