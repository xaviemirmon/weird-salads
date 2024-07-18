import {
  fetchIngredientsData,
  fetchDataFn,
  IngredientsType,
} from "@/lib/fetch";
import { useEffect, useState } from "react";

export function useFetchIngredients() {
  const [data, setData] = useState<IngredientsType>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDataFn<IngredientsType>(
      fetchIngredientsData<IngredientsType>(),
      setData,
      setLoading,
      setError,
    );
  }, [refresh]);
  return { data, loading, error, setRefresh };
}
