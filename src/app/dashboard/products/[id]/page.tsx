import { Suspense } from "react";
import { productService } from "@/lib/services/product-service";
import ProductClient from "./client";
import { ProductResponse } from "@/lib/types/product";

export const dynamic = "force-dynamic";

interface PageParams {
  id: string;
}

interface PageProps {
  params: PageParams;
}

async function getProduct(id: string): Promise<ProductResponse> {
  try {
    return await productService.getProductById(id);
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

export default async function ProductView({ params }: PageProps) {
  const product = await getProduct(params.id);

  return (
    <Suspense fallback={<div>Loading product details...</div>}>
      <ProductClient product={product} id={params.id} />
    </Suspense>
  );
}
