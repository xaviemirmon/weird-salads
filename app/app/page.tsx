"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { useFetchMenu } from "@/hooks/useFetchMenu";
import { fetchPostOrderData, FetchPostResponseType } from "@/lib/fetch";
import { cn } from "@/lib/utils";
import { MouseEvent, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { data, loading, setRefresh } = useFetchMenu();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    setIsSubmitting(true);
    const button = event.target as HTMLButtonElement;
    const response:FetchPostResponseType = await fetchPostOrderData(
      JSON.stringify({ recipe_id: parseInt(button.id) }),
    );

    if (response?.data?.message) {
      toast(response.data.message);
    }
    if (response?.data?.error) {
      toast(response.data.error);
    }
    setRefresh((prev) => !prev);
  };
  return (
    <main>
      {loading && (
        <div className="h-screen w-full flex justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin")}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      )}

      {data && (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {data.map((menuItem) => (
              <Card key={menuItem.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-2xl font-bold m-auto">
                  <h2>{menuItem.name}</h2>
                </CardHeader>
                <CardContent className="m-auto">
                  <p>Price: ${menuItem.price}</p>
                  {menuItem.allergens && <p>Contains allergens</p>}
                </CardContent>

                {!menuItem.outOfStock && (
                  <CardFooter>
                    <Button
                      id={`${menuItem.recipe_id}`}
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      asChild
                      size="sm"
                      className="m-auto bg-green-500"
                    >
                      <span>Order</span>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
