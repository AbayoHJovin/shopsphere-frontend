"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  MessageSquareX,
  FileText,
  User,
  Package,
  AlertCircle,
  MoreHorizontal,
  ExternalLink,
  Image,
  Video,
  File,
} from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import appealService, { AppealDTO, AppealFilterParams, AppealDecisionDTO } from "@/lib/services/appeal-service";

export default function AppealsPage() {
  const [filters, setFilters] = useState<AppealFilterParams>({
    page: 0,
    size: 10,
    sortBy: "submittedAt",
    sortDirection: "DESC"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppeal, setSelectedAppeal] = useState<AppealDTO | null>(null);
  const [decisionDialog, setDecisionDialog] = useState<{ open: boolean; appeal: AppealDTO | null }>({
    open: false,
    appeal: null
  });
  const [decisionNotes, setDecisionNotes] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const queryClient = useQueryClient();

  // Fetch appeals data
  const { data: appealsData, isLoading, error } = useQuery({
    queryKey: ["appeals", filters],
    queryFn: () => appealService.getAllAppeals(filters),
  });

  // Fetch appeal stats
  const { data: stats } = useQuery({
    queryKey: ["appeal-stats"],
    queryFn: () => appealService.getAppealStats(),
  });

  // Review appeal mutation
  const reviewMutation = useMutation({
    mutationFn: (decisionData: AppealDecisionDTO) => appealService.reviewAppeal(decisionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appeals"] });
      queryClient.invalidateQueries({ queryKey: ["appeal-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pending-appeals-count"] });
      toast.success("Appeal decision submitted successfully");
      setDecisionDialog({ open: false, appeal: null });
      setDecisionNotes("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit decision");
    },
  });

  const handleFilterChange = (key: keyof AppealFilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setFilters(prev => ({ 
        ...prev, 
        customerName: searchTerm.includes("@") ? undefined : searchTerm,
        orderCode: searchTerm.startsWith("#") ? searchTerm.substring(1) : undefined,
        page: 0 
      }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        customerName: undefined, 
        orderCode: undefined, 
        page: 0 
      }));
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setFilters(prev => ({
      ...prev,
      fromDate: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
      toDate: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
      page: 0
    }));
  };

  const handleDecision = (decision: "APPROVED" | "DENIED") => {
    if (!decisionDialog.appeal) return;

    reviewMutation.mutate({
      appealId: decisionDialog.appeal.id,
      decision,
      decisionNotes: decisionNotes.trim() || undefined
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "APPROVED":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "DENIED":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportAppeals = async () => {
    try {
      const blob = await appealService.exportAppeals(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `appeals-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Appeals exported successfully");
    } catch (error) {
      toast.error("Failed to export appeals");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Appeals</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquareX className="h-8 w-8 text-primary" />
            Appeals Management
          </h1>
          <p className="text-muted-foreground">
            Review and manage customer return request appeals
          </p>
        </div>
        <Button onClick={exportAppeals} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appeals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingAppeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedAppeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Denied</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.deniedAppeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProcessingDays}d</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Customer name or #order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DENIED">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  page: 0,
                  size: 10,
                  sortBy: "submittedAt",
                  sortDirection: "DESC"
                });
                setSearchTerm("");
                setDateRange(undefined);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appeals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appeals ({appealsData?.totalElements || 0})</CardTitle>
          <CardDescription>
            Showing {appealsData?.content.length || 0} of {appealsData?.totalElements || 0} appeals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Appeal ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reason</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Level</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Submitted</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appealsData?.content.map((appeal) => (
                    <tr key={appeal.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="font-medium">#{appeal.id}</div>
                        <div className="text-sm text-muted-foreground">Return #{appeal.returnRequestId}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{appeal.returnRequest?.customerName || "Guest Customer"}</div>
                            <div className="text-sm text-muted-foreground">{appeal.returnRequest?.customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">#{appeal.returnRequest?.orderCode}</div>
                            <div className="text-sm text-muted-foreground">Order #{appeal.returnRequest?.orderId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{appeal.reason}</div>
                          {appeal.description && (
                            <div className="text-sm text-muted-foreground truncate">{appeal.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {getStatusBadge(appeal.status)}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline">Level {appeal.level}</Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm">
                          {format(new Date(appeal.submittedAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(appeal.submittedAt), "HH:mm")}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAppeal(appeal)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {appeal.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDecisionDialog({ open: true, appeal })}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {appealsData && appealsData.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {(appealsData.number || 0) + 1} of {appealsData.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("page", Math.max(0, (filters.page || 0) - 1))}
                  disabled={appealsData.first}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("page", (filters.page || 0) + 1)}
                  disabled={appealsData.last}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appeal Detail Dialog */}
      <Dialog open={!!selectedAppeal} onOpenChange={() => setSelectedAppeal(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appeal Details - #{selectedAppeal?.id}</DialogTitle>
            <DialogDescription>
              Review complete appeal information and media attachments
            </DialogDescription>
          </DialogHeader>
          {selectedAppeal && (
            <div className="space-y-6">
              {/* Appeal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Appeal Status</Label>
                  <div>{getStatusBadge(selectedAppeal.status)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Appeal Level</Label>
                  <Badge variant="outline">Level {selectedAppeal.level}</Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Customer</Label>
                  <div>
                    <div className="font-medium">{selectedAppeal.returnRequest?.customerName || "Guest Customer"}</div>
                    <div className="text-sm text-muted-foreground">{selectedAppeal.returnRequest?.customerEmail}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Order</Label>
                  <div>
                    <div className="font-medium">#{selectedAppeal.returnRequest?.orderCode}</div>
                    <div className="text-sm text-muted-foreground">Order #{selectedAppeal.returnRequest?.orderId}</div>
                  </div>
                </div>
              </div>

              {/* Return Request Link */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Related Return Request</h4>
                    <p className="text-sm text-blue-700">View the original return request that was appealed</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => window.open(`/dashboard/returns/${selectedAppeal.returnRequestId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Return Request
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Appeal Content */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Appeal Reason</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {selectedAppeal.reason}
                  </div>
                </div>
                {selectedAppeal.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      {selectedAppeal.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Media Attachments */}
              {selectedAppeal.appealMedia && selectedAppeal.appealMedia.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Media Attachments ({selectedAppeal.appealMedia.length})</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedAppeal.appealMedia.map((media) => {
                        const isImage = media.fileType?.toLowerCase().includes('image') || 
                                       media.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
                        const isVideo = media.fileType?.toLowerCase().includes('video') || 
                                       media.fileName?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);
                        
                        return (
                          <div key={media.id} className="border rounded-lg overflow-hidden bg-white">
                            {/* Media Preview */}
                            <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                              {isImage ? (
                                <img
                                  src={media.fileUrl}
                                  alt={media.fileName}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => window.open(media.fileUrl, '_blank')}
                                />
                              ) : isVideo ? (
                                <div className="relative w-full h-full">
                                  <video
                                    src={media.fileUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                    preload="metadata"
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                  <File className="h-12 w-12 mb-2" />
                                  <span className="text-sm">File</span>
                                </div>
                              )}
                              
                              {/* File Type Badge */}
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="text-xs">
                                  {isImage ? (
                                    <><Image className="h-3 w-3 mr-1" />IMG</>
                                  ) : isVideo ? (
                                    <><Video className="h-3 w-3 mr-1" />VID</>
                                  ) : (
                                    <><File className="h-3 w-3 mr-1" />FILE</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* File Info */}
                            <div className="p-3">
                              <div className="text-sm font-medium truncate mb-1">{media.fileName}</div>
                              <div className="text-xs text-muted-foreground mb-2">{media.fileType}</div>
                              <div className="text-xs text-muted-foreground mb-3">
                                Uploaded: {format(new Date(media.uploadedAt), "MMM dd, yyyy HH:mm")}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(media.fileUrl, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-2" />
                                Open in New Tab
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Decision Info */}
              {selectedAppeal.decisionAt && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Decision Information</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Decision Date</Label>
                        <div>{format(new Date(selectedAppeal.decisionAt), "MMM dd, yyyy HH:mm")}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <div>{getStatusBadge(selectedAppeal.status)}</div>
                      </div>
                    </div>
                    {selectedAppeal.decisionNotes && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Decision Notes</Label>
                        <div className="p-3 bg-muted rounded-lg">
                          {selectedAppeal.decisionNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog open={decisionDialog.open} onOpenChange={(open) => setDecisionDialog({ open, appeal: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Appeal Decision</DialogTitle>
            <DialogDescription>
              Review and decide on appeal #{decisionDialog.appeal?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Decision Notes (Optional)</Label>
              <Textarea
                placeholder="Add notes about your decision..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDecisionDialog({ open: false, appeal: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDecision("DENIED")}
                disabled={reviewMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deny Appeal
              </Button>
              <Button
                onClick={() => handleDecision("APPROVED")}
                disabled={reviewMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Appeal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
