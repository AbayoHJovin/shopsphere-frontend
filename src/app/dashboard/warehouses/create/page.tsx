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

export default function CreateWarehousePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [coordinatesLocked, setCoordinatesLocked] = useState(false);
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

  // Geocoding function
  const fetchCoordinates = async (
    address: string,
    city: string,
    country: string
  ) => {
    if (!address || !city || !country) return;

    setIsGeocoding(true);
    setGeocodingError(null);

    try {
      // Clean and encode the address components
      const cleanAddress = address.replace(/\s+/g, "+");
      const cleanCity = city.replace(/\s+/g, "+");
      const cleanCountry = country.replace(/\s+/g, "+");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?street=${cleanAddress}&city=${cleanCity}&country=${cleanCountry}&format=json&limit=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch coordinates");
      }

      const data = await response.json();

      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        // Validate coordinates (basic sanity check)
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lon,
          }));
          setCoordinatesLocked(true);
          toast({
            title: "Coordinates Found",
            description: `Location coordinates automatically set: ${lat.toFixed(
              6
            )}, ${lon.toFixed(6)}`,
          });
        } else {
          throw new Error("Invalid coordinates received");
        }
      } else {
        throw new Error("No coordinates found for this address");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeocodingError(
        "Unable to find coordinates for this address. Please verify the address details."
      );
      setCoordinatesLocked(false);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Effect to trigger geocoding when address fields change
  useEffect(() => {
    const { address, city, country } = formData;

    // Only trigger if all three fields are filled and coordinates are not locked
    if (address && city && country && !coordinatesLocked) {
      const timeoutId = setTimeout(() => {
        fetchCoordinates(address, city, country);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [formData.address, formData.city, formData.country, coordinatesLocked]);

  const handleInputChange = (
    field: keyof CreateWarehouseDTO,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset coordinates when address fields change
    if (field === "address" || field === "city" || field === "country") {
      setCoordinatesLocked(false);
      setGeocodingError(null);
      if (coordinatesLocked) {
        setFormData((prev) => ({
          ...prev,
          latitude: undefined,
          longitude: undefined,
        }));
      }
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
              Provide the complete address for your warehouse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter street address"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="Enter zip code"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Enter country"
                required
              />
            </div>
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

        {/* Location Coordinates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Coordinates
            </CardTitle>
            <CardDescription>
              {coordinatesLocked
                ? "Coordinates automatically detected from address"
                : "Coordinates will be automatically detected when address fields are filled"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Geocoding Status */}
            {isGeocoding && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Searching for coordinates...
                </AlertDescription>
              </Alert>
            )}

            {geocodingError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{geocodingError}</AlertDescription>
              </Alert>
            )}

            {coordinatesLocked && formData.latitude && formData.longitude && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Coordinates found: {formData.latitude.toFixed(6)},{" "}
                  {formData.longitude.toFixed(6)}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Enter latitude"
                  disabled={coordinatesLocked}
                  className={coordinatesLocked ? "bg-muted" : ""}
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
                  placeholder="Enter longitude"
                  disabled={coordinatesLocked}
                  className={coordinatesLocked ? "bg-muted" : ""}
                />
              </div>
            </div>

            {coordinatesLocked && (
              <div className="text-sm text-muted-foreground">
                Coordinates are automatically locked. Change the address fields
                to unlock and search for new coordinates.
              </div>
            )}
          </CardContent>
        </Card>

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
                      className="w-full h-24 object-cover rounded-md"
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
