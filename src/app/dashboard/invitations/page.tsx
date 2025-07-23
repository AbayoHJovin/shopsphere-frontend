"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Search, MoreHorizontal, Mail, Users, UserPlus, ShieldCheck, Trash, Clock, Edit, RefreshCw } from 'lucide-react';

// Mock data types
type Role = 'ADMIN' | 'CO_WORKER' | 'CUSTOMER';

interface Invitation {
  invitationId: string;
  email: string;
  role: Role;
  expiryDate: string;
  createdAt: string;
  inviterEmail: string;
  inviterUsername: string;
}

interface User {
  userId: string;
  username: string;
  email: string;
  role: Role;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

// Mock data for invitations
const mockInvitations: Invitation[] = [
  {
    invitationId: '1',
    email: 'john@example.com',
    role: 'ADMIN',
    expiryDate: '2024-06-01T12:00:00Z',
    createdAt: '2024-05-25T10:30:00Z',
    inviterEmail: 'admin@shopsphere.com',
    inviterUsername: 'MainAdmin'
  },
  {
    invitationId: '2',
    email: 'sarah@example.com',
    role: 'CO_WORKER',
    expiryDate: '2024-06-02T12:00:00Z',
    createdAt: '2024-05-26T09:15:00Z',
    inviterEmail: 'admin@shopsphere.com',
    inviterUsername: 'MainAdmin'
  },
  {
    invitationId: '3',
    email: 'mike@example.com',
    role: 'CUSTOMER',
    expiryDate: '2024-06-03T12:00:00Z',
    createdAt: '2024-05-27T14:45:00Z',
    inviterEmail: 'admin@shopsphere.com',
    inviterUsername: 'MainAdmin'
  }
];

// Mock data for users
const mockAdmins: User[] = [
  {
    userId: '1',
    username: 'admin',
    email: 'admin@shopsphere.com',
    role: 'ADMIN',
    profilePicture: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    active: true
  },
  {
    userId: '2',
    username: 'johnadmin',
    email: 'john@example.com',
    role: 'ADMIN',
    profilePicture: null,
    createdAt: '2024-05-26T10:30:00Z',
    updatedAt: '2024-05-26T10:30:00Z',
    active: true
  }
];

const mockCoWorkers: User[] = [
  {
    userId: '3',
    username: 'sarahcoworker',
    email: 'sarah@example.com',
    role: 'CO_WORKER',
    profilePicture: null,
    createdAt: '2024-05-27T09:15:00Z',
    updatedAt: '2024-05-27T09:15:00Z',
    active: true
  },
  {
    userId: '4',
    username: 'jamescoworker',
    email: 'james@example.com',
    role: 'CO_WORKER',
    profilePicture: null,
    createdAt: '2024-05-28T11:20:00Z',
    updatedAt: '2024-05-28T11:20:00Z',
    active: true
  }
];

export default function InvitationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('invitations');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('CO_WORKER');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [promoteRole, setPromoteRole] = useState<Role>('CO_WORKER');

