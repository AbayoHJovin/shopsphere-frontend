"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Eye, Edit, Percent, Plus, Filter, Search, Star } from 'lucide-react';
import { mockProducts, Product, mockDiscounts } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DiscountModal } from '@/components/DiscountModal';

export default function ProductsPage() {
  const router = useRouter();
  const [filterStock, setFilterStock] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterPopular, setFilterPopular] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Add state for discount modal
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  // Function to open discount modal
  const openDiscountModal = (productId: string) => {
    setSelectedProductId(productId);
    setDiscountModalOpen(true);
  };

  // Filter products
  const filteredProducts = mockProducts.filter(product => {
    // Search term filter
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Stock filter
    if (filterStock === 'in-stock' && product.stock <= 0) {
      return false;
    } else if (filterStock === 'out-of-stock' && product.stock > 0) {
      return false;
    }
    
    // Gender filter
    if (filterGender !== 'all' && product.gender !== filterGender) {
      return false;
    }
    
    // Popular filter
    if (filterPopular !== null && product.popular !== filterPopular) {
      return false;
    }
    
    return true;
  });
  
  // Calculate discount for a product
  const getProductDiscount = (productId: string) => {
    const currentDate = new Date();
    const activeDiscount = mockDiscounts.find(discount => 
      discount.productIds.includes(productId) &&
      discount.active &&
      currentDate >= discount.startDate &&
      currentDate <= discount.endDate
    );
    return activeDiscount ? activeDiscount.percentage : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Products</h1>
        <p className="text-muted-foreground mt-1">Manage your product inventory</p>
      </div>

      {/* Add Product Button */}
      <div className="flex justify-end">
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => router.push('/dashboard/products/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="bg-primary/5 py-3">
          <div className="flex items-center text-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters and Search
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-primary/20 focus-visible:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock-filter" className="text-xs font-medium">Stock Status</Label>
              <Select value={filterStock} onValueChange={setFilterStock}>
                <SelectTrigger id="stock-filter" className="border-primary/20 focus-visible:ring-primary">
                  <SelectValue placeholder="Filter by stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender-filter" className="text-xs font-medium">Gender</Label>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger id="gender-filter" className="border-primary/20 focus-visible:ring-primary">
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="UNISEX">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="popular-filter" className="text-xs font-medium">Popular Status</Label>
              <Select 
                value={filterPopular === null ? 'all' : filterPopular ? 'popular' : 'not-popular'}
                onValueChange={(value) => {
                  if (value === 'all') setFilterPopular(null);
                  else setFilterPopular(value === 'popular');
                }}
              >
                <SelectTrigger id="popular-filter" className="border-primary/20 focus-visible:ring-primary">
                  <SelectValue placeholder="Filter by popularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="not-popular">Not Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const discount = getProductDiscount(product.productId);
                
                return (
                  <TableRow key={product.productId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          {product.popular && (
                            <Badge variant="outline" className="mt-1 text-xs bg-primary/10 text-primary border-primary/30">Popular</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">${product.price}</span>
                        {product.previousPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.previousPrice}
                          </span>
                        )}
                        {discount && (
                          <span className="text-xs text-primary font-medium mt-1">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {product.stock} in stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Out of stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.gender}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span>{product.averageRating} </span>
                        <span className="text-muted-foreground text-xs">({product.ratingCount})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => router.push(`/dashboard/products/${product.productId}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Product</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => router.push(`/dashboard/products/${product.productId}/update`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Product</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => openDiscountModal(product.productId)}
                              >
                                <Percent className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Manage Discounts</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      
      {/* Discount Modal */}
      <DiscountModal 
        open={discountModalOpen}
        onOpenChange={setDiscountModalOpen}
        selectedProductId={selectedProductId}
      />
    </div>
  );
} 