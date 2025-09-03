"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X, Search, ChevronDown, Loader2 } from "lucide-react";
import { brandService } from "@/lib/services/brand-service";
import { BrandResponse } from "@/lib/types/brand";

interface BrandDropdownProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

export function BrandDropdown({
  value,
  onValueChange,
  placeholder = "Select Brand",
  label = "Brand",
  required = false,
  error,
}: BrandDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const pageSize = 5; // Display 5 brands per page

  // Fetch brands with pagination
  const {
    data: brandsData,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ["brands", currentPage, pageSize, "brandName", "asc"],
    queryFn: () =>
      brandService.getAllBrands(currentPage, pageSize, "brandName", "asc"),
    enabled: isOpen,
  });

  // Search brands
  const {
    data: searchData,
    isLoading: isSearching,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["brands-search", searchQuery],
    queryFn: () =>
      brandService.searchBrands({
        brandName: searchQuery,
        page: 0,
        size: 100, // Get more results for search
      }),
    enabled: searchQuery.length > 0 && isOpen,
  });

  const brands =
    searchQuery.length > 0
      ? searchData?.content || []
      : brandsData?.content || [];
  const totalPages =
    searchQuery.length > 0
      ? searchData?.totalPages || 0
      : brandsData?.totalPages || 0;
  console.log("Value", value);
  // Get selected brand name
  const selectedBrand = brands.find((brand) => brand.id === value);

  // Handle search
  useEffect(() => {
    if (searchQuery.length > 0) {
      refetchSearch();
    }
  }, [searchQuery, refetchSearch]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleBrandSelect = (brandId: string) => {
    onValueChange(brandId);
    setIsOpen(false);
    setSearchQuery("");
    setCurrentPage(0);
  };

  const handleClearSelection = () => {
    onValueChange("");
    setSearchQuery("");
    setCurrentPage(0);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 3;

    let startPage = Math.max(0, currentPage - 1);
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="h-6 px-2 text-xs"
        >
          {i + 1}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="h-6 px-2 text-xs"
        >
          ←
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="h-6 px-2 text-xs"
        >
          →
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between border-primary/20 focus-visible:ring-primary"
          >
            {selectedBrand ? selectedBrand.brandName : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {isLoading || isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading brands...
                </span>
              </div>
            ) : isError ? (
              <div className="p-4 text-center text-sm text-destructive">
                Failed to load brands
              </div>
            ) : brands.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery ? "No brands found" : "No brands available"}
              </div>
            ) : (
              <>
                <div className="p-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => handleBrandSelect(brand.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{brand.brandName}</span>
                        {brand.description && (
                          <span className="text-xs text-muted-foreground">
                            {brand.description}
                          </span>
                        )}
                      </div>
                      {brand.id === value && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {!searchQuery && renderPagination()}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected brand badge */}
      {selectedBrand && (
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="secondary"
            className="pl-2 pr-1 py-1 flex items-center gap-1"
          >
            {selectedBrand.brandName}
            <h1>waht</h1>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 rounded-full"
              onClick={handleClearSelection}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
