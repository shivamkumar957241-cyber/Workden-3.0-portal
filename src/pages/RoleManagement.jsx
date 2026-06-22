import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, UserCog, ArrowLeft, Crown, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RoleManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };
    loadCurrentUser();
  }, []);

  const { data: users = [] } = useQuery({ 
    queryKey: ['all-users'], 
    queryFn: () => base44.entities.User.list(), 
    initialData: [] 
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      return await base44.entities.User.update(userId, { role });
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['all-users'] }); 
      alert("✅ Role updated successfully!"); 
    },
    onError: (error) => {
      console.error("Error updating role:", error);
      alert("❌ Failed to update role. Please try again.");
    }
  });

  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    return u.full_name?.toLowerCase().includes(query) || 
           u.email?.toLowerCase().includes(query) || 
           u.user_id?.toLowerCase().includes(query);
  });

  const adminUsers = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role !== 'admin');

  // Check if current user is admin
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-6 pb-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to={createPageUrl("AdminPanel")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Role Management</h1>
            <p className="text-sm text-slate-600">Manage User Roles & Permissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <Crown className="w-10 h-10 mb-2" />
              <p className="text-sm opacity-90">Admin Users</p>
              <p className="text-3xl font-bold">{adminUsers.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <Users className="w-10 h-10 mb-2" />
              <p className="text-sm opacity-90">Regular Users</p>
              <p className="text-3xl font-bold">{regularUsers.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <Input 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="max-w-md mt-3" 
            />
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${u.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'} text-white flex items-center justify-center font-bold text-xs`}>
                            {u.full_name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{u.full_name || 'No Name'}</p>
                            <p className="text-xs text-gray-500">{u.user_id || 'No ID'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {u.role === 'admin' ? <Crown className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                          {u.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {u.created_date ? new Date(u.created_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={u.role || 'user'} 
                          onValueChange={(role) => {
                            if (confirm(`Change ${u.full_name || u.email}'s role to ${role}?`)) {
                              updateRoleMutation.mutate({ userId: u.id, role });
                            }
                          }}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">👤 User</SelectItem>
                            <SelectItem value="admin">👑 Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Role Permissions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">Admin</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-7">
                  <li>✓ Access Admin Panel</li>
                  <li>✓ Manage Users & Tasks</li>
                  <li>✓ Approve/Reject Work</li>
                  <li>✓ Manage Withdrawals</li>
                  <li>✓ Send Notifications</li>
                  <li>✓ Wallet Management</li>
                  <li>✓ View Analytics</li>
                  <li>✓ Role Management</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">User</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-7">
                  <li>✓ View Assigned Tasks</li>
                  <li>✓ Submit Work</li>
                  <li>✓ View Wallet & Earnings</li>
                  <li>✓ Request Withdrawals</li>
                  <li>✓ Chat with Admin</li>
                  <li>✓ View Profile & Stats</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}