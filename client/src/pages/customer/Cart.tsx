import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "../../lib/api/customer";
import { formatCurrency } from "../../lib/formatters";

export default function Cart() {
  const { data: cart } = useQuery({
    queryKey: ["customer", "cart"],
    queryFn: getCart,
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Your Cart</h1>
      {cart?.items?.length ? (
        <div className="space-y-3">
          {cart.items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between bg-white border rounded-lg p-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-semibold">{formatCurrency(cart.total)}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      )}
    </div>
  );
}

