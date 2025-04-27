// components/complaints/ProductSelection.tsx


import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getProductsByService } from '@/actions/products/get-by-service';
import { Product } from '@prisma/client';

interface ProductSelectionProps {
  serviceId: string;
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
  disabled?: boolean;
}

export function ProductSelection({
  serviceId,
  selectedProductId,
  onProductSelect,
  disabled = false
}: ProductSelectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!serviceId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getProductsByService(serviceId);
        if (result.error) {
          setError(result.error);
          setProducts([]);
        } else {
          setProducts(result.products || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [serviceId]);

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <Select 
      value={selectedProductId} 
      onValueChange={onProductSelect}
      disabled={disabled || products.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={products.length === 0 ? "No products available" : "Select a product"} />
      </SelectTrigger>
      <SelectContent>
        {products.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.name} {product.code && `(${product.code})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}