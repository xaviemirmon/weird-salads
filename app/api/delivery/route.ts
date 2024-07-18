import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ingredients = await request.json();

  if (!Array.isArray(ingredients)) {
    return NextResponse.json(
      { error: "Invalid input, expected an array of ingredients" },
      { status: 400 },
    );
  }

  try {
    await prisma.deliveries.create({
      data: {
        ingredients: ingredients,
      },
    });
    return NextResponse.json(
      { message: "Delivery updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "An error occurred while updating delivery" },
      { status: 500 },
    );
  }
}
