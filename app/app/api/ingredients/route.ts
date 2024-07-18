import { RecipeIngredientType, RecipeType } from "@/lib/fetch";
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const locationId = parseInt(
    process.env.LOCATION_ID ? process.env.LOCATION_ID : "",
  );

  try {
    // Get recipe_ids from menus table
    const menus = await prisma.menus.findMany({
      where: { location_id: locationId },
      select: { recipe_id: true },
    });

    const recipeIds = menus.map(
      (menu: { recipe_id: number }) => menu.recipe_id,
    );

    // Get ingredients and quantities from recipes table
    const recipes = await prisma.recipes.findMany({
      where: { id: { in: recipeIds } },
      select: { id: true, name: true, data: true },
    });

    // Flatten the data to get all ingredient IDs
    const ingredientIds = recipes.flatMap((recipe: any) =>
      recipe.data.map((item: { ingredient_id: number }) => item.ingredient_id),
    );

    // Get ingredients from ingredients table
    const ingredients = await prisma.ingredients.findMany({
      where: { ingredient_id: { in: ingredientIds } },
      select: { ingredient_id: true, name: true, amount: true, unit: true },
      orderBy: { name: "asc" },
    });

    return new Response(JSON.stringify(ingredients));
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Internal server error ${error}` }),
    );
  }
}

export async function POST(request: NextRequest) {
  const ingredients = await request.json();

  if (!Array.isArray(ingredients)) {
    return NextResponse.json(
      { error: "Invalid input, expected an array of ingredients" },
      { status: 400 },
    );
  }

  try {
    // Iterate over the ingredients and update each one
    for (const ingredient of ingredients) {
      const { ingredient_id, name, unit, amount } = ingredient;

      await prisma.ingredients.update({
        where: { ingredient_id },
        data: { name, unit, amount },
      });
    }

    return NextResponse.json(
      { message: "Ingredients updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating ingredients:", error);
    return NextResponse.json(
      { error: "An error occurred while updating ingredients" },
      { status: 500 },
    );
  }
}
