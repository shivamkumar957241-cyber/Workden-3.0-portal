import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Monitor, LogOut, RefreshCw, Smartphone, Globe, Clock, Shield } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// ─── THRESHOLD ───────────────────────────────────────────────────────────────
//
//  User portal heartbeat: har 15 sec jab tab visible ho
//  Agar 30 sec mein koi ping nahi aaya = tab visible nahi = OFFLINE
//
//  Tab pe aao    → ping → last_active fresh → ONLINE ✅
//  Tab chhodo    → ping band → 30s baad → OFFLINE ✅
//  Wapas aao     → turant ping → ONLINE ✅
//
const ONLINE_THRESHOLD_MS = 30 * 1000; // 30 seconds

const isReallyOnline = (user) => {
  if (!user.is_logged_in || !user.session_id) return false;
  if (!user.last_active) return false;
  return Date.now() - new Date(user.last_active).getTime() < ONLINE_THRESHOLD_MS;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function DeviceTrackingTab({ appUsers, loginAttempts }) {
  const [search, setSearch] = useState("");
  const [forceLogoutLoading, setForceLogoutLoading] = useState(null);
  const queryClient = useQueryClient();

  const nonAdminUsers = appUsers.filter((u) => u.role !== "admin");
  const activeUsers   = nonAdminUsers.filter(isReallyOnline);

  const filteredUsers = activeUsers.filter((u) => {
    const s = search.toLowerCase();
    return (
      !search ||
      u.full_name?.toString().toLowerCase().includes(s) ||
      u.login_user_id?.toString().toLowerCase().includes(s) ||
      u.email?.toString().toLowerCase().includes(s) ||
      u.phone?.includes(s)
    );
  });

  // ── Force logout ──────────────────────────────────────────────────────────
  const handleForceLogout = async (user) => {
    if (
      !confirm(
        `Force logout ${user.full_name}?\n\nThey will be logged out from their device. Their data, wallet PIN and settings will NOT be affected.`
      )
    )
      return;

    setForceLogoutLoading(user.id);
    try {
      await base44.entities.AppUser.update(user.id, {
        is_logged_in: false,
        session_id: null,
      });
      queryClient.invalidateQueries({ queryKey: ["all-app-users"] });
      alert(`✅ ${user.full_name} has been logged out. All data is safe.`);
    } catch {
      alert("❌ Failed to logout. Please try again.");
    } finally {
      setForceLogoutLoading(null);
    }
  };

  const handleForceLogoutAll = async () => {
    if (
      !confirm(
        `Force logout ALL ${activeUsers.length} active users?\n\nAll data will be safe.`
      )
    )
      return;

    setForceLogoutLoading("all");
    try {
      for (const user of activeUsers) {
        await base44.entities.AppUser.update(user.id, {
          is_logged_in: false,
          session_id: null,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["all-app-users"] });
      alert(`✅ All ${activeUsers.length} users logged out.`);
    } catch {
      alert("❌ Some logouts may have failed.");
    } finally {
      setForceLogoutLoading(null);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getLastLoginInfo = (user) =>
    loginAttempts
      .filter((l) => l.user_id === user.id)
      .sort((a, b) => new Date(b.login_time) - new Date(a.login_time))[0] || null;

  const getTimeSince = (dateStr) => {
    if (!dateStr) return "N/A";
    const diff = Date.now() - new Date(dateStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60)  return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getDeviceDisplay = (user) => {
    const model = user.device_model?.trim();
    const name  = user.device_name?.trim();
    if (model && name && model !== name) return { primary: model, secondary: name };
    if (model) return { primary: model, secondary: null };
    if (name)  return { primary: name,  secondary: null };
    return { primary: null, secondary: null };
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4 text-center">
            <Monitor className="w-8 h-8 mx-auto mb-1" />
            <p className="text-3xl font-bold">{activeUsers.length}</p>
            <p className="text-xs">🟢 Portal Tab Open</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-1" />
            <p className="text-3xl font-bold">
              {nonAdminUsers.filter((u) => u.is_logged_in && !isReallyOnline(u)).length}
            </p>
            <p className="text-xs">⚫ Tab Not Active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-1" />
            <p className="text-3xl font-bold">{nonAdminUsers.length}</p>
            <p className="text-xs">Total Users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardContent className="p-4 text-center">
            <LogOut className="w-8 h-8 mx-auto mb-1" />
            <p className="text-3xl font-bold">
              {nonAdminUsers.filter((u) => !u.is_logged_in).length}
            </p>
            <p className="text-xs">Logged Out</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Active Sessions Panel ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Live Portal Sessions — 🟢 {activeUsers.length} Tab Open Right Now
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["all-app-users"] })}
                className="bg-white/20 hover:bg-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              {activeUsers.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleForceLogoutAll}
                  disabled={forceLogoutLoading === "all"}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {forceLogoutLoading === "all" ? "Logging out…" : "Force Logout All"}
                </Button>
              )}
            </div>
          </div>
          <Input
            placeholder="Search by name, ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 max-w-md bg-white/20 border-white/30 placeholder:text-white/70 text-white"
          />
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Monitor className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="font-semibold">No active sessions found</p>
              <p className="text-sm">Koi bhi abhi portal tab nahi khol raha</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Login ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Last Ping</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const loginInfo = getLastLoginInfo(user);
                  const device    = getDeviceDisplay(user);
                  return (
                    <TableRow key={user.id} className="bg-green-50 hover:bg-green-100">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
                          <div>
                            <p className="font-bold text-sm">{user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.city || "N/A"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-mono font-bold text-blue-700 text-sm">{user.login_user_id}</p>
                        <p className="font-mono text-xs text-gray-600">{user.login_password}</p>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-medium">{user.phone || "—"}</p>
                        <p className="text-gray-500">{user.email || "—"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <Badge className="bg-green-600 text-xs">Online</Badge>
                        </div>
                        {device.primary ? (
                          <div className="mt-1">
                            <p className="text-xs text-gray-800 font-semibold">{device.primary}</p>
                            {device.secondary && (
                              <p className="text-xs text-gray-500">{device.secondary}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">Unknown device</p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {/* Last ping = last_active, 15 sec interval se aata hai */}
                        <p className="font-semibold text-green-700">{getTimeSince(user.last_active)}</p>
                        <p className="text-gray-400">
                          {user.last_active ? new Date(user.last_active).toLocaleTimeString() : "N/A"}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs">
                        {loginInfo ? (
                          <div>
                            <p className="font-semibold">{getTimeSince(loginInfo.login_time)}</p>
                            <p className="text-gray-400">
                              {new Date(loginInfo.login_time).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No record</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_subscribed ? "bg-green-600" : "bg-gray-400"}>
                          {user.is_subscribed ? "✓ Active" : "Not Sub"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleForceLogout(user)}
                          disabled={forceLogoutLoading === user.id}
                          className="h-8 text-xs"
                        >
                          <LogOut className="w-3 h-3 mr-1" />
                          {forceLogoutLoading === user.id ? "Logging out…" : "Force Logout"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── All Users Status Panel ──────────────────────────────────────────── */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            All Users — Live Tab Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Login ID</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Ping</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonAdminUsers
                .filter((u) => {
                  const s = search.toLowerCase();
                  return (
                    !search ||
                    u.full_name?.toString().toLowerCase().includes(s) ||
                    u.login_user_id?.toString().toLowerCase().includes(s) ||
                    u.phone?.includes(s)
                  );
                })
                .slice(0, 50)
                .map((user) => {
                  const online = isReallyOnline(user);
                  const device = getDeviceDisplay(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              online ? "bg-green-500 animate-pulse" : "bg-gray-300"
                            }`}
                          />
                          <p className="font-medium text-sm">{user.full_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-mono text-blue-700 text-sm">{user.login_user_id}</p>
                      </TableCell>
                      <TableCell className="text-xs">
                        {device.primary ? (
                          <div>
                            <p className="font-semibold text-gray-800">{device.primary}</p>
                            {device.secondary && (
                              <p className="text-gray-500">{device.secondary}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Sirf 2 states: tab open = Online, tab nahi = Offline */}
                        <Badge className={online ? "bg-green-600" : "bg-gray-400"}>
                          {online ? "🟢 Online" : "⚫ Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {user.last_active ? getTimeSince(user.last_active) : "Never"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleForceLogout(user)}
                          disabled={forceLogoutLoading === user.id}
                          className="h-7 text-xs text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <LogOut className="w-3 h-3 mr-1" /> Logout
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
