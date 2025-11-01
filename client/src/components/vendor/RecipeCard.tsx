import React from "react";
import { formatDate } from "@/lib/formatters";

export function RecipeCard({ recipe }: { recipe: any }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-sm font-medium">{recipe.name}</p>
      <p className="text-xs text-gray-500 mt-1">
        Last updated: {recipe.updatedAt ? formatDate(recipe.updatedAt) : "N/A"}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {recipe.ingredients?.length || 0} ingredients • version {recipe.version || 1}
      </p>
    </div>
  );
}

