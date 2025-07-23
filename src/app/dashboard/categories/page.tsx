"use client";

import { useState, useEffect } from 'react';
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
  ShoppingBag
} from 'lucide-react';

// Define category types based on the API responses
interface Category {
  categoryId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  hasSubcategories: boolean;
  subcategoryCount: number;
  productCount: number;
}

interface CategorySummary {
  categoryId: string;
  name: string;
  productCount: number;
  hasSubcategories: boolean;
  totalSold: number;
  percentageOfTotalSales: number;
}

// Mock data for categories
const mockCategories: Category[] = [
  {
    categoryId: "1",
    name: "Electronics",
    description: "Electronic devices and gadgets",
    parentId: null,
    parentName: null,
    hasSubcategories: true,
    subcategoryCount: 3,
    productCount: 120
  },
  {
    categoryId: "2",
    name: "Clothing",
    description: "Fashion items and apparel",
    parentId: null,
    parentName: null,
    hasSubcategories: true,
    subcategoryCount: 4,
    productCount: 240
  },
  {
    categoryId: "3",
    name: "Home & Garden",
    description: "Home decor and garden equipment",
    parentId: null,
    parentName: null,
    hasSubcategories: true,
    subcategoryCount: 5,
    productCount: 180
  },
  {
    categoryId: "4",
    name: "Smartphones",
    description: "Mobile phones and accessories",
    parentId: "1",
    parentName: "Electronics",
    hasSubcategories: false,
    subcategoryCount: 0,
    productCount: 50
  },
  {
    categoryId: "5",
    name: "Laptops",
    description: "Notebooks and laptops",
    parentId: "1",
    parentName: "Electronics",
    hasSubcategories: false,
    subcategoryCount: 0,
    productCount: 40
  },
  {
    categoryId: "6",
    name: "Audio Equipment",
    description: "Headphones, speakers and sound systems",
    parentId: "1",
    parentName: "Electronics",
    hasSubcategories: false,
    subcategoryCount: 0,
    productCount: 30
  },
  {
    categoryId: "7",
    name: "Men's Clothing",
    description: "Men's apparel and fashion items",
    parentId: "2",
    parentName: "Clothing",
    hasSubcategories: false,
    subcategoryCount: 0,
    productCount: 80
  },
  {
    categoryId: "8",
    name: "Women's Clothing",
    description: "Women's apparel and fashion items",
    parentId: "2",
    parentName: "Clothing",
    hasSubcategories: false,
    subcategoryCount: 0,
    productCount: 120
  }
];

