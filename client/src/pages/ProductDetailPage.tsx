import { Link, useRoute } from "wouter";
import { useProduct, useProducts } from "../hooks/api";
import { ProductCard } from "../components/ProductCard";

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:productId");
  const productId = params?.productId ?? "";

  if (!productId) return <div>Missing product id.</div>;

  const { data: product, isLoading, error } = useProduct(productId);
  const { data: recs } = useProducts({ limit: 4 });

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Couldn't load product.</div>;
  if (!product) return <div>Not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left: Image Gallery */}
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Right: Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <Link 
              href={`/vendors/${product.vendorId}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              View Vendor Store
            </Link>
          </div>
          
          <div className="text-4xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <button
            onClick={() => {
              // TODO: Implement add to cart
              console.log('Add to cart:', product.id);
            }}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>
      
      {/* Related Products */}
      {recs?.data && recs.data.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recs.data
              .filter(p => p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  title={relatedProduct.title}
                  price={relatedProduct.price}
                  imageUrl={relatedProduct.imageUrl}
                  tags={relatedProduct.tags}
                  availability={relatedProduct.availability}
                  onAdd={() => {
                    // TODO: Implement add to cart
                    console.log('Add to cart:', relatedProduct.id);
                    }}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
