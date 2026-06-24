import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

export default function SignatureSubmissionsTab() {
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState("all");

  const { data: signatures = [] } = useQuery({
    queryKey: ['terms-acceptances'],
    queryFn: () => base44.entities.TermsAcceptance.list('-accepted_date'),
    placeholderData: [],
    refetchInterval: 15000
  });

  const filteredSignatures = signatures.filter(sig => {
    if (dateFilter === "all") return true;
    const sigDate = new Date(sig.accepted_date || sig.created_date);
    const now = new Date();
    if (dateFilter === "today") {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      return sigDate >= start;
    }
    if (dateFilter === "yesterday") {
      const start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setHours(23, 59, 59, 999);
      return sigDate >= start && sigDate <= end;
    }
    if (dateFilter === "last2days") {
      const start = new Date(now); start.setDate(start.getDate() - 2); start.setHours(0, 0, 0, 0);
      return sigDate >= start;
    }
    if (dateFilter === "lastweek") {
      const start = new Date(now); start.setDate(start.getDate() - 7);
      return sigDate >= start;
    }
    if (dateFilter === "lastmonth") {
      const start = new Date(now); start.setMonth(start.getMonth() - 1);
      return sigDate >= start;
    }
    return true;
  });

  const handleDelete = async (sig) => {
    if (!confirm(`Delete signature from ${sig.user_name}?`)) return;
    await base44.entities.TermsAcceptance.delete(sig.id);
    queryClient.invalidateQueries({ queryKey: ['terms-acceptances'] });
    alert('✅ Deleted!');
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          User Signature Submissions ({filteredSignatures.length})
        </CardTitle>
        <p className="text-sm text-purple-100 mt-1">Terms & Conditions signatures submitted by users</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { key: "all", label: "All" },
            { key: "today", label: "Today" },
            { key: "yesterday", label: "Yesterday" },
            { key: "last2days", label: "Last 2 Days" },
            { key: "lastweek", label: "Last Week" },
            { key: "lastmonth", label: "Last Month" },
          ].map(f => (
            <Button
              key={f.key}
              size="sm"
              variant={dateFilter === f.key ? "default" : "outline"}
              className="bg-white/20 hover:bg-white/30 text-white border-white/40"
              onClick={() => setDateFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {filteredSignatures.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-semibold">No signatures found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Mobile / Email</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Signature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSignatures.map((sig, index) => (
                <TableRow key={sig.id}>
                  <TableCell className="font-mono text-sm">{index + 1}</TableCell>
                  <TableCell>
                    <p className="font-semibold">{sig.user_name || 'N/A'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-sm text-blue-600">{sig.user_login_id || sig.user_id?.substring(0, 10) || 'N/A'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{sig.user_phone || '-'}</p>
                    <p className="text-xs text-gray-500">{sig.user_email || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{new Date(sig.accepted_date || sig.created_date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(sig.accepted_date || sig.created_date).toLocaleTimeString()}</p>
                  </TableCell>
                  <TableCell>
                    {sig.signature_url ? (
                      <div className="space-y-2">
                        <img
                          src={sig.signature_url}
                          alt="Signature"
                          className="h-14 w-40 object-contain border-2 border-gray-200 rounded bg-white"
                        />
                        <a
                          href={sig.signature_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline block"
                        >
                          View Full
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No signature</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-600">✓ Accepted</Badge>
                    <p className="text-xs text-gray-500 mt-1">v{sig.terms_version || '1.0'}</p>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7"
                      onClick={() => handleDelete(sig)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
