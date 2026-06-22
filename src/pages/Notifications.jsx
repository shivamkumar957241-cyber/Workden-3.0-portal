import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Gift, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Info,
  Megaphone,
  Sparkles
} from "lucide-react";

export default function Notifications() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Try AppUser first (admin-created users)
      const savedUserStr = localStorage.getItem('workden_user');
      const savedUserSource = localStorage.getItem('workden_user_source');
      if (savedUserSource === 'appuser' && savedUserStr) {
        const localUser = JSON.parse(savedUserStr);
        setUser(localUser);
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      // Fallback to localStorage
      try {
        const savedUserStr = localStorage.getItem('workden_user');
        if (savedUserStr) setUser(JSON.parse(savedUserStr));
      } catch (e) {}
    }
  };

  // All notifications - fetch all and filter client side
  const { data: allNotifications = [] } = useQuery({
    queryKey: ['all-notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
    initialData: [],
    refetchInterval: 15000,
  });

  // Show: platform-wide (no user_id) + notifications specifically for this user
  const notifications = allNotifications.filter(n => 
    !n.user_id || n.user_id === user?.id
  );

  const getNotificationIcon = (notification) => {
    const title = notification.title?.toLowerCase() || '';
    const message = notification.message?.toLowerCase() || '';
    
    if (title.includes('bonus') || title.includes('referral') || message.includes('bonus')) {
      return <Gift className="w-6 h-6 text-pink-500" />;
    }
    if (title.includes('approved') || title.includes('verified')) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (title.includes('rejected')) {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
    if (title.includes('withdrawal') || title.includes('payment')) {
      return <DollarSign className="w-6 h-6 text-green-600" />;
    }
    if (title.includes('announcement') || title.includes('update')) {
      return <Megaphone className="w-6 h-6 text-blue-500" />;
    }
    return <Bell className="w-6 h-6 text-purple-500" />;
  };

  const getNotificationColor = (notification) => {
    const title = notification.title?.toLowerCase() || '';
    
    if (title.includes('bonus') || title.includes('referral')) {
      return 'border-l-pink-500 bg-gradient-to-r from-pink-50 to-rose-50';
    }
    if (title.includes('approved') || title.includes('verified')) {
      return 'border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50';
    }
    if (title.includes('rejected')) {
      return 'border-l-red-500 bg-gradient-to-r from-red-50 to-rose-50';
    }
    if (title.includes('withdrawal') || title.includes('payment')) {
      return 'border-l-green-600 bg-gradient-to-r from-green-50 to-teal-50';
    }
    return 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Notifications
            </h1>
          </div>
          <p className="text-gray-600">Stay updated with platform announcements</p>
        </div>

        {/* Notification Stats */}
        <div className="flex justify-center gap-4 mb-8">
          <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
            <Bell className="w-4 h-4 mr-2" />
            {notifications.length} Total
          </Badge>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`shadow-lg hover:shadow-xl transition-all border-l-4 ${getNotificationColor(notification)}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTimeAgo(notification.created_date)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {notification.message}
                      </p>
                      
                      {/* User-specific badge */}
                      {notification.user_id === user?.id && (
                        <Badge variant="outline" className="mt-3 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Personal Notification
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center shadow-lg">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold text-gray-600 mb-2">No Notifications</p>
              <p className="text-sm text-gray-500">
                You'll see platform updates and announcements here
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}