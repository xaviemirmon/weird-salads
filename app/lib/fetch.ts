export type MenuType = {
  name: string;
  price: number;
  recipe_id: number;
  allergens: boolean;
  modifiers: number;
  outOfStock: boolean;
}[];


export type RecipeIngredientType = {
    quantity: number
    ingredient_id: number
}

export type RecipeType = {
    id: number;
    name: string;
    data: RecipeIngredientType[]
  };

export type IngredientType = {
  ingredient_id: number;
  name: string;
  amount: number | null;
  unit: string;
};

export type IngredientsType = IngredientType[];

export type FetchPostResponseType = {
  data?: {
    message?: string;
    error?:  string;
  };
};

