import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, X, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockProducts, mockDiscounts, Discount } from '@/data/mockData';

interface DiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProductId?: string;
}

interface DiscountForm {
  name: string;
  description: string;
  percentage: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  productIds: string[];
  active: boolean;
}

export const DiscountModal = ({ open, onOpenChange, selectedProductId }: DiscountModalProps) => {
  const [form, setForm] = useState<DiscountForm>({
    name: '',
    description: '',
    percentage: '',
    startDate: undefined,
    endDate: undefined,
    productIds: selectedProductId ? [selectedProductId] : [],
    active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("existing");

  const handleInputChange = (field: keyof DiscountForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductSelection = (productId: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      productIds: checked 
        ? [...prev.productIds, productId]
        : prev.productIds.filter(id => id !== productId)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Discount name is required';
    if (!form.percentage || parseFloat(form.percentage) < 1 || parseFloat(form.percentage) > 100) {
      newErrors.percentage = 'Discount percentage must be between 1% and 100%';
    }
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (form.productIds.length === 0) newErrors.productIds = 'At least one product must be selected';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Creating discount:', form);
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', percentage: '', startDate: undefined, endDate: undefined,
      productIds: selectedProductId ? [selectedProductId] : [], active: true
    });
    setErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const selectedProduct = mockProducts.find(p => p.productId === selectedProductId);
  const productDiscounts = mockDiscounts.filter(discount => 
    discount.productIds.includes(selectedProductId || '')
  );
  const availableDiscounts = mockDiscounts.filter(discount => 
    !discount.productIds.includes(selectedProductId || '')
  );

  const addProductToDiscount = (discountId: string) => {
    console.log(`Adding product ${selectedProductId} to discount ${discountId}`);
  };

  const removeProductFromDiscount = (discountId: string) => {
    console.log(`Removing product ${selectedProductId} from discount ${discountId}`);
  };

  const toggleDiscountStatus = (discountId: string) => {
    console.log(`Toggling status for discount ${discountId}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Product Discounts {selectedProduct && `- ${selectedProduct.name}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="existing">Current Discounts ({productDiscounts.length})</TabsTrigger>
            <TabsTrigger value="available">Available Discounts ({availableDiscounts.length})</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Discounts Applied to This Product</h3>
                {selectedProduct && (
                  <Badge variant="outline">{formatPrice(selectedProduct.price)}</Badge>
                )}
              </div>
              
              {productDiscounts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No discounts currently applied to this product.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {productDiscounts.map((discount) => (
                    <Card key={discount.discountId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{discount.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={discount.active ? "default" : "secondary"}>
                              {discount.active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-lg font-bold">
                              {discount.percentage}% OFF
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {discount.description && (
                          <p className="text-sm text-muted-foreground">{discount.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="font-medium">Duration</Label>
                            <p>{format(discount.startDate, "MMM dd, yyyy")} - {format(discount.endDate, "MMM dd, yyyy")}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Products Included</Label>
                            <p>{discount.productIds.length} products</p>
                          </div>
                        </div>

                        {selectedProduct && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Original Price:</span>
                              <span className="font-medium">{formatPrice(selectedProduct.price)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Discounted Price:</span>
                              <span className="font-bold text-primary">
                                {formatPrice(selectedProduct.price * (1 - discount.percentage / 100))}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-destructive">
                              <span>You Save:</span>
                              <span>{formatPrice(selectedProduct.price * (discount.percentage / 100))}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleDiscountStatus(discount.discountId)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {discount.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeProductFromDiscount(discount.discountId)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Product
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Product to Existing Discounts</h3>
              
              {availableDiscounts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">All existing discounts already include this product.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {availableDiscounts.map((discount) => (
                    <Card key={discount.discountId}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <h4 className="font-semibold">{discount.name}</h4>
                                {discount.description && (
                                  <p className="text-sm text-muted-foreground">{discount.description}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-lg font-bold">
                                {discount.percentage}% OFF
                              </Badge>
                              <Badge variant={discount.active ? "default" : "secondary"}>
                                {discount.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            
                            <div className="mt-2 text-sm text-muted-foreground">
                              {format(discount.startDate, "MMM dd, yyyy")} - {format(discount.endDate, "MMM dd, yyyy")} • {discount.productIds.length} products
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => addProductToDiscount(discount.discountId)}
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Discount Details Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Create New Discount</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Discount Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Summer Sale 2024"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Optional description of the discount"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="percentage">Discount Percentage *</Label>
                    <div className="relative">
                      <Input
                        id="percentage"
                        type="number"
                        min="1"
                        max="100"
                        value={form.percentage}
                        onChange={(e) => handleInputChange('percentage', e.target.value)}
                        placeholder="e.g., 25"
                        className={cn("pr-8", errors.percentage ? 'border-destructive' : '')}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    {errors.percentage && <p className="text-sm text-destructive">{errors.percentage}</p>}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Schedule</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !form.startDate && "text-muted-foreground",
                              errors.startDate && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.startDate ? format(form.startDate, "PPP") : "Pick start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.startDate}
                            onSelect={(date) => handleInputChange('startDate', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !form.endDate && "text-muted-foreground",
                              errors.endDate && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.endDate ? format(form.endDate, "PPP") : "Pick end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.endDate}
                            onSelect={(date) => handleInputChange('endDate', date)}
                            disabled={(date) => date < new Date() || (form.startDate && date <= form.startDate)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                    </div>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select Products</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.active}
                        onCheckedChange={(checked) => handleInputChange('active', checked)}
                        id="active"
                        className="data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                  
                  {errors.productIds && <p className="text-sm text-destructive">{errors.productIds}</p>}
                  
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
                    {mockProducts.map((product) => (
                      <div key={product.productId} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg">
                        <Checkbox
                          id={product.productId}
                          checked={form.productIds.includes(product.productId)}
                          onCheckedChange={(checked) => 
                            handleProductSelection(product.productId, checked as boolean)
                          }
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={product.productId} className="cursor-pointer font-medium">
                                {product.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                            </div>
                            <Badge variant="outline">{product.gender}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Discount Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.name && (
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{form.name}</p>
                      </div>
                    )}
                    
                    {form.percentage && (
                      <div>
                        <Label className="text-sm font-medium">Discount</Label>
                        <p className="text-lg font-bold text-primary">{form.percentage}% OFF</p>
                      </div>
                    )}

                    {form.startDate && form.endDate && (
                      <div>
                        <Label className="text-sm font-medium">Duration</Label>
                        <p className="text-sm">
                          {format(form.startDate, "MMM dd")} - {format(form.endDate, "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={form.active ? "default" : "secondary"} className={form.active ? "bg-primary hover:bg-primary/90" : ""}>
                        {form.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {form.productIds.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Selected Products ({form.productIds.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {mockProducts.filter(p => form.productIds.includes(p.productId)).map((product) => (
                          <div key={product.productId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{formatPrice(product.price)}</span>
                                {form.percentage && (
                                  <span className="text-primary font-medium">
                                    → {formatPrice(product.price * (1 - parseFloat(form.percentage) / 100))}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProductSelection(product.productId, false)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {activeTab === "create" && (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Create Discount
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 