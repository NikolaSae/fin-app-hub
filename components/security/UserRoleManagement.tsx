// Path: components/security/UserRoleManagement.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Search } from "lucide-react";

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: Date | null;
  isActive: boolean;
  createdAt: Date;
};

type Role = {
  id: string;
  name: string;
};

export default function UserRoleManagement() {
  // State for users and roles
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  // State for role change confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  
  // State for verification dialog
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [userToVerify, setUserToVerify] = useState<string>("");
  
  // Get toast function
  // const { toast } = useToast();

  // Fetch users and roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles
        const rolesResponse = await fetch('/api/roles');
        if (!rolesResponse.ok) throw new Error('Failed to fetch roles');
        const rolesData = await rolesResponse.json();
        setRoles(rolesData);
        
        // Fetch users
        await fetchUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch users with pagination and search
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `/api/users?page=${currentPage}&limit=${usersPerPage}&search=${searchQuery}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / usersPerPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Effect to fetch users when page or search changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }

      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: "Role updated",
        description: `${selectedUser.name}'s role has been updated to ${newRole}`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Failed to update role",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setDialogOpen(false);
      setSelectedUser(null);
      setNewRole("");
    }
  };
  
  // Open verification dialog
  const handleVerifyUser = (userId: string) => {
    setUserToVerify(userId);
    setVerifyDialogOpen(true);
  };
  
  // Handle user verification
  const confirmVerifyUser = async () => {
    if (!userToVerify) return;
    
    try {
      const response = await fetch(`/api/users/${userToVerify}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          emailVerified: new Date().toISOString() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify user');
      }

      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userToVerify ? { ...user, emailVerified: new Date() } : user
        )
      );

      toast({
        title: "User verified",
        description: "The user's email has been verified successfully",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Failed to verify user",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setVerifyDialogOpen(false);
      setUserToVerify("");
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Open dialog to change role
  const openRoleChangeDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading user data...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={() => { setError(null); fetchUsers(); }}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchQuery("");
              fetchUsers();
            }}
          >
            Reset
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchQuery("unverified:");
              setCurrentPage(1);
            }}
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800"
          >
            Show Unverified Only
          </Button>
        </div>
      </div>
      
      {/* Users table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "ADMIN" 
                        ? "bg-red-100 text-red-800" 
                        : user.role === "MANAGER" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-green-100 text-green-800"
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRoleChangeDialog(user)}
                      >
                        Change Role
                      </Button>
                      {!user.emailVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
                          onClick={() => handleVerifyUser(user.id)}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {users.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Role change confirmation dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <>
                  You are changing the role for <strong>{selectedUser.name}</strong>.
                  This will affect their permissions and access in the system.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium">
              Select new role:
            </label>
            <Select
              value={newRole}
              onValueChange={setNewRole}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRoleChange}
              disabled={!newRole || (selectedUser && newRole === selectedUser.role)}
            >
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* User verification confirmation dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify User Email</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to manually verify this user's email address. 
              This will grant them full access to the system based on their role.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmVerifyUser}
              className="bg-green-600 hover:bg-green-700"
            >
              Verify User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}