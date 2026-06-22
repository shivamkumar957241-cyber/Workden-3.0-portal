import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function InvoicesTab({ users, appUsers = [] }) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Combine platform users + AppUsers (admin/recruiter created), deduplicate
  const allUsers = [
    ...users.filter(u => u.role !== 'admin'),
    ...appUsers.filter(au => au.role !== 'admin' && !users.some(u => u.id === au.id))
  ];

  const subscribedUsers = allUsers.filter(u => u.is_subscribed && (
    !search || u.full_name?.toString().toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toString().toLowerCase().includes(search.toLowerCase()) ||
    u.user_id?.toString().toLowerCase().includes(search.toLowerCase()) ||
    u.login_user_id?.toString().toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Upload Invoice for Subscribed Users
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Input placeholder="Search by name, email, user ID..." className="mb-6" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="space-y-4">
          {subscribedUsers.map(u => (
            <Card key={u.id} className="border-2 border-gray-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900">{u.full_name}</p>
                    <p className="text-sm text-gray-600">Email: {u.email}</p>
                    <p className="text-sm text-gray-600">User ID: {u.user_id}</p>
                    <div className="mt-2 flex gap-2 flex-wrap text-xs">
                      <Badge className="bg-green-600">Subscribed</Badge>
                    </div>
                  </div>
                  {u.invoice_url && <Badge className="bg-blue-600">Invoice Uploaded</Badge>}
                </div>
                <div className="flex gap-2">
                  <Input id={`inv-${u.id}`} placeholder="Paste Google Drive invoice URL..." defaultValue={u.invoice_url || ""} className="border-2 border-gray-300" />
                  <Button onClick={async () => {
                    const url = document.getElementById(`inv-${u.id}`).value.trim();
                    if (!url) { alert("⚠️ Enter URL"); return; }
                    const isAppUser = appUsers.some(au => au.id === u.id);
                    if (isAppUser) {
                      await base44.entities.AppUser.update(u.id, { invoice_url: url });
                      queryClient.invalidateQueries({ queryKey: ['all-app-users'] });
                    } else {
                      await base44.entities.User.update(u.id, { invoice_url: url });
                      queryClient.invalidateQueries({ queryKey: ['all-users'] });
                    }
                    alert('✅ Saved!');
                  }} className="bg-gray-900 hover:bg-gray-800">Save</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {subscribedUsers.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No subscribed users yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}