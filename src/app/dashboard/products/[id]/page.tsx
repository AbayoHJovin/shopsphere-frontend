import { Suspense } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Tag, 
  Palette, 
  Ruler, 
  Star,
  DollarSign,
  Users
} from "lucide-react";
import { mockProducts } from "@/data/mockData";
import ProductClient from './client';

export const dynamic = 'force-dynamic';

interface PageParams {
  id: string;
}

interface PageProps {
  params: PageParams;
}

export default function ProductView({ params }: PageProps) {
  const product = mockProducts.find(p => p.productId === params.id);
  
  return <ProductClient product={product} id={params.id} />;
} 