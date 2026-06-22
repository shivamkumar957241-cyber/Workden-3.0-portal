import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function SupportHistory() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userSource = localStorage.getItem('workden_user_source');
      const savedUserId = localStorage.getItem('workden_login_id');
      if (userSource === 'appuser' && savedUserId) {
        const appUsers = await base44.entities.AppUser.filter({ login_user_id: savedUserId });
        if (appUsers?.length > 0) { setUser(appUsers[0]); return; }
      }
      const savedUser = localStorage.getItem('workden_user');
      if (savedUser) { setUser(JSON.parse(savedUser)); return; }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      const savedUser = localStorage.getItem('workden_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  };

  const { data: helpTickets = [] } = useQuery({
    queryKey: ['my-help-tickets', user?.id],
    queryFn: () => base44.entities.HelpTicket.filter({ user_id: user?.id }, '-created_date', 50),
    enabled: !!user?.id,
    initialData: [],
    refetchInterval: 30000,
  });

  const { data: callRequests = [] } = useQuery({
    queryKey: ['my-call-requests', user?.id],
    queryFn: () => base44.entities.CallRequest.filter({ user_id: user?.id }, '-created_date', 50),
    enabled: !!user?.id,
    initialData: [],
    refetchInterval: 30000,
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
      case 'contacted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-600 text-white">✓ Resolved</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-600 text-white">📞 Contacted</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 text-white">⏳ In Progress</Badge>;
      default:
        return <Badge variant="secondary">⏱ Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-3 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Support & Call History
          </h1>
          <p className="text-gray-600">Track all your support requests and call requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Support Tickets</p>
              <p className="text-2xl font-bold">{helpTickets.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <Phone className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Call Requests</p>
              <p className="text-2xl font-bold">{callRequests.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Resolved</p>
              <p className="text-2xl font-bold">
                {[...helpTickets, ...callRequests].filter(r => r.status === 'resolved').length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-1 opacity-90" />
              <p className="text-xs opacity-90">Pending</p>
              <p className="text-2xl font-bold">
                {[...helpTickets, ...callRequests].filter(r => r.status === 'open' || r.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Support Tickets ({helpTickets.length})
          </h2>
          <div className="space-y-4">
            {helpTickets.length > 0 ? (
              helpTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className={`shadow-lg hover:shadow-xl transition-shadow border-l-4 ${
                    ticket.status === 'resolved' 
                      ? 'border-l-green-500' 
                      : ticket.status === 'in_progress' 
                      ? 'border-l-blue-500' 
                      : 'border-l-yellow-500'
                  }`}
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-3 md:gap-4 w-full">
                        {getStatusIcon(ticket.status)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {ticket.description}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            Submitted: {new Date(ticket.created_date).toLocaleString()}
                          </p>
                          
                          <div className="flex items-center gap-3 flex-wrap">
                            {getStatusBadge(ticket.status)}
                          </div>

                          {/* Admin Reply */}
                          {ticket.admin_reply && (
                            <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-green-800 text-sm mb-1">Admin Reply:</p>
                                  <p className="text-green-700 text-sm break-words">
                                    {ticket.admin_reply}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center shadow-lg">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold text-gray-600 mb-2">No Support Tickets</p>
                <p className="text-sm text-gray-500">You haven't submitted any support tickets yet</p>
              </Card>
            )}
          </div>
        </div>

        {/* Call Requests */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6 text-purple-600" />
            Call Requests ({callRequests.length})
          </h2>
          <div className="space-y-4">
            {callRequests.length > 0 ? (
              callRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className={`shadow-lg hover:shadow-xl transition-shadow border-l-4 ${
                    request.status === 'resolved' 
                      ? 'border-l-green-500' 
                      : request.status === 'contacted' 
                      ? 'border-l-blue-500' 
                      : 'border-l-yellow-500'
                  }`}
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-3 md:gap-4 w-full">
                        {getStatusIcon(request.status)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1">
                            {request.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {request.issue}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            Submitted: {new Date(request.created_date).toLocaleString()}
                          </p>
                          
                          <div className="flex items-center gap-3 flex-wrap">
                            {getStatusBadge(request.status)}
                          </div>

                          {/* Admin Notes */}
                          {request.admin_notes && (
                            <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-blue-800 text-sm mb-1">Admin Notes:</p>
                                  <p className="text-blue-700 text-sm break-words">
                                    {request.admin_notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center shadow-lg">
                <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold text-gray-600 mb-2">No Call Requests</p>
                <p className="text-sm text-gray-500">You haven't requested any callbacks yet</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}