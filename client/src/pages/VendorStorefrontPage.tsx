import { Link, useRoute } from "wouter";
import { useVendor, useVendorProducts } from "../hooks/api";

export default function VendorStorefrontPage() {
  const [, params] = useRoute("/vendors/:vendorId");
  const vendorId = params?.vendorId ?? "";

  if (!vendorId) return <div>Missing vendor id.</div>;

  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useVendor(vendorId);
  const { data: list, isLoading: productsLoading, error: productsError } = useVendorProducts(vendorId);

  const isLoading = vendorLoading || productsLoading;
  const error = vendorError || productsError;

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error loading vendor.</div>;
  if (!vendor) return <div>Not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold">{vendor.name}</h1>
      <p className="text-sm text-gray-600">{vendor.city}, {vendor.state}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {list?.data?.map((p: any) => (
          <Link key={p.id} href={`/product/${p.id}`}>
            <a><ProductCard {...p} /></a>
          </Link>
        ))}
      </div>
    </div>
  );
}
