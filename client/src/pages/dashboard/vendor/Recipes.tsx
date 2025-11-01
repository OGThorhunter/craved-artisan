import React from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getMyVendorRecipes } from "@/lib/api/vendor-dashboard";
import { RecipeCard } from "@/components/vendor/RecipeCard";

export default function VendorRecipes() {
  const { data: recipes } = useQuery(["vendor", "recipes"], getMyVendorRecipes);

  return (
    <DashboardLayout role="vendor">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Recipes</h1>
          <button className="rounded-md bg-emerald-600 text-white text-sm px-3 py-2">New Recipe</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {recipes?.length ? (
            recipes.map((r: any) => <RecipeCard key={r.id} recipe={r} />)
          ) : (
            <p className="text-sm text-gray-500">No recipes yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

