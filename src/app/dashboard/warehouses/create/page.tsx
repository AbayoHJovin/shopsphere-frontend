"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  warehouseService,
  CreateWarehouseDTO,
} from "@/lib/services/warehouse-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, X, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { GoogleMapsWarehousePicker } from "@/components/GoogleMapsWarehousePicker";

export default function CreateWarehousePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [addressSelected, setAddressSelected] = useState(false);
  const [formData, setFormData] = useState<CreateWarehouseDTO>({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    email: "",
    capacity: 1000,
    latitude: undefined,
    longitude: undefined,
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: { warehouse: CreateWarehouseDTO; images?: File[] }) =>
      warehouseService.createWarehouse(data.warehouse, data.images),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Warehouse created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      router.push("/dashboard/warehouses");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create warehouse",
        variant: "destructive",
      });
    },
  });

  // Handle Google Maps address selection
  const handleGoogleMapsAddressSelect = (address: any) => {
    setFormData(prev => ({
      ...prev,
      address: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
    }));
    setAddressSelected(true);
    
    toast({
      title: "Location Selected",
      description: "Address details have been automatically filled from the map selection.",
    });
  };

  const handleInputChange = (
    field: keyof CreateWarehouseDTO,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset address selection when address fields are manually changed
    if (field === "address" || field === "city" || field === "state" || field === "zipCode" || field === "country") {
      setAddressSelected(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.country
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      warehouse: formData,
      images: images.length > 0 ? images : undefined,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Warehouse
          </h1>
          <p className="text-muted-foreground">
            Add a new warehouse to your inventory management system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the basic details for your warehouse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Warehouse Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter warehouse name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    handleInputChange("capacity", parseInt(e.target.value) || 0)
                  }
                  placeholder="Enter capacity"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter warehouse description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              {addressSelected 
                ? "Address automatically filled from map selection" 
                : "Address will be automatically filled when you select a location on the map below"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {addressSelected && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Address details have been automatically filled from your map selection. You can manually edit them if needed.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={addressSelected ? "Auto-filled from map" : "Will be filled from map selection"}
                required
                className={addressSelected ? "bg-green-50 border-green-200" : ""}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder={addressSelected ? "Auto-filled from map" : "Will be filled from map"}
                  required
                  className={addressSelected ? "bg-green-50 border-green-200" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder={addressSelected ? "Auto-filled from map" : "Will be filled from map"}
                  required
                  className={addressSelected ? "bg-green-50 border-green-200" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder={addressSelected ? "Auto-filled from map" : "Will be filled from map"}
                  required
                  className={addressSelected ? "bg-green-50 border-green-200" : ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder={addressSelected ? "Auto-filled from map" : "Will be filled from map"}
                required
                className={addressSelected ? "bg-green-50 border-green-200" : ""}
              />
            </div>
            
            {formData.latitude && formData.longitude && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "latitude",
                        e.target.value ? parseFloat(e.target.value) : 0
                      )
                    }
                    placeholder="Auto-filled from map"
                    className="bg-green-50 border-green-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "longitude",
                        e.target.value ? parseFloat(e.target.value) : 0
                      )
                    }
                    placeholder="Auto-filled from map"
                    className="bg-green-50 border-green-200"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Provide contact details for the warehouse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Maps Location Picker */}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <GoogleMapsWarehousePicker
            onAddressSelect={handleGoogleMapsAddressSelect}
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          />
        ) : (
          <Card>
            <CardContent className="p-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Google Maps API key is not configured.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Images</CardTitle>
            <CardDescription>
              Upload images of your warehouse (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images">Upload Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Warehouse"}
          </Button>
        </div>
      </form>
    </div>
  );
}