  // Filter functions
  const filteredInvitations = mockInvitations.filter(invitation => 
    invitation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invitation.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invitation.inviterEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredAdmins = mockAdmins.filter(admin => 
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredCoWorkers = mockCoWorkers.filter(coWorker => 
    coWorker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coWorker.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions
  const handleInvite = () => {
    console.log('Inviting:', inviteEmail, 'as', inviteRole);
    // In a real app, this would call the API
    // POST /api/admin/management/invite
    setIsInviteDialogOpen(false);
    setInviteEmail('');
    setInviteRole('CO_WORKER');
  };

  const handleDelete = () => {
    console.log('Deleting item:', selectedItemId, 'from tab:', activeTab);
    // In a real app, this would call the API
    // DELETE /api/admin/management/invitations/{invitationId} or
    // DELETE /api/admin/management/users/{userId}
    setIsDeleteDialogOpen(false);
    setSelectedItemId(null);
  };

  const handlePromote = () => {
    console.log('Promoting user:', selectedItemId, 'to role:', promoteRole);
    // In a real app, this would call the API
    // PATCH /api/admin/management/users/{userId}/promote?role={role}
    setIsPromoteDialogOpen(false);
    setSelectedItemId(null);
    setPromoteRole('CO_WORKER');
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper function to get role badge
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'CO_WORKER':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Users className="w-3 h-3 mr-1" />
            Co-worker
          </Badge>
        );
      case 'CUSTOMER':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <UserPlus className="w-3 h-3 mr-1" />
            Customer
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Invitations</h1>
        <p className="text-muted-foreground mt-1">Manage user invitations and roles</p>
      </div>

      {/* Invite Button */}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by email, username, or role..."
            className="pl-8 border-primary/20 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsInviteDialogOpen(true)}
        >
          <Mail className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invitations" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="invitations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Mail className="w-4 h-4 mr-2" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="admins" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Admins
          </TabsTrigger>
          <TabsTrigger value="coworkers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Co-workers
          </TabsTrigger>
        </TabsList>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="mt-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="bg-primary/5 py-4">
              <CardTitle className="text-lg flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                List of all pending invitations sent to users
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitations.length > 0 ? (
                    filteredInvitations.map((invitation) => (
                      <TableRow key={invitation.invitationId}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                        <TableCell>{invitation.inviterUsername}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-amber-500" />
                            {formatDate(invitation.expiryDate)}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedItemId(invitation.invitationId);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Invitation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No invitations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins" className="mt-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="bg-primary/5 py-4">
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Admin Users
              </CardTitle>
              <CardDescription>
                List of all users with administrator access
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => (
                      <TableRow key={admin.userId}>
                        <TableCell className="font-medium">{admin.username}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          {admin.active ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(admin.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="focus:text-blue-500"
                                onClick={() => {
                                  setSelectedItemId(admin.userId);
                                  setPromoteRole('CO_WORKER');
                                  setIsPromoteDialogOpen(true);
                                }}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedItemId(admin.userId);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No admin users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Co-workers Tab */}
        <TabsContent value="coworkers" className="mt-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="bg-primary/5 py-4">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Co-worker Users
              </CardTitle>
              <CardDescription>
                List of all users with co-worker access
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoWorkers.length > 0 ? (
                    filteredCoWorkers.map((coWorker) => (
                      <TableRow key={coWorker.userId}>
                        <TableCell className="font-medium">{coWorker.username}</TableCell>
                        <TableCell>{coWorker.email}</TableCell>
                        <TableCell>
                          {coWorker.active ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(coWorker.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="focus:text-blue-500"
                                onClick={() => {
                                  setSelectedItemId(coWorker.userId);
                                  setPromoteRole('ADMIN');
                                  setIsPromoteDialogOpen(true);
                                }}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedItemId(coWorker.userId);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No co-worker users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user with specific role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                className="border-primary/20 focus-visible:ring-primary"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as Role)}>
                <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CO_WORKER">Co-worker</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Role Permissions:</p>
              {inviteRole === 'ADMIN' && (
                <p>Full access to all features, user management, and system settings.</p>
              )}
              {inviteRole === 'CO_WORKER' && (
                <p>Access to products, orders, and analytics, but not user management.</p>
              )}
              {inviteRole === 'CUSTOMER' && (
                <p>Access to customer portal only, can view orders and account settings.</p>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleInvite}
              className="bg-primary hover:bg-primary/90"
              disabled={!inviteEmail || !inviteRole}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Deletion</DialogTitle>
            <DialogDescription>
              {activeTab === 'invitations' 
                ? 'Are you sure you want to delete this invitation? This action cannot be undone.'
                : 'Are you sure you want to delete this user? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role and permissions for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="promote-role">New Role</Label>
              <Select value={promoteRole} onValueChange={(value) => setPromoteRole(value as Role)}>
                <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CO_WORKER">Co-worker</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Role Permissions:</p>
              {promoteRole === 'ADMIN' && (
                <p>Full access to all features, user management, and system settings.</p>
              )}
              {promoteRole === 'CO_WORKER' && (
                <p>Access to products, orders, and analytics, but not user management.</p>
              )}
              {promoteRole === 'CUSTOMER' && (
                <p>Access to customer portal only, can view orders and account settings.</p>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPromoteDialogOpen(false)}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handlePromote}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 