"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Eye, Edit, Percent, Plus, Filter, Search, Star } from 'lucide-react';
import { mockProducts, Product } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductFilters {
  keyword: string;
  minPrice: string;
  maxPrice: string;
  gender: string;
  minRating: string;
  inStock: string;
  popular: string;
  sortBy: string;
  sortDirection: string;
}

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    gender: 'all',
    minRating: 'any',
    inStock: 'all',
    popular: 'all',
    sortBy: 'name',
    sortDirection: 'asc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      gender: 'all',
      minRating: 'any',
      inStock: 'all',
      popular: 'all',
      sortBy: 'name',
      sortDirection: 'asc'
    });
    setCurrentPage(1);
  };

  // Filter and sort products
  const filteredProducts = mockProducts.filter(product => {
    if (filters.keyword && !product.name.toLowerCase().includes(filters.keyword.toLowerCase()) && 
        !product.description.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false;
    }
    if (filters.minPrice && product.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) return false;
    if (filters.gender && filters.gender !== 'all' && product.gender !== filters.gender) return false;
    if (filters.minRating && filters.minRating !== 'any' && product.averageRating < parseFloat(filters.minRating)) return false;
    if (filters.inStock === 'true' && product.stock <= 0) return false;
    if (filters.inStock === 'false' && product.stock > 0) return false;
    if (filters.popular === 'true' && !product.popular) return false;
    if (filters.popular === 'false' && product.popular) return false;
    return true;
  }).sort((a, b) => {
    const direction = filters.sortDirection === 'asc' ? 1 : -1;
    switch (filters.sortBy) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'price':
        return direction * (a.price - b.price);
      case 'stock':
        return direction * (a.stock - b.stock);
      case 'rating':
        return direction * (a.averageRating - b.averageRating);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock <= 10) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="pl-10 border-primary/20 focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Min Price</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Price</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="UNISEX">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Min Rating</Label>
                <Select value={filters.minRating} onValueChange={(value) => handleFilterChange('minRating', value)}>
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock Status</Label>
                <Select value={filters.inStock} onValueChange={(value) => handleFilterChange('inStock', value)}>
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">In Stock</SelectItem>
                    <SelectItem value="false">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Popular</Label>
                <Select value={filters.popular} onValueChange={(value) => handleFilterChange('popular', value)}>
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Popular</SelectItem>
                    <SelectItem value="false">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Direction</Label>
                <Select value={filters.sortDirection} onValueChange={(value) => handleFilterChange('sortDirection', value)}>
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
        </p>
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <TableRow key={product.productId}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary border border-primary/10">
                          <span className="text-xs font-medium">IMG</span>
                        </div>
                        <div className="max-w-[250px]">
                          <div className="font-medium text-foreground">{product.name}</div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-sm text-muted-foreground truncate max-w-full overflow-hidden text-ellipsis">
                                  {product.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">
                                {product.description}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {product.popular && (
                            <Badge variant="secondary" className="mt-1">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-primary">{formatPrice(product.price)}</div>
                        {product.previousPrice && product.previousPrice > product.price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.previousPrice)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.gender}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{product.stock}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({product.ratingCount})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10">
                          <Percent className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}; 