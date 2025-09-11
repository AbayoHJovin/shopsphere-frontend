"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Mail,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import adminInvitationService, {
  AdminInvitationDTO,
  CreateAdminInvitationDTO,
} from "@/lib/services/admin-invitation-service";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<AdminInvitationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("EMPLOYEE");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [invitePosition, setInvitePosition] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteNotes, setInviteNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load invitations
  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await adminInvitationService.getAllInvitations();

      if (response.success && response.data) {
        // Backend returns invitations directly in data array, not in data.content
        setInvitations(response.data || []);
      } else {
        toast.error(response.message || "Failed to load invitations");
        setInvitations([]);
      }
    } catch (error) {
      toast.error("Failed to load invitations");
      console.error("Error loading invitations:", error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setInviteEmail("");
    setInviteFirstName("");
    setInviteLastName("");
    setInviteRole("EMPLOYEE");
    setInviteMessage("");
    setInviteDepartment("");
    setInvitePosition("");
    setInvitePhone("");
    setInviteNotes("");
  };

  // Handle create invitation
  const handleCreateInvitation = async () => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName || !inviteRole) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const invitationData: CreateAdminInvitationDTO = {
        email: inviteEmail,
        firstName: inviteFirstName,
        lastName: inviteLastName,
        assignedRole: inviteRole,
        invitationMessage: inviteMessage || undefined,
        department: inviteDepartment || undefined,
        position: invitePosition || undefined,
        phoneNumber: invitePhone || undefined,
        notes: inviteNotes || undefined,
      };

      const response = await adminInvitationService.createInvitation(
        invitationData
      );

      if (response.success) {
        toast.success("Invitation sent successfully");
        setIsInviteDialogOpen(false);
        resetForm();
        loadInvitations();
      } else {
        toast.error(response.message || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("Failed to send invitation");
      console.error("Error creating invitation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadInvitations();
  }, []);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "default" as const, icon: Clock },
      ACCEPTED: { variant: "default" as const, icon: CheckCircle },
      DECLINED: { variant: "destructive" as const, icon: XCircle },
      EXPIRED: { variant: "secondary" as const, icon: AlertTriangle },
      CANCELLED: { variant: "outline" as const, icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { variant: "default" as const, icon: ShieldCheck },
      EMPLOYEE: { variant: "secondary" as const, icon: Users },
      CUSTOMER: { variant: "outline" as const, icon: Users },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.EMPLOYEE;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Invitations
          </h1>
          <p className="text-muted-foreground">
            Manage admin invitations and track their status
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invitations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.invitationId}>
                    <TableCell className="font-medium">
                      {invitation.email}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(invitation.assignedRole)}
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {invitation.invitedByName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invitation.invitedByEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                    <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No invitations found
              </h3>
              <p className="text-muted-foreground mb-4">
                You haven't sent any admin invitations yet.
              </p>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Send Your First Invitation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Invitation Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Admin Invitation</DialogTitle>
            <DialogDescription>
              Invite a new admin or employee to join your team. All required
              fields must be filled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-destructive">
                Required Fields
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-sm font-medium">
                    Assigned Role *
                  </Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="DELIVERY_AGENT">Delivery Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Optional Fields
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g., IT, Marketing, Sales"
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="position" className="text-sm font-medium">
                    Position
                  </Label>
                  <Input
                    id="position"
                    placeholder="e.g., Manager, Developer, Analyst"
                    value={invitePosition}
                    onChange={(e) => setInvitePosition(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium">
                  Invitation Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message to the invitation..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Internal Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any internal notes about this invitation..."
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsInviteDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvitation}
              disabled={
                isSubmitting ||
                !inviteEmail ||
                !inviteFirstName ||
                !inviteLastName ||
                !inviteRole
              }
            >
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
