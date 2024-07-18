import { fetchMenuData, fetchDataFn, MenuType } from "@/lib/fetch";
import { useEffect, useState } from "react";

export function useFetchMenu() {
  const [data, setData] = useState<MenuType>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refresh, setRefresh] = useState(false); // State to trigger re-fetch
  useEffect(() => {
    setLoading(true);
    fetchDataFn<MenuType>(
      fetchMenuData<MenuType>(),
      setData,
      setLoading,
      setError,
    );
  }, [refresh]);
  return { data, loading, error, setRefresh };
}
