/**
 * API Route: /api/settings/email
 * Handles fetching and updating email settings in the database.
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch email settings
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // Ensure templates field is included and initialized if missing
    const response = {
      ...settings,
      templates: settings.templates || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT: Update email settings
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const updatedSettings = await prisma.systemSettings.update({
      where: { id: 1 },
      data: {
        fromEmail: body.fromEmail,
        bccAdmin: body.bccAdmin,
        adminEmail: body.adminEmail,
        templates: body.templates, // Handle templates updates
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating email settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
