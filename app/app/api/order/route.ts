import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const { recipe_id } = await request.json();
  const locationId = parseInt(
    process.env.LOCATION_ID ? process.env.LOCATION_ID : "",
  );

  try {
    // Get ingredients and quantities from recipes table
    const recipe = await prisma.recipes.findUnique({
      where: {
        id: recipe_id,
      },
    });

    const recipeCost = await prisma.menus.findFirst({
      where: {
        recipe_id: recipe_id,
        location_id: locationId,
      },
      select: {
        price: true,
      },
    });

    if (recipe && Array.isArray(recipe.data)) {
      for (const item of recipe.data) {
        if (
          typeof item === "object" &&
          item !== null &&
          "ingredient_id" in item &&
          "quantity" in item
        ) {
          const { ingredient_id, quantity } = item;

          // Fetch the current amount of the ingredient
          const ingredient = await prisma.ingredients.findUnique({
            where: {
              ingredient_id: ingredient_id as number,
            },
          });

          if (
            ingredient &&
            typeof ingredient.amount === "number" &&
            typeof quantity === "number"
          ) {
            // Calculate the new amount
            const newAmount = ingredient.amount - quantity;

            // Update the ingredient with the new amount
            await prisma.ingredients.update({
              where: {
                ingredient_id: ingredient_id as number,
              },
              data: {
                amount: newAmount.toFixed(2),
              },
            });
          }
        }
      }
    }
    let order;
    if (recipeCost && recipeCost.price !== null) {
      order = await prisma.orders.create({
        data: {
          amount: recipeCost.price,
        },
      });
    }

    return new Response(
      JSON.stringify({ message: `Ordered! #${order && order.id}` }),
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Internal server error ${error}` }),
    );
  }
}