// Mock data for category summaries
const mockCategorySummaries: CategorySummary[] = [
  {
    categoryId: "1",
    name: "Electronics",
    productCount: 120,
    hasSubcategories: true,
    totalSold: 1280,
    percentageOfTotalSales: 32.5
  },
  {
    categoryId: "2",
    name: "Clothing",
    productCount: 240,
    hasSubcategories: true,
    totalSold: 2100,
    percentageOfTotalSales: 41.8
  },
  {
    categoryId: "3",
    name: "Home & Garden",
    productCount: 180,
    hasSubcategories: true,
    totalSold: 850,
    percentageOfTotalSales: 25.7
  }
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState<string | null>(null);

  // Load categories based on current parent
  useEffect(() => {
    // In a real app, this would fetch data from the API using the currentParentId
    // GET /api/admin/categories or
    // GET /api/admin/categories/{currentParentId}/subcategories
    if (currentParentId === null) {
      const topLevelCategories = mockCategories.filter(c => c.parentId === null);
      setCategories(topLevelCategories);
    } else {
      const subcategories = mockCategories.filter(c => c.parentId === currentParentId);
      setCategories(subcategories);
      
      // Update current category
      const parent = mockCategories.find(c => c.categoryId === currentParentId) || null;
      setCurrentCategory(parent);
    }
  }, [currentParentId]);

  // Filter categories based on search query
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Navigate to subcategories
  const navigateToSubcategories = (category: Category) => {
    setCurrentParentId(category.categoryId);
    setBreadcrumbs([
      ...breadcrumbs, 
      { id: category.categoryId, name: category.name }
    ]);
  };

  // Navigate back using breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentParentId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  // Handle create category
  const handleCreateCategory = () => {
    // In a real app, this would call the API
    // POST /api/admin/categories
    const newCategory: Category = {
      categoryId: Date.now().toString(), // Simulate UUID generation
      name: formName,
      description: formDescription || null,
      parentId: currentParentId,
      parentName: currentCategory ? currentCategory.name : null,
      hasSubcategories: false,
      subcategoryCount: 0,
      productCount: 0
    };

    setCategories([...categories, newCategory]);
    mockCategories.push(newCategory); // Update mock data for navigation
    resetForm();
    setIsCreateDialogOpen(false);
  };

  // Handle edit category
  const handleEditCategory = () => {
    // In a real app, this would call the API
    // PUT /api/admin/categories/{selectedCategory.categoryId}
    if (!selectedCategory) return;

    const updatedCategory: Category = {
      ...selectedCategory,
      name: formName,
      description: formDescription || null,
      parentId: formParentId,
      parentName: formParentId === null 
        ? null 
        : mockCategories.find(c => c.categoryId === formParentId)?.name || null
    };

    setCategories(categories.map(c => 
      c.categoryId === selectedCategory.categoryId ? updatedCategory : c
    ));

    // Update mock data for navigation
    const index = mockCategories.findIndex(c => c.categoryId === selectedCategory.categoryId);
    if (index !== -1) {
      mockCategories[index] = updatedCategory;
    }

    resetForm();
    setIsEditDialogOpen(false);
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    // In a real app, this would call the API
    // DELETE /api/admin/categories/{selectedCategory.categoryId}
    if (!selectedCategory) return;

    // Remove from current view
    setCategories(categories.filter(c => c.categoryId !== selectedCategory.categoryId));
    
    // Remove from mock data for navigation
    const index = mockCategories.findIndex(c => c.categoryId === selectedCategory.categoryId);
    if (index !== -1) {
      mockCategories.splice(index, 1);
    }

    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
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
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || '');
    setFormParentId(category.parentId);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  // Get all potential parent categories (excluding current category and its descendants)
  const getValidParentCategories = () => {
    if (!selectedCategory) return mockCategories.filter(c => !c.parentId);
    
    // Prevent creating circular dependencies
    return mockCategories.filter(c => 
      c.categoryId !== selectedCategory.categoryId && 
      c.parentId !== selectedCategory.categoryId
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Categories</h1>
        <p className="text-muted-foreground mt-1">Manage product categories and subcategories</p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex justify-between items-center">
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
          <div className="relative w-64">
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
            className="bg-primary hover:bg-primary/90"
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
            {currentCategory ? `${currentCategory.name} Subcategories` : 'Main Categories'}
          </CardTitle>
          <CardDescription>
            {currentCategory 
              ? `Managing subcategories of ${currentCategory.name}`
              : 'Top-level categories for your product catalog'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
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
                        <span>{currentCategory ? 'No subcategories found' : 'No categories found'}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                          onClick={openCreateDialog}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {currentCategory ? 'Add a subcategory' : 'Add your first category'}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Summaries */}
      {!currentParentId && (
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
            <div className="space-y-4 py-2">
              {mockCategorySummaries.map((summary) => (
                <div key={summary.categoryId} className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium">{summary.name}</span>
                    </div>
                    <Badge className="bg-primary">{summary.percentageOfTotalSales.toFixed(1)}% of sales</Badge>
                  </div>
                  <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                    <span>{summary.productCount} products</span>
                    <span>{summary.totalSold.toLocaleString()} units sold</span>
                  </div>
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${summary.percentageOfTotalSales}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {formParentId === currentParentId ? 'Create Category' : 'Create Subcategory'}
            </DialogTitle>
            <DialogDescription>
              {formParentId === currentParentId
                ? 'Add a new category to your product catalog'
                : `Add a subcategory under ${selectedCategory?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
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
                <Select value={formParentId || 'none'} onValueChange={(value) => setFormParentId(value === 'none' ? null : value)}>
                  <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                    <SelectValue placeholder="None (Top-level category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top-level category)</SelectItem>
                    {mockCategories
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
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleCreateCategory}
              disabled={!formName}
              className="bg-primary hover:bg-primary/90"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update details for category "{selectedCategory?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Category Name</Label>
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
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleEditCategory}
              disabled={!formName}
              className="bg-primary hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
            <AlertDialogCancel className="border-primary/20 hover:bg-primary/5 hover:text-primary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteCategory}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
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
                  onClick={() => openEditDialog(selectedCategory)}
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