"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Clock, 
  Package,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { ReturnRequestDTO, ReturnDecisionDTO } from '@/types/return';
import returnService from '@/services/returnService';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

export default function ReturnRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnRequestId = params.id as string;

  const [returnRequest, setReturnRequest] = useState<ReturnRequestDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');

  const fetchReturnRequest = async () => {
    try {
      setLoading(true);
      const data = await returnService.getReturnRequestById(String(returnRequestId));
      setReturnRequest(data);
    } catch (error) {
      console.error('Failed to fetch return request:', error);
      toast.error('Failed to load return request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (returnRequestId) {
      fetchReturnRequest();
    }
  }, [returnRequestId]);

  const handleDecision = async (decision: 'APPROVED' | 'DENIED') => {
    if (!returnRequest) return;

    try {
      setProcessing(true);
      const decisionData: ReturnDecisionDTO = {
        returnRequestId: returnRequest.id,
        decision,
        decisionNotes: decisionNotes.trim() || undefined,
      };

      await returnService.reviewReturnRequest(decisionData);
      toast.success(`Return request ${decision.toLowerCase()} successfully`);
      
      // Refresh the data
      await fetchReturnRequest();
      setDecisionNotes('');
    } catch (error) {
      console.error('Failed to process decision:', error);
      toast.error('Failed to process decision');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      APPROVED: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      DENIED: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      COMPLETED: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="secondary">{status}</Badge>;

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateTotalRefundAmount = () => {
    if (!returnRequest) return 0;
    return returnRequest.returnItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const canMakeDecision = returnRequest?.status === 'PENDING';

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading return request details...</span>
        </div>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Return request not found</h3>
          <p className="text-muted-foreground mb-4">
            The return request you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/dashboard/returns">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Return Requests
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/returns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Return Request #{String(returnRequest.id).slice(-8)}
            </h1>
            <p className="text-muted-foreground">
              Order {returnRequest.orderNumber} • Submitted {formatDistanceToNow(new Date(returnRequest.submittedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(returnRequest.status)}
          <Button onClick={fetchReturnRequest} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Return Items ({returnRequest.returnItems.length})
              </CardTitle>
              <CardDescription>
                Items requested for return with quantities and reasons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnRequest.returnItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{item.productName}</h4>
                            {item.variantName && (
                              <p className="text-sm text-muted-foreground">
                                Variant: {item.variantName}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Quantity: {item.returnQuantity} of {item.maxQuantity}</span>
                              <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(item.totalPrice)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Refund
                            </div>
                          </div>
                        </div>
                        {item.itemReason && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium mb-1">Reason for return:</p>
                            <p className="text-sm">{item.itemReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total Refund Amount:</span>
                <span className="text-green-600">
                  {formatCurrency(calculateTotalRefundAmount())}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Return Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Return Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p>{returnRequest.reason}</p>
              </div>
            </CardContent>
          </Card>

          {/* Media Attachments */}
          {returnRequest.returnMedia && returnRequest.returnMedia.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Media Attachments ({returnRequest.returnMedia.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {returnRequest.returnMedia.map((media) => (
                    <div key={media.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {media.fileType.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : (
                          <Video className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {media.fileType.split('/')[1].toUpperCase()}
                        </span>
                      </div>
                      {media.fileType.startsWith('image/') && (
                        <img
                          src={media.fileUrl}
                          alt="Return media"
                          className="w-full h-24 object-cover rounded-md mb-2"
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(media.uploadedAt), 'MMM dd, yyyy')}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <a href={media.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Decision Section */}
          {canMakeDecision && (
            <Card>
              <CardHeader>
                <CardTitle>Make Decision</CardTitle>
                <CardDescription>
                  Review the return request and make a decision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Decision Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="Add notes about your decision..."
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleDecision('APPROVED')}
                      disabled={processing}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Return
                    </Button>
                    <Button
                      onClick={() => handleDecision('DENIED')}
                      disabled={processing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Deny Return
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {returnRequest.customerName || 'Guest User'}
                </span>
              </div>
              {returnRequest.customerEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{returnRequest.customerEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Order: {returnRequest.orderNumber}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Return Requested</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(returnRequest.submittedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {returnRequest.decisionAt && (
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    returnRequest.status === 'APPROVED' ? 'bg-green-600' : 'bg-red-600'
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm">
                      {returnRequest.status === 'APPROVED' ? 'Approved' : 'Decision Made'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(returnRequest.decisionAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {returnRequest.decisionNotes && (
                      <p className="text-xs mt-1 p-2 bg-muted rounded">
                        {returnRequest.decisionNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return Appeal */}
          {returnRequest.returnAppeal && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Appeal Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Appeal Reason:</p>
                    <p className="text-sm text-muted-foreground">
                      {returnRequest.returnAppeal.reason}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Submitted:</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(returnRequest.returnAppeal.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {returnRequest.returnAppeal.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
