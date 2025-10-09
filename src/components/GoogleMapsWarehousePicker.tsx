"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Loader2, Navigation, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Google Maps types
declare global {
  interface Window {
    google: any;
    initWarehouseMap: () => void;
  }
}

interface WarehouseAddressDetails {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface GoogleMapsWarehousePickerProps {
  onAddressSelect: (address: WarehouseAddressDetails) => void;
  apiKey: string;
  initialLocation?: { lat: number; lng: number };
}

export function GoogleMapsWarehousePicker({
  onAddressSelect,
  apiKey,
  initialLocation,
}: GoogleMapsWarehousePickerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<WarehouseAddressDetails | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const geocoderInstance = useRef<any>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  // Load Google Maps script
  useEffect(() => {
    console.log("Google Maps API Key:", apiKey ? "Present" : "Missing");
    
    if (!apiKey) {
      console.error("Google Maps API key is missing");
      toast({
        title: "Configuration Error",
        description: "Google Maps API key is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    if (window.google) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script is already loading, wait for it
      const checkGoogleMaps = setInterval(() => {
        if (window.google) {
          setIsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 100);
      return () => clearInterval(checkGoogleMaps);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initWarehouseMap`;
    script.async = true;
    script.defer = true;

    // Set up callback
    window.initWarehouseMap = () => {
      console.log("Google Maps loaded successfully");
      setIsLoaded(true);
    };

    // Handle script load errors
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      toast({
        title: "Maps Loading Error",
        description: "Failed to load Google Maps. Please check your internet connection and API key.",
        variant: "destructive",
      });
    };

    // Add timeout for loading
    const loadTimeout = setTimeout(() => {
      if (!window.google) {
        console.error("Google Maps script loading timeout");
        toast({
          title: "Maps Loading Timeout",
          description: "Google Maps is taking too long to load. Please refresh the page and try again.",
          variant: "destructive",
        });
      }
    }, 10000); // 10 second timeout

    document.head.appendChild(script);

    return () => {
      clearTimeout(loadTimeout);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Clean up callback
      if ('initWarehouseMap' in window) {
        try {
          delete (window as any).initWarehouseMap;
        } catch {
          (window as any).initWarehouseMap = undefined;
        }
      }
    };
  }, [apiKey]);

  // Initialize map when loaded
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance.current) {
      initializeMap();
    }
  }, [isLoaded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (
        searchInputRef.current?.contains(target) ||
        suggestionContainerRef.current?.contains(target)
      ) {
        return;
      }
      
      setShowSuggestions(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initializeMap = useCallback(() => {
    console.log("Initializing map...");
    
    if (!window.google) {
      console.error("Google Maps API not loaded");
      toast({
        title: "Maps Error",
        description: "Google Maps API is not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (!mapRef.current) {
      console.error("Map container not available");
      return;
    }

    if (mapInstance.current) {
      console.log("Map already initialized");
      return;
    }

    try {
      console.log("Creating map instance...");
      
      // Default to Rwanda (Kigali) or provided initial location
      const defaultLocation = initialLocation || { lat: -1.9441, lng: 30.0619 };
      console.log("Using default location:", defaultLocation);

      // Initialize map
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.SATELLITE,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_CENTER,
          mapTypeIds: [
            window.google.maps.MapTypeId.ROADMAP,
            window.google.maps.MapTypeId.SATELLITE,
            window.google.maps.MapTypeId.HYBRID,
            window.google.maps.MapTypeId.TERRAIN
          ]
        },
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      console.log("Map created successfully");

      // Initialize services
      try {
        geocoderInstance.current = new window.google.maps.Geocoder();
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(mapInstance.current);
        console.log("Google Maps services initialized");
      } catch (serviceError) {
        console.error("Error initializing Google Maps services:", serviceError);
      }

      // Initialize marker
      try {
        markerInstance.current = new window.google.maps.Marker({
          position: defaultLocation,
          map: mapInstance.current,
          draggable: true,
          title: "Warehouse Location - Drag to adjust",
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="#FFFFFF" stroke-width="3"/>
                <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
                <circle cx="20" cy="20" r="4" fill="#2563eb"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          },
          animation: window.google.maps.Animation.DROP
        });
        console.log("Marker created successfully");
      } catch (markerError) {
        console.error("Error creating marker:", markerError);
        // Create a simple marker as fallback
        markerInstance.current = new window.google.maps.Marker({
          position: defaultLocation,
          map: mapInstance.current,
          draggable: true,
          title: "Warehouse Location - Drag to adjust"
        });
      }

      console.log("Map initialization completed successfully");

    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Maps Initialization Error",
        description: `Failed to initialize map: ${errorMessage}. Please refresh the page and try again.`,
        variant: "destructive",
      });
      return;
    }

    // Add click listener to map
    mapInstance.current.addListener("click", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      markerInstance.current.setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    });

    // Add drag listener to marker
    markerInstance.current.addListener("dragend", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      reverseGeocode(lat, lng);
    });

    // Try to get user's current location
    getCurrentLocation();
  }, [initialLocation]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapInstance.current && markerInstance.current) {
          const location = { lat, lng };
          mapInstance.current.setCenter(location);
          mapInstance.current.setZoom(18);
          markerInstance.current.setPosition(location);
          
          markerInstance.current.setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => {
            if (markerInstance.current) {
              markerInstance.current.setAnimation(null);
            }
          }, 2000);
          
          reverseGeocode(lat, lng);
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Error",
          description: "Unable to get your current location",
          variant: "destructive",
        });
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoderInstance.current) return;

    geocoderInstance.current.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        if (status === "OK" && results[0]) {
          const addressDetails = parseGoogleAddressComponents(results[0], lat, lng);
          setSelectedAddress(addressDetails);
          setSearchValue(addressDetails.formattedAddress);
          
          // Auto-fill the form
          onAddressSelect(addressDetails);
        } else {
          toast({
            title: "Error",
            description: "Unable to get address for this location",
            variant: "destructive",
          });
        }
      }
    );
  };

  const parseGoogleAddressComponents = (result: any, lat: number, lng: number): WarehouseAddressDetails => {
    const components = result.address_components;
    let streetNumber = "";
    let streetName = "";
    let city = "";
    let state = "";
    let zipCode = "";
    let country = "";

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (types.includes("route")) {
        streetName = component.long_name;
      } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      } else if (types.includes("postal_code")) {
        zipCode = component.long_name;
      } else if (types.includes("country")) {
        country = component.long_name;
      }
    });

    const streetAddress = `${streetNumber} ${streetName}`.trim() || result.formatted_address.split(',')[0];

    return {
      streetAddress,
      city,
      state,
      zipCode,
      country,
      latitude: lat,
      longitude: lng,
      formattedAddress: result.formatted_address,
    };
  };

  // Handle search input changes and fetch suggestions
  const handleSearchInputChange = (value: string) => {
    setSearchValue(value);
    
    if (value.length > 2 && autocompleteService.current) {
      setIsSearching(true);
      
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: [] }
        },
        (predictions: any[], status: string) => {
          setIsSearching(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    setSearchValue(suggestion.description);
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setIsLoadingLocation(true);
    
    if (!placesService.current) {
      toast({
        title: "Error",
        description: "Maps service not available. Please try again.",
        variant: "destructive",
      });
      setIsLoadingLocation(false);
      return;
    }
    
    placesService.current.getDetails(
      { 
        placeId: suggestion.place_id,
        fields: ['geometry', 'address_components', 'formatted_address', 'name', 'types']
      },
      (place: any, status: string) => {
        setIsLoadingLocation(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          try {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            if (mapInstance.current && markerInstance.current) {
              const location = { lat, lng };
              mapInstance.current.setCenter(location);
              mapInstance.current.panTo(location);
              
              const zoomLevel = getZoomLevelForPlace(suggestion, place);
              setTimeout(() => {
                if (mapInstance.current) {
                  mapInstance.current.setZoom(zoomLevel);
                }
              }, 100);
              
              markerInstance.current.setPosition(location);
              markerInstance.current.setAnimation(window.google.maps.Animation.BOUNCE);
              setTimeout(() => {
                if (markerInstance.current) {
                  markerInstance.current.setAnimation(null);
                }
              }, 1500);
              
              const locationName = place.name || suggestion.structured_formatting?.main_text || 'selected location';
              toast({
                title: "Success",
                description: `Navigated to ${locationName}`,
              });
              
              setTimeout(() => {
                if (mapInstance.current) {
                  window.google.maps.event.trigger(mapInstance.current, 'resize');
                }
              }, 200);
            }
            
            const addressDetails = parseGooglePlaceDetails(place, lat, lng);
            setSelectedAddress(addressDetails);
            onAddressSelect(addressDetails);
            
          } catch (error) {
            console.error("Error processing place details:", error);
            toast({
              title: "Error",
              description: "Error processing location. Please try selecting again.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Error",
            description: "Could not get details for selected location.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const parseGooglePlaceDetails = (place: any, lat: number, lng: number): WarehouseAddressDetails => {
    const components = place.address_components || [];
    let streetNumber = "";
    let streetName = "";
    let city = "";
    let state = "";
    let zipCode = "";
    let country = "";

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (types.includes("route")) {
        streetName = component.long_name;
      } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      } else if (types.includes("postal_code")) {
        zipCode = component.long_name;
      } else if (types.includes("country")) {
        country = component.long_name;
      }
    });

    const streetAddress = `${streetNumber} ${streetName}`.trim() || place.formatted_address?.split(',')[0] || place.name;

    return {
      streetAddress,
      city,
      state,
      zipCode,
      country,
      latitude: lat,
      longitude: lng,
      formattedAddress: place.formatted_address || place.name,
    };
  };

  const getZoomLevelForPlace = (suggestion: any, place: any): number => {
    const types = place.types || suggestion.types || [];
    
    if (types.includes('country')) return 6;
    if (types.includes('administrative_area_level_1')) return 8;
    if (types.includes('locality') || types.includes('administrative_area_level_2')) return 12;
    if (types.includes('sublocality') || types.includes('neighborhood')) return 15;
    if (types.includes('establishment') || types.includes('point_of_interest') || types.includes('premise')) return 18;
    
    return 17;
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="ml-4">
              <div className="font-medium">Loading Google Maps...</div>
              <div className="text-sm text-muted-foreground mt-1">
                {!apiKey ? "API key missing" : "Initializing map services"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                API Key: {apiKey ? `${apiKey.substring(0, 10)}...` : "Not provided"}
              </div>
            </div>
          </div>
          {!apiKey && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                <strong>Configuration Error:</strong> Google Maps API key is not set. 
                Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Warehouse Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Box with Custom Dropdown */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="relative">
              <Input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search for warehouse location..."
                className="w-full pr-8"
                onFocus={() => {
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              {isSearching && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Custom Suggestions Dropdown */}
            {showSuggestions && (searchSuggestions.length > 0 || isSearching) && (
              <div 
                ref={suggestionContainerRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <div className="py-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Suggestions
                    </div>
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full text-left px-3 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {suggestion.structured_formatting?.main_text || suggestion.description}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {suggestion.structured_formatting?.secondary_text || suggestion.description}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Click to navigate
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <Button 
            onClick={getCurrentLocation} 
            variant="outline" 
            size="icon"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-[500px] rounded-lg border shadow-lg bg-gray-100"
            style={{ 
              minHeight: "500px",
              width: "100%",
              height: "500px"
            }}
          />
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg p-3 text-sm text-muted-foreground shadow-md border">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-medium">🛰️ Satellite View Active</span>
            </div>
            <div className="mt-1 text-xs">
              {isLoadingLocation ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Navigating to location...</span>
                </div>
              ) : (
                "Click anywhere on the map or drag the marker to select warehouse location"
              )}
            </div>
          </div>
        </div>

        {/* Selected Address Display */}
        {selectedAddress && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-800">Location Selected</h4>
            </div>
            <p className="text-sm text-green-700 mb-2">
              {selectedAddress.formattedAddress}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
              <div>
                <span className="font-medium">Address:</span> {selectedAddress.streetAddress}
              </div>
              <div>
                <span className="font-medium">City:</span> {selectedAddress.city}
              </div>
              <div>
                <span className="font-medium">State:</span> {selectedAddress.state}
              </div>
              <div>
                <span className="font-medium">Country:</span> {selectedAddress.country}
              </div>
              <div>
                <span className="font-medium">Coordinates:</span> {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
