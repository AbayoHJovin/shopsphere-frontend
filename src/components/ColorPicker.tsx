"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Check, X, Search, RefreshCw } from "lucide-react";
import { ProductColor } from "@/lib/types/product";
import { productColorService } from "@/lib/services/product-color-service";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ColorPickerProps {
  colors: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
}

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const { toast } = useToast();
  const [colorName, setColorName] = useState("");
  const [colorHexCode, setColorHexCode] = useState("#000000");
  const [availableColors, setAvailableColors] = useState<ProductColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [editingColor, setEditingColor] = useState<ProductColor | null>(null);
  const [showColorDialog, setShowColorDialog] = useState(false);
  
  // Fetch available colors from backend
  const fetchColors = async (pageNum = 0) => {
    try {
      setLoading(true);
      const response = await productColorService.getAllColors(pageNum);
      setAvailableColors(response.content);
      setTotalPages(response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching colors:", error);
      toast({
        title: "Error",
        description: "Failed to load available colors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search colors by name
  const searchColors = async () => {
    if (!searchTerm.trim()) {
      fetchColors();
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await productColorService.searchColors(searchTerm);
      setAvailableColors(response.content);
      setTotalPages(response.totalPages);
      setPage(0);
    } catch (error) {
      console.error("Error searching colors:", error);
      toast({
        title: "Error",
        description: "Failed to search colors",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Load colors on component mount
  useEffect(() => {
    fetchColors();
  }, []);

  // Add a color to the product
  const addColor = async () => {
    if (colorName.trim() === "") return;

    try {
      // First create the color in the backend
      const newColor = await productColorService.createColor({
        colorName,
        colorHexCode
      });
      
      // Then add it to the local state
      onChange([...colors, newColor]);
      
      // Reset form and refresh available colors
      setColorName("");
      setColorHexCode("#000000");
      fetchColors();
      
      toast({
        title: "Success",
        description: "Color added successfully",
      });
    } catch (error) {
      console.error("Error adding color:", error);
      toast({
        title: "Error",
        description: "Failed to add color",
        variant: "destructive",
      });
    }
  };

  // Remove a color from the product
  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  // Add an existing color from the available colors
  const addExistingColor = (color: ProductColor) => {
    // Check if color already exists in selected colors
    const exists = colors.some(c => c.colorId === color.colorId);
    if (exists) {
      toast({
        title: "Warning",
        description: "This color is already added to the product",
        variant: "destructive",
      });
      return;
    }
    
    onChange([...colors, color]);
    toast({
      title: "Success",
      description: `${color.colorName} added to product`,
    });
  };

  // Update an existing color
  const updateColor = async () => {
    if (!editingColor || !editingColor.colorId) return;
    
    try {
      const updatedColor = await productColorService.updateColor(editingColor.colorId, {
        colorName: editingColor.colorName,
        colorHexCode: editingColor.colorHexCode
      });
      
      // Update in available colors
      setAvailableColors(availableColors.map(c => 
        c.colorId === updatedColor.colorId ? updatedColor : c
      ));
      
      // Update in selected colors if present
      onChange(colors.map(c => 
        c.colorId === updatedColor.colorId ? updatedColor : c
      ));
      
      setEditingColor(null);
      toast({
        title: "Success",
        description: "Color updated successfully",
      });
    } catch (error) {
      console.error("Error updating color:", error);
      toast({
        title: "Error",
        description: "Failed to update color",
        variant: "destructive",
      });
    }
  };

  // Delete a color from the backend
  const deleteColor = async (colorId: string) => {
    try {
      await productColorService.deleteColor(colorId);
      
      // Remove from available colors
      setAvailableColors(availableColors.filter(c => c.colorId !== colorId));
      
      // Remove from selected colors if present
      onChange(colors.filter(c => c.colorId !== colorId));
      
      toast({
        title: "Success",
        description: "Color deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting color:", error);
      toast({
        title: "Error",
        description: "Failed to delete color",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Selected Colors */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Selected Colors</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowColorDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Manage Colors
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {colors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No colors selected. Add colors from the color manager.</p>
          ) : (
            colors.map((color, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 border rounded-md"
              >
                <div
                  className="h-6 w-6 rounded-md border"
                  style={{ backgroundColor: color.colorHexCode }}
                />
                <span>{color.colorName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => removeColor(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Color Management Dialog */}
      <Dialog open={showColorDialog} onOpenChange={setShowColorDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Color Management</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="browse">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Colors</TabsTrigger>
              <TabsTrigger value="create">Create New Color</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="space-y-4">
              {/* Search */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Search colors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={searchColors} disabled={isSearching}>
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  fetchColors();
                }}>
                  Reset
                </Button>
              </div>
              
              {/* Color Grid */}
              {loading ? (
                <div className="flex justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableColors.map((color) => (
                    <Card key={color.colorId} className="overflow-hidden">
                      <div 
                        className="h-12 w-full" 
                        style={{ backgroundColor: color.colorHexCode }}
                      />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{color.colorName}</h4>
                            <p className="text-xs text-muted-foreground">{color.colorHexCode}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setEditingColor(color)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Color</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {color.colorName}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteColor(color.colorId!)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 text-primary"
                              onClick={() => addExistingColor(color)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => fetchColors(Math.max(0, page - 1))}
                        aria-disabled={page === 0 || loading}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={page === i}
                          onClick={() => fetchColors(i)}
                          aria-disabled={loading}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => fetchColors(Math.min(totalPages - 1, page + 1))}
                        aria-disabled={page === totalPages - 1 || loading}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newColorName">Color Name</Label>
                  <Input
                    id="newColorName"
                    placeholder="e.g. Forest Green"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    className="border-primary/20 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newColorHex">Color Code</Label>
                  <div className="flex space-x-2 items-center">
                    <Input
                      id="newColorHex"
                      type="color"
                      value={colorHexCode}
                      onChange={(e) => setColorHexCode(e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer border-primary/20 focus-visible:ring-primary"
                    />
                    <Input
                      value={colorHexCode}
                      onChange={(e) => setColorHexCode(e.target.value)}
                      className="flex-1 border-primary/20 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={addColor}
                  className="bg-primary hover:bg-primary/90"
                  disabled={colorName.trim() === ""}
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Color
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Edit Color Dialog */}
      {editingColor && (
        <Dialog open={!!editingColor} onOpenChange={(open) => !open && setEditingColor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Color</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editColorName">Color Name</Label>
                <Input
                  id="editColorName"
                  value={editingColor.colorName}
                  onChange={(e) => setEditingColor({...editingColor, colorName: e.target.value})}
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editColorHex">Color Code</Label>
                <div className="flex space-x-2 items-center">
                  <Input
                    id="editColorHex"
                    type="color"
                    value={editingColor.colorHexCode}
                    onChange={(e) => setEditingColor({...editingColor, colorHexCode: e.target.value})}
                    className="w-12 h-9 p-1 cursor-pointer border-primary/20 focus-visible:ring-primary"
                  />
                  <Input
                    value={editingColor.colorHexCode}
                    onChange={(e) => setEditingColor({...editingColor, colorHexCode: e.target.value})}
                    className="flex-1 border-primary/20 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingColor(null)}>
                Cancel
              </Button>
              <Button onClick={updateColor}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}