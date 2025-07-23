"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { ColorPicker } from '@/components/ColorPicker';
import { ArrowLeft, Upload, X, Plus, Minus } from 'lucide-react';

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const categoryOptions = [
  'Clothing', 'Shoes', 'Accessories', 'Electronics', 
  'Sports', 'Books', 'Home', 'Beauty', 'Jewelry', 'Toys'
];

// Fixed schema: remove .default(false) and make popular required
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Product description is required'),
  price: z.string().min(1, 'Price is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Price must be a valid number'),
  gender: z.enum(['MALE', 'FEMALE', 'UNISEX'], { message: 'Gender is required' }),
  stock: z.string()
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, 'Stock must be a valid number'),
  popular: z.boolean(), // Removed .default(false)
});

type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [colors, setColors] = useState<Array<{ colorName: string; colorHexCode: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ size: string; stockForSize: number }>>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      gender: undefined,
      stock: '0',
      popular: false, // Explicit default value
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const files = Array.from(event.target.files);
    const newImages = files.slice(0, 5 - images.length);
    
    // Create URLs for preview
    const newUrls = newImages.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newImages]);
    setImageUrls(prev => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    setSizes(prev => [...prev, { size: 'M', stockForSize: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof typeof sizes[0], value: string | number) => {
    setSizes(prev => prev.map((size, i) => 
      i === index ? { ...size, [field]: value } : size
    ));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      
      // In a real app, you would send this data to your API
      const productData = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        colors,
        sizes,
        categories: selectedCategories,
        images: images.map(img => img.name), // In real app, you'd upload these
      };

      console.log('Product data:', productData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to products list
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20"> {/* Add bottom padding to ensure content doesn't get cut off */}
      {/* Header */}
      <div className="border-b border-border/40 pb-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Create Product</h1>
          <p className="text-muted-foreground mt-1">Add a new product to your inventory</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/products')}
          className="border-primary/20 hover:bg-primary/5 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12"> {/* Increased spacing between sections */}
            {/* Basic Information */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the core details about your product</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter product name" 
                            className="border-primary/20 focus-visible:ring-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="UNISEX">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter product description" 
                          className="min-h-[120px] border-primary/20 focus-visible:ring-primary" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="border-primary/20 focus-visible:ring-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            className="border-primary/20 focus-visible:ring-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="popular"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 pt-8">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel>Mark as Popular</FormLabel>
                          <FormDescription>
                            Featured in trending sections
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Upload up to 5 product images</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <Upload className="w-7 h-7 mb-2 text-primary" />
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, JPEG (MAX. 5 files)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={images.length >= 5}
                      />
                    </label>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square w-full h-24 overflow-hidden bg-muted rounded-md border border-border/40">
                            <img
                              src={url}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 hover:opacity-100 shadow-sm"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Colors</CardTitle>
                <CardDescription>Add color variants for your product</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ColorPicker colors={colors} onChange={setColors} />
              </CardContent>
            </Card>

            {/* Sizes */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Sizes & Stock</CardTitle>
                <CardDescription>Add size variants and their specific stock levels</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {sizes.map((size, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 border border-border/30 rounded-md">
                      <div className="w-full sm:w-1/3 max-w-[200px]">
                        <Label className="mb-2 block">Size</Label>
                        <Select
                          value={size.size}
                          onValueChange={(value) => updateSize(index, 'size', value)}
                        >
                          <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sizeOptions.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full sm:w-1/3 max-w-[200px]">
                        <Label htmlFor={`size-stock-${index}`} className="mb-2 block">Stock Quantity</Label>
                        <Input
                          id={`size-stock-${index}`}
                          type="number"
                          placeholder="0"
                          value={size.stockForSize}
                          onChange={(e) => updateSize(index, 'stockForSize', parseInt(e.target.value) || 0)}
                          className="border-primary/20 focus-visible:ring-primary"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSize(index)}
                        className="h-10 w-10 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSize}
                    className="w-full mt-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Size Variant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Categories</CardTitle>
                <CardDescription>Select categories for this product (at least one required)</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                    {categoryOptions.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories(prev => [...prev, category]);
                            } else {
                              setSelectedCategories(prev => prev.filter(c => c !== category));
                            }
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label 
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Selected categories badges */}
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedCategories.map(category => (
                        <Badge 
                          key={category} 
                          variant="secondary"
                          className="pl-2 pr-1 py-1 flex items-center gap-1"
                        >
                          {category}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full"
                            onClick={() => 
                              setSelectedCategories(prev => 
                                prev.filter(c => c !== category)
                              )
                            }
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {selectedCategories.length === 0 && (
                    <p className="text-sm text-destructive">At least one category must be selected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 bottom-6 bg-background py-4 border-t border-border/30 mt-8"> {/* Made sticky to always be accessible */}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard/products')}
                className="border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={selectedCategories.length === 0 || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}