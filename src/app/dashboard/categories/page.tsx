"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  TagIcon, 
  Plus, 
  Edit, 
  Trash, 
  MoreHorizontal, 
  ChevronRight, 
  Search,
  FolderPlus,
  ArrowLeft,
  Tag,
  Info,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { adminCategoryService } from '@/lib/services/admin-category-service';
import { CategoryResponse, CategorySummaryResponse, CategoryCreateRequest, CategoryUpdateRequest } from '@/lib/types/category';

export default function CategoriesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  // States for category management
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'All Categories' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch categories based on current parent
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ['categories', currentParentId],
    queryFn: () => currentParentId === null
      ? adminCategoryService.getTopLevelCategories()
      : adminCategoryService.getSubcategories(currentParentId)
  });

  // Fetch category summaries (for the performance cards)
  const {
    data: categorySummaries = [],
    isLoading: isLoadingSummaries,
  } = useQuery({
    queryKey: ['categorySummaries'],
    queryFn: () => adminCategoryService.getCategorySummaries(),
    // Only fetch summaries when viewing top-level categories
    enabled: currentParentId === null
  });
  
  // Fetch all categories for dropdown selection
  const {
    data: allCategories = [],
    isLoading: isLoadingAllCategories,
  } = useQuery({
    queryKey: ['allCategories'],
    queryFn: () => adminCategoryService.getAllCategories(),
    // Only fetch when needed for selection
    enabled: isCreateDialogOpen || isEditDialogOpen
  });

  // Mutations for CRUD operations
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryCreateRequest) => adminCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['allCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categorySummaries'] });
      toast.toast({
        title: "Category created",
        description: "The category was created successfully.",
        variant: "success"
      });
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.toast({
        title: "Error",
        description: error.message || "Failed to create category.",
        variant: "destructive"
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: CategoryUpdateRequest }) => 
      adminCategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['allCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categorySummaries'] });
      toast.toast({
        title: "Category updated",
        description: "The category was updated successfully.",
        variant: "success"
      });
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.toast({
        title: "Error",
        description: error.message || "Failed to update category.",
        variant: "destructive"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => adminCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['allCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categorySummaries'] });
      toast.toast({
        title: "Category deleted",
        description: "The category was deleted successfully.",
        variant: "success"
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.toast({
        title: "Error",
        description: error.message || "Failed to delete category.",
        variant: "destructive"
      });
    }
  });

  // Filter categories based on search query
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Paginated categories
  const paginatedCategories = filteredCategories.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredCategories.length / pageSize);

  // Navigate to subcategories
  const navigateToSubcategories = useCallback(async (category: CategoryResponse) => {
    try {
      setCurrentParentId(category.categoryId);
      setBreadcrumbs([
        ...breadcrumbs, 
        { id: category.categoryId, name: category.name }
      ]);
      
      // Reset pagination when navigating
      setCurrentPage(0);
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Failed to load subcategories.",
        variant: "destructive"
      });
    }
  }, [breadcrumbs, toast]);

  // Navigate back using breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentParentId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    
    // Reset pagination when navigating
    setCurrentPage(0);
  };

  // Handle create category
  const handleCreateCategory = () => {
    const categoryData: CategoryCreateRequest = {
      name: formName,
      description: formDescription || undefined,
      parentId: formParentId
    };
    
    createCategoryMutation.mutate(categoryData);
  };

  // Handle edit category
  const handleEditCategory = () => {
    if (!selectedCategory) return;
    
    const categoryData: CategoryUpdateRequest = {
      name: formName,
      description: formDescription || undefined,
      parentId: formParentId
    };
    
    updateCategoryMutation.mutate({ 
      id: selectedCategory.categoryId, 
      data: categoryData 
    });
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    deleteCategoryMutation.mutate(selectedCategory.categoryId);
  };

  // Reset form fields
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormParentId(null);
    setSelectedCategory(null);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setFormParentId(currentParentId);
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || '');
    setFormParentId(category.parentId);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  // Get all potential parent categories (excluding current category and its descendants)
  const getValidParentCategories = () => {
    if (!selectedCategory) return allCategories.filter(c => !c.parentId);
    
    // Prevent creating circular dependencies
    // This is a simplified version that doesn't account for all possible circular dependencies
    // In a real app, you would need a more comprehensive check
    return allCategories.filter(c => 
      c.categoryId !== selectedCategory.categoryId && 
      c.parentId !== selectedCategory.categoryId
    );
  };

  // Handle pagination
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Categories</h1>
        <p className="text-muted-foreground mt-1">Manage product categories and subcategories</p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <Breadcrumb className="overflow-hidden">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index} className={index === breadcrumbs.length - 1 ? "font-semibold" : ""}>
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-primary">{crumb.name}</span>
                ) : (
                  <BreadcrumbLink 
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => navigateToBreadcrumb(index)}
                  >
                    {crumb.name}
                  </BreadcrumbLink>
                )}
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-8 border-primary/20 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="text-lg flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-primary" />
            {breadcrumbs.length > 1 
              ? `${breadcrumbs[breadcrumbs.length - 1].name} Subcategories` 
              : 'Main Categories'
            }
          </CardTitle>
          <CardDescription>
            {breadcrumbs.length > 1
              ? `Managing subcategories of ${breadcrumbs[breadcrumbs.length - 1].name}`
              : 'Top-level categories for your product catalog'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingCategories ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading categories...</span>
            </div>
          ) : isErrorCategories ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-2">Failed to load categories</p>
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['categories', currentParentId] })}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Products</TableHead>
                      <TableHead className="text-center">Subcategories</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCategories.length > 0 ? (
                      paginatedCategories.map((category) => (
                        <TableRow key={category.categoryId}>
                          <TableCell>
                            <div className="font-medium">{category.name}</div>
                          </TableCell>
                          <TableCell className="max-w-sm truncate">
                            {category.description || <span className="text-muted-foreground italic">No description</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {category.productCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {category.hasSubcategories ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigateToSubcategories(category)}
                                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                              >
                                {category.subcategoryCount} 
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => openViewDialog(category)}
                                >
                                  <Info className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => openEditDialog(category)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Category
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer" 
                                  onClick={() => navigateToSubcategories(category)}
                                  disabled={!category.hasSubcategories}
                                >
                                  <ChevronRight className="w-4 h-4 mr-2" />
                                  View Subcategories
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setFormParentId(category.categoryId);
                                    setIsCreateDialogOpen(true);
                                  }}
                                >
                                  <FolderPlus className="w-4 h-4 mr-2" />
                                  Add Subcategory
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => openDeleteDialog(category)}
                                >
                                  <Trash className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          {searchQuery ? (
                            <div className="text-muted-foreground">
                              No categories matching "<span className="font-medium">{searchQuery}</span>"
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <TagIcon className="w-8 h-8 mb-2 opacity-40" />
                              <span>{breadcrumbs.length > 1 ? 'No subcategories found' : 'No categories found'}</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                                onClick={openCreateDialog}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                {breadcrumbs.length > 1 ? 'Add a subcategory' : 'Add your first category'}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {filteredCategories.length > pageSize && (
                <div className="py-4 px-4 flex items-center justify-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  
                  {/* Create page number buttons */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    
                    // Logic to display page numbers around the current page
                    if (totalPages <= 5) {
                      pageNumber = i;
                    } else if (currentPage <= 1) {
                      pageNumber = i;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 5 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    if (pageNumber < 0 || pageNumber >= totalPages) {
                      return null;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className={currentPage === pageNumber ? "bg-primary hover:bg-primary/90" : ""}
                      >
                        {pageNumber + 1}
                      </Button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={nextPage} 
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Category Summaries */}
      {currentParentId === null && (
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-lg flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-primary" />
              Category Performance
            </CardTitle>
            <CardDescription>
              Overview of sales performance by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSummaries ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : categorySummaries.length > 0 ? (
              <div className="space-y-4 py-2">
                {categorySummaries.map((summary) => (
                  <div key={summary.categoryId} className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-primary" />
                        <span className="font-medium">{summary.name}</span>
                      </div>
                      <Badge className="bg-primary">{summary.percentageOfTotalSales?.toFixed(1) || '0.0'}% of sales</Badge>
                    </div>
                    <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                      <span>{summary.productCount ?? 0} products</span>
                      <span>{(summary.totalSold ?? 0).toLocaleString()} units sold</span>
                    </div>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${summary.percentageOfTotalSales ?? 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No category performance data available
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {formParentId === currentParentId ? 'Create Category' : 'Create Subcategory'}
            </DialogTitle>
            <DialogDescription>
              {formParentId === currentParentId
                ? 'Add a new category to your product catalog'
                : `Add a subcategory under ${selectedCategory?.name || 'selected category'}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="Enter category name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter category description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            {currentParentId === null && (
              <div className="grid gap-2">
                <Label htmlFor="parent">Parent Category (optional)</Label>
                <Select 
                  value={formParentId || 'none'} 
                  onValueChange={(value) => setFormParentId(value === 'none' ? null : value)}
                  disabled={isLoadingAllCategories}
                >
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                    <SelectValue placeholder="None (Top-level category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top-level category)</SelectItem>
                    {allCategories
                      .filter(c => c.parentId === null)
                      .map(category => (
                        <SelectItem key={category.categoryId} value={category.categoryId}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(false);
              }}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
              disabled={createCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleCreateCategory}
              disabled={!formName || createCategoryMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update details for category "{selectedCategory?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Category Name <span className="text-destructive">*</span></Label>
              <Input
                id="edit-name"
                placeholder="Enter category name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter category description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-parent">Parent Category</Label>
              <Select 
                value={formParentId || 'none'} 
                onValueChange={(value) => setFormParentId(value === 'none' ? null : value)}
                disabled={isLoadingAllCategories}
              >
                <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                  <SelectValue placeholder="None (Top-level category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top-level category)</SelectItem>
                  {getValidParentCategories()
                    .filter(c => c.parentId === null)
                    .map(category => (
                      <SelectItem key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
              disabled={updateCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleEditCategory}
              disabled={!formName || updateCategoryMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {updateCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setSelectedCategory(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategory?.hasSubcategories
                ? `This will delete "${selectedCategory?.name}" and all its subcategories. This action cannot be undone.`
                : `This will delete the category "${selectedCategory?.name}". This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
              disabled={deleteCategoryMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCategory();
              }}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) setSelectedCategory(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>
              Detailed information about this category
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Name</p>
                  <p className="text-sm text-muted-foreground">{selectedCategory.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Products</p>
                  <p className="text-sm text-muted-foreground">{selectedCategory.productCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Subcategories</p>
                  <p className="text-sm text-muted-foreground">{selectedCategory.subcategoryCount}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Description</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.description || "No description provided"}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Parent Category</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.parentName || "None (Top-level category)"}
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                {selectedCategory.hasSubcategories && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigateToSubcategories(selectedCategory);
                      setIsViewDialogOpen(false);
                    }}
                    className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    View Subcategories
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(selectedCategory);
                  }}
                  className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 