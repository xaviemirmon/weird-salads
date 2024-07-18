import {
  IngredientType,
  MenuType,
  RecipeIngredientType,
  RecipeType,
} from "@/lib/fetch";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET() {
  const locationId = parseInt(
    process.env.LOCATION_ID ? process.env.LOCATION_ID : "",
  );

  try {
    // Get recipe_ids from menus table
    const menus: MenuType = await prisma.menus.findMany({
      where: { location_id: locationId },
      select: { recipe_id: true, price: true, modifiers: true },
    });

    const recipeIds = menus.map((menu) => menu.recipe_id);

    // Get ingredients and quantities from recipes table
    const recipes = await prisma.recipes.findMany({
      where: { id: { in: recipeIds } },
      select: { id: true, name: true, data: true },
    });

    // Flatten the data to get all ingredient IDs
    const ingredientIds = recipes.flatMap((recipe: { data: any[] }) =>
      recipe.data.map((item: { ingredient_id: string }) => item.ingredient_id),
    );

    // Get ingredients from ingredients table
    const ingredients = await prisma.ingredients.findMany({
      where: { ingredient_id: { in: ingredientIds } },
      select: { ingredient_id: true, amount: true },
    });
    // Map ingredients to their amounts
    const ingredientMap = Object.fromEntries(
      ingredients.map((ingredient: IngredientType) => [
        ingredient.ingredient_id,
        ingredient.amount,
      ]),
    );

    // Map recipes to their details
    const recipeMap = Object.fromEntries(
      recipes.map((recipe: RecipeType) => [
        recipe.id,
        { name: recipe.name, ingredients: recipe.data },
      ]),
    );

    // Generate menu data
    const menuData = menus.map((menu) => {
      const recipeDetails = recipeMap[menu.recipe_id] || {};
      const recipeIngredients = recipeDetails.ingredients || [];
      const outOfStock = recipeIngredients.some(
        (recipeIngredient: RecipeIngredientType) => {
          const ingredientStock =
            ingredientMap[recipeIngredient.ingredient_id] || 0;
          return ingredientStock < recipeIngredient.quantity;
        },
      );

      return {
        name: recipeDetails.name,
        price: menu.price ? menu.price.toFixed(2) : null,
        recipe_id: menu.recipe_id,
        allergens: menu.modifiers === 2,
        outOfStock: outOfStock,
      };
    });

    return new Response(JSON.stringify(menuData));
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Internal server error ${error}` }),
    );
  }
}
