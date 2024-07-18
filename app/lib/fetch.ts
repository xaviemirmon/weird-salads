import { Dispatch, SetStateAction } from "react";

export type MenuType = {
  name: string;
  price: number;
  recipe_id: number;
  allergens: boolean;
  modifiers: number;
  outOfStock: boolean;
}[];

export type RecipeIngredientType = {
  quantity: number;
  ingredient_id: number;
};

export type RecipeType = {
  id: number;
  name: string;
  data: RecipeIngredientType[];
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
    error?: string;
  };
};

export const fetchPostDeliveryData = async <T>(data: any) => {
  return fetchData<T>(`delivery`, "POST", data);
};

export const fetchPostIngredientsData = async <T>(data: any) => {
  return fetchData<T>(`ingredients`, "POST", data);
};

export const fetchPostOrderData = async <T>(data: any) => {
  return fetchData<T>(`order`, "POST", data);
};

export const fetchIngredientsData = async <T>() => {
  return fetchData<T>(`ingredients`);
};

export const fetchMenuData = async <T>() => {
  return fetchData<T>(`menu`);
};

export const fetchDataFn = async <T>(
  fetchFn: Promise<
    | { data: T; error: { message?: undefined } }
    | { data: {}; error: Error }
    | { data: {}; error: { message: string } }
  >,
  setData: Dispatch<SetStateAction<any>>,
  setLoading: Dispatch<SetStateAction<any>>,
  setError: Dispatch<SetStateAction<any>>,
) => {
  const { data, error } = await fetchFn;

  if (data !== null && typeof data === "object") {
    setData(data as T);
  } else {
    setError(error.message);
  }

  setLoading(false);
};

export const fetchData = async <T>(
  endpoint: string,
  method = "GET",
  body?: any,
) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`;
    const response = await fetch(url, {
      method: method,
      body: body,
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data: T = await response.json();

    return { data: data, error: {} };
  } catch (error) {
    if (error instanceof Error) {
      return { data: {}, error: error };
    } else {
      return { data: {}, error: { message: "An unexpected error occurred" } };
    }
  }
};
