"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Plus,
  MapPin,
  Edit,
  Trash2,
  ChevronRight,
  Building2,
  Navigation,
  Clock,
  DollarSign,
  Home,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import deliveryAreaService, {
  DeliveryAreaDTO,
  CreateDeliveryAreaDTO,
  UpdateDeliveryAreaDTO,
} from "@/lib/services/delivery-area-service";

export default function DeliveryAreasPage() {
  const [allDeliveryAreas, setAllDeliveryAreas] = useState<DeliveryAreaDTO[]>(
    []
  );
  const [currentAreas, setCurrentAreas] = useState<DeliveryAreaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<DeliveryAreaDTO | null>(
    null
  );
  const [breadcrumbPath, setBreadcrumbPath] = useState<DeliveryAreaDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DeliveryAreaDTO[]>([]);

  // Form states
  const [areaName, setAreaName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [deliveryCost, setDeliveryCost] = useState<string>("");
  const [minDays, setMinDays] = useState<string>("");
  const [maxDays, setMaxDays] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build hierarchy from flat array
  const buildHierarchy = (flatAreas: DeliveryAreaDTO[]): DeliveryAreaDTO[] => {
    const areaMap = new Map<number, DeliveryAreaDTO>();
    const rootAreas: DeliveryAreaDTO[] = [];

    // First pass: create map of all areas
    flatAreas.forEach((area) => {
      areaMap.set(area.deliveryAreaId, { ...area, children: [] });
    });

    // Second pass: build hierarchy
    flatAreas.forEach((area) => {
      const areaWithChildren = areaMap.get(area.deliveryAreaId)!;

      if (area.parentId === null) {
        // This is a root area
        rootAreas.push(areaWithChildren);
      } else {
        // This is a child area
        const parent = areaMap.get(area.parentId);
        if (parent) {
          parent.children.push(areaWithChildren);
        }
      }
    });

    return rootAreas;
  };

  // Load delivery areas
  const loadDeliveryAreas = async () => {
    try {
      setLoading(true);
      const response = await deliveryAreaService.getAllDeliveryAreas();

      if (response.success && response.data) {
        const hierarchicalAreas = buildHierarchy(response.data);
        setAllDeliveryAreas(hierarchicalAreas);
        setCurrentAreas(hierarchicalAreas);
        setBreadcrumbPath([]);
      } else {
        toast.error(response.message || "Failed to load delivery areas");
        setAllDeliveryAreas([]);
        setCurrentAreas([]);
      }
    } catch (error) {
      toast.error("Failed to load delivery areas");
      console.error("Error loading delivery areas:", error);
      setAllDeliveryAreas([]);
      setCurrentAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await deliveryAreaService.searchDeliveryAreas(query);
      if (response.success && response.data) {
        setSearchResults(response.data);
        setSearchQuery(query);
      } else {
        toast.error(response.message || "Failed to search delivery areas");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching delivery areas:", error);
      toast.error("Failed to search delivery areas");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  // Reset form
  const resetForm = () => {
    setAreaName("");
    const currentParent = breadcrumbPath[breadcrumbPath.length - 1];
    setParentId(currentParent ? currentParent.deliveryAreaId : null);
    setDeliveryCost("");
    setMinDays("");
    setMaxDays("");
    setSelectedArea(null);
  };

  // Handle create delivery area
  const handleCreateDeliveryArea = async () => {
    if (!areaName.trim()) {
      toast.error("Please enter a delivery area name");
      return;
    }

    try {
      setIsSubmitting(true);
      const deliveryAreaData: CreateDeliveryAreaDTO = {
        deliveryAreaName: areaName.trim(),
        parentId: parentId || null,
        deliveryCost: deliveryCost ? parseFloat(deliveryCost) : null,
        expectedDeliveryMinDays: minDays ? parseInt(minDays) : null,
        expectedDeliveryMaxDays: maxDays ? parseInt(maxDays) : null,
      };

      const response = await deliveryAreaService.createDeliveryArea(
        deliveryAreaData
      );

      if (response.success) {
        toast.success("Delivery area created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        loadDeliveryAreas();
      } else {
        toast.error(response.message || "Failed to create delivery area");
      }
    } catch (error) {
      toast.error("Failed to create delivery area");
      console.error("Error creating delivery area:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit delivery area
  const handleEditDeliveryArea = async () => {
    if (!selectedArea || !areaName.trim()) {
      toast.error("Please enter a delivery area name");
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData: UpdateDeliveryAreaDTO = {
        deliveryAreaName: areaName.trim(),
        parentId: parentId || null,
        deliveryCost: deliveryCost ? parseFloat(deliveryCost) : null,
        expectedDeliveryMinDays: minDays ? parseInt(minDays) : null,
        expectedDeliveryMaxDays: maxDays ? parseInt(maxDays) : null,
      };

      const response = await deliveryAreaService.updateDeliveryArea(
        selectedArea.deliveryAreaId,
        updateData
      );

      if (response.success) {
        toast.success("Delivery area updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        loadDeliveryAreas();
      } else {
        toast.error(response.message || "Failed to update delivery area");
      }
    } catch (error) {
      toast.error("Failed to update delivery area");
      console.error("Error updating delivery area:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete delivery area
  const handleDeleteDeliveryArea = async () => {
    if (!selectedArea) return;

    try {
      setIsSubmitting(true);
      const response = await deliveryAreaService.deleteDeliveryArea(
        selectedArea.deliveryAreaId
      );

      if (response.success) {
        toast.success("Delivery area deleted successfully");
        setIsDeleteDialogOpen(false);
        resetForm();
        loadDeliveryAreas();
      } else {
        toast.error(response.message || "Failed to delete delivery area");
      }
    } catch (error) {
      toast.error("Failed to delete delivery area");
      console.error("Error deleting delivery area:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (area: DeliveryAreaDTO) => {
    setSelectedArea(area);
    setAreaName(area.deliveryAreaName);
    setParentId(area.parentId);
    setDeliveryCost(area.deliveryCost?.toString() || "");
    setMinDays(area.expectedDeliveryMinDays?.toString() || "");
    setMaxDays(area.expectedDeliveryMaxDays?.toString() || "");
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (area: DeliveryAreaDTO) => {
    setSelectedArea(area);
    setIsDeleteDialogOpen(true);
  };

  // Toggle area expansion
  const navigateToArea = (area: DeliveryAreaDTO) => {
    if (area.children && area.children.length > 0) {
      setCurrentAreas(area.children);
      setBreadcrumbPath([...breadcrumbPath, area]);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentAreas(allDeliveryAreas);
      setBreadcrumbPath([]);
    } else {
      const targetArea = breadcrumbPath[index];
      const newPath = breadcrumbPath.slice(0, index + 1);
      setBreadcrumbPath(newPath);

      if (index === breadcrumbPath.length - 1) {
        setCurrentAreas(targetArea.children);
      } else {
        const parentArea = newPath[newPath.length - 1];
        setCurrentAreas(parentArea.children);
      }
    }
  };

  // Flatten hierarchy for parent selection
  const flattenHierarchy = (areas: DeliveryAreaDTO[]): DeliveryAreaDTO[] => {
    const result: DeliveryAreaDTO[] = [];

    const flatten = (areaList: DeliveryAreaDTO[]) => {
      areaList.forEach((area) => {
        result.push(area);
        if (area.children && area.children.length > 0) {
          flatten(area.children);
        }
      });
    };

    flatten(areas);
    return result;
  };

  // Get available parent areas (excluding the current area and its children)
  const getAvailableParentAreas = (
    currentAreaId?: number
  ): DeliveryAreaDTO[] => {
    const allAreas = flattenHierarchy(allDeliveryAreas);
    const currentParent = breadcrumbPath[breadcrumbPath.length - 1];

    return allAreas.filter((area) => {
      if (currentAreaId && area.deliveryAreaId === currentAreaId) return false;
      if (currentAreaId && isChildOf(area, currentAreaId)) return false;
      if (currentParent && area.deliveryAreaId === currentParent.deliveryAreaId)
        return false;
      return true;
    });
  };

  // Render parent area options with hierarchy
  const renderParentAreaOptions = (areas: DeliveryAreaDTO[]) => {
    return areas.map((area) => (
      <SelectItem
        key={area.deliveryAreaId}
        value={area.deliveryAreaId.toString()}
      >
        <div className="flex items-center gap-2">
          <span style={{ marginLeft: `${area.level * 16}px` }}>
            {area.level > 0 && "└─ "}
          </span>
          <span>{area.deliveryAreaName}</span>
        </div>
      </SelectItem>
    ));
  };

  // Check if an area is a child of another area
  const isChildOf = (area: DeliveryAreaDTO, parentId: number): boolean => {
    if (area.parentId === parentId) return true;
    if (area.parentId === null) return false;

    // Search in the flattened hierarchy
    const allAreas = flattenHierarchy(allDeliveryAreas);
    const parent = allAreas.find((a) => a.deliveryAreaId === area.parentId);
    return parent ? isChildOf(parent, parentId) : false;
  };

  // Render area hierarchy with proper table structure
  const navigateToSearchResult = (area: DeliveryAreaDTO) => {
    if (area.parentId) {
      const parentPath = findParentPath(area, allDeliveryAreas);
      setBreadcrumbPath(parentPath);
      setCurrentAreas(area.children || []);
    } else {
      setBreadcrumbPath([]);
      setCurrentAreas(area.children || []);
    }
    clearSearch();
  };

  const findParentPath = (
    targetArea: DeliveryAreaDTO,
    areas: DeliveryAreaDTO[]
  ): DeliveryAreaDTO[] => {
    const path: DeliveryAreaDTO[] = [];

    const findPath = (
      currentAreas: DeliveryAreaDTO[],
      target: DeliveryAreaDTO
    ): boolean => {
      for (const area of currentAreas) {
        if (area.deliveryAreaId === target.deliveryAreaId) {
          return true;
        }
        if (area.children && area.children.length > 0) {
          path.push(area);
          if (findPath(area.children, target)) {
            return true;
          }
          path.pop();
        }
      }
      return false;
    };

    findPath(areas, targetArea);
    return path;
  };

  const renderAreasTable = (
    areas: DeliveryAreaDTO[],
    isSearchMode: boolean = false
  ) => {
    return areas.map((area) => {
      const hasChildren = area.children && area.children.length > 0;
      const isClickable = hasChildren && !isSearchMode;
      const isSearchResultClickable = isSearchMode;

      return (
        <TableRow
          key={area.deliveryAreaId}
          className={`hover:bg-muted/50 ${
            isClickable || isSearchResultClickable
              ? "cursor-pointer"
              : "cursor-default"
          }`}
          onClick={() => {
            if (isSearchMode) {
              navigateToSearchResult(area);
            } else if (isClickable) {
              navigateToArea(area);
            }
          }}
        >
          <TableCell className="align-top">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-medium truncate">
                  {area.deliveryAreaName}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell className="align-top">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="whitespace-nowrap">
                {area.deliveryCost ? `$${area.deliveryCost.toFixed(2)}` : "N/A"}
              </span>
            </div>
          </TableCell>
          <TableCell className="align-top">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="whitespace-nowrap">
                {area.expectedDeliveryMinDays && area.expectedDeliveryMaxDays
                  ? `${area.expectedDeliveryMinDays}-${area.expectedDeliveryMaxDays} days`
                  : "N/A"}
              </span>
            </div>
          </TableCell>
          <TableCell className="align-top">
            <Badge
              variant={area.level === 0 ? "default" : "secondary"}
              className="whitespace-nowrap"
            >
              {area.level === 0 ? "Top Level" : `Level ${area.level}`}
            </Badge>
          </TableCell>
          <TableCell className="align-top">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditDialog(area);
                }}
                className="flex-shrink-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(area);
                }}
                className="text-destructive hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  // Initial load
  useEffect(() => {
    loadDeliveryAreas();
  }, []);

  // Get top-level areas for hierarchy display (they are already the root of our hierarchy)
  const renderBreadcrumb = () => {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigateToBreadcrumb(-1)}
              className="cursor-pointer flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              All Areas
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbPath.map((area, index) => (
            <React.Fragment key={area.deliveryAreaId}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === breadcrumbPath.length - 1 ? (
                  <BreadcrumbPage>{area.deliveryAreaName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => navigateToBreadcrumb(index)}
                    className="cursor-pointer"
                  >
                    {area.deliveryAreaName}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Areas</h1>
          <p className="text-muted-foreground">
            Manage delivery areas and their hierarchical structure
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Delivery Area
        </Button>
      </div>

      {(breadcrumbPath.length > 0 || searchQuery) && (
        <div className="flex items-center">
          {searchQuery ? (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={clearSearch}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    <Home className="h-4 w-4" />
                    All Areas
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Search: "{searchQuery}"</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            renderBreadcrumb()
          )}
        </div>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search delivery areas by name..."
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  if (query.trim()) {
                    handleSearch(query);
                  } else {
                    clearSearch();
                  }
                }}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isSearching && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Areas Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isSearching ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : searchQuery ? (
            searchResults.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Area Name</TableHead>
                      <TableHead className="w-[15%]">Delivery Cost</TableHead>
                      <TableHead className="w-[20%]">Delivery Time</TableHead>
                      <TableHead className="w-[10%]">Level</TableHead>
                      <TableHead className="w-[15%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderAreasTable(searchResults, true)}</TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No delivery areas found
                </h3>
                <p className="text-muted-foreground">
                  No delivery areas match your search for "{searchQuery}"
                </p>
              </div>
            )
          ) : currentAreas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Area Name</TableHead>
                    <TableHead className="w-[15%]">Delivery Cost</TableHead>
                    <TableHead className="w-[20%]">Delivery Time</TableHead>
                    <TableHead className="w-[10%]">Level</TableHead>
                    <TableHead className="w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderAreasTable(currentAreas, false)}</TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No delivery areas found
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first delivery area to get started.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Delivery Area
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Delivery Area Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Delivery Area</DialogTitle>
            <DialogDescription>
              Add a new delivery area to your system. You can create top-level
              areas or sub-areas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="areaName" className="text-sm font-medium">
                Area Name *
              </Label>
              <Input
                id="areaName"
                placeholder="e.g., Tanzania, Dodoma, Dar es Salaam"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="parentArea" className="text-sm font-medium">
                Parent Area
              </Label>
              <Select
                value={parentId?.toString() || "none"}
                onValueChange={(value) =>
                  setParentId(value === "none" ? null : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent area (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    No parent (Top-level area)
                  </SelectItem>
                  {renderParentAreaOptions(getAvailableParentAreas())}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryCost" className="text-sm font-medium">
                  Delivery Cost ($)
                </Label>
                <Input
                  id="deliveryCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="minDays" className="text-sm font-medium">
                  Min Delivery Days
                </Label>
                <Input
                  id="minDays"
                  type="number"
                  placeholder="1"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maxDays" className="text-sm font-medium">
                  Max Delivery Days
                </Label>
                <Input
                  id="maxDays"
                  type="number"
                  placeholder="7"
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDeliveryArea}
              disabled={isSubmitting || !areaName.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Area"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Delivery Area Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Delivery Area</DialogTitle>
            <DialogDescription>
              Update the delivery area information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="editAreaName" className="text-sm font-medium">
                Area Name *
              </Label>
              <Input
                id="editAreaName"
                placeholder="e.g., Tanzania, Dodoma, Dar es Salaam"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="editParentArea" className="text-sm font-medium">
                Parent Area
              </Label>
              <Select
                value={parentId?.toString() || "none"}
                onValueChange={(value) =>
                  setParentId(value === "none" ? null : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent area (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    No parent (Top-level area)
                  </SelectItem>
                  {renderParentAreaOptions(
                    getAvailableParentAreas(selectedArea?.deliveryAreaId)
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="editDeliveryCost"
                  className="text-sm font-medium"
                >
                  Delivery Cost ($)
                </Label>
                <Input
                  id="editDeliveryCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="editMinDays" className="text-sm font-medium">
                  Min Delivery Days
                </Label>
                <Input
                  id="editMinDays"
                  type="number"
                  placeholder="1"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="editMaxDays" className="text-sm font-medium">
                  Max Delivery Days
                </Label>
                <Input
                  id="editMaxDays"
                  type="number"
                  placeholder="7"
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditDeliveryArea}
              disabled={isSubmitting || !areaName.trim()}
            >
              {isSubmitting ? "Updating..." : "Update Area"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Area</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedArea?.deliveryAreaName}
              "? This action cannot be undone and will also delete all
              sub-areas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDeliveryArea}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
