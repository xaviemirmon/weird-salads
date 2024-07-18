"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useFetchIngredients } from "@/hooks/useFetchIngredients";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchPostDeliveryData,
  fetchPostIngredientsData,
  FetchPostResponseType,
  IngredientsType,
} from "@/lib/fetch";
import { useRouter } from "next/navigation";

export default function IngredientsTable({
  title,
  desc,
  update = false,
}: {
  title: string;
  desc: string;
  update?: boolean;
}) {
  const { data, loading, setRefresh } = useFetchIngredients();
  const tempstore = useRef<IngredientsType>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      tempstore.current = data;
    }
  }, [loading]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const targetIngredientId = parseInt(event.target.id);
    const newAmount = parseInt(event.target.value ? event.target.value : "0");

    // Use find to locate the object with the matching ingredient_id
    if (tempstore.current) {
      let targetIngredient = tempstore.current.find(
        (ingredient) => ingredient.ingredient_id === targetIngredientId,
      );

      // Update the amount for the found object
      if (targetIngredient) {
        if (!update) {
          targetIngredient.amount = newAmount;
        } else {
          if (data) {
            const currentIngredient = data.find(
              (ingredient) => ingredient.ingredient_id === targetIngredientId,
            );
            if (currentIngredient?.amount) {
              if (typeof currentIngredient.amount === "string") {
                targetIngredient.amount =
                  newAmount + parseInt(currentIngredient.amount, 10);
              } else {
                targetIngredient.amount = newAmount + currentIngredient.amount;
              }
            }
          }
        }
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const response: FetchPostResponseType = await fetchPostIngredientsData(
      JSON.stringify(tempstore.current),
    );
    if (response?.data?.error) {
      toast(response?.data?.error);
    }
    if (response?.data?.message && !update) {
      if (response.data.message) {
        toast(response.data.message);
      }
      router.refresh();
    }

    if (response?.data?.message && update) {
      const delivery: FetchPostResponseType = await fetchPostDeliveryData(
        JSON.stringify(tempstore.current),
      );
      if (delivery?.data?.error) {
        toast(delivery.data.error);
      }
      toast(delivery?.data?.message);
      router.push("/stock");
    }
    setRefresh((prev) => !prev);
    setIsSubmitting(false);
  };

  if (loading || isSubmitting)
    return (
      <main>
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
      </main>
    );

  if (data)
    return (
      <main>
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((ingredient) => (
                    <TableRow key={ingredient.ingredient_id}>
                      <TableCell>
                        <div className="font-medium">{ingredient.name}</div>
                      </TableCell>
                      <TableCell className="text-right flex justify-end items-center">
                        <Input
                          id={`${ingredient.ingredient_id}`}
                          type="number"
                          defaultValue={
                            ingredient.amount && !update ? ingredient.amount : 0
                          }
                          className="w-20"
                          onChange={handleChange}
                        />
                        &nbsp;
                        <div className="w-20 text-center">
                          {ingredient.unit}s
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    );
}
