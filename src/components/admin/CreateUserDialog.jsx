import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Copy, CheckCircle, UserPlus } from "lucide-react";

const generateUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'WD';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

export default function CreateUserDialog({ open, onClose, onUserCreated, tasks = [] }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      alert("⚠️ Name and Phone are required");
      return;
    }

    setLoading(true);
    const newUserId = generateUserId();
    const newPassword = generatePassword();

    try {
      // Invite user via base44 - creates the user account
      await base44.users.inviteUser(form.email || `${form.phone}@workden.app`, "user");

      // Find the newly created user by email
      let targetUser = null;
      let retries = 0;
      while (!targetUser && retries < 5) {
        await new Promise(r => setTimeout(r, 1000));
        const allUsers = await base44.entities.User.list();
        targetUser = allUsers.find(u => 
          u.email === (form.email || `${form.phone}@workden.app`) && !u.login_user_id
        );
        retries++;
      }

      if (targetUser) {
        await base44.entities.User.update(targetUser.id, {
          full_name: form.name,
          phone: form.phone,
          city: form.city,
          login_user_id: newUserId,
          login_password: newPassword,
          user_id: newUserId,
          is_subscribed: true,
          assigned_tasks: assignedTasks,
          status: "active",
          created_by_admin: true,
        });
      }

      setCreatedCredentials({ userId: newUserId, password: newPassword, name: form.name });
      if (onUserCreated) onUserCreated();
    } catch (error) {
      // If invite fails (user might already exist), just create credentials record
      const newUserRecord = {
        full_name: form.name,
        phone: form.phone,
        email: form.email || "",
        city: form.city,
        login_user_id: newUserId,
        login_password: newPassword,
        user_id: newUserId,
        is_subscribed: true,
        assigned_tasks: assignedTasks,
        status: "active",
        created_by_admin: true,
      };

      // Store as LoginAttempt record so they can log in
      await base44.entities.LoginAttempt.create({
        login_user_id: newUserId,
        login_password: newPassword,
        user_name: form.name,
        user_email: form.email || "",
        user_phone: form.phone,
        is_subscribed: true,
        login_time: new Date().toISOString(),
      });

      setCreatedCredentials({ userId: newUserId, password: newPassword, name: form.name });
      if (onUserCreated) onUserCreated();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", phone: "", email: "", city: "" });
    setCreatedCredentials(null);
    setAssignedTasks([]);
    onClose();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Copied!");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Create New User Account
          </DialogTitle>
        </DialogHeader>

        {createdCredentials ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
              <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-800 text-lg">Account Created!</p>
                <p className="text-sm text-green-700">{createdCredentials.name}</p>
              </div>
            </div>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4 space-y-3">
                <p className="font-bold text-blue-900 text-center mb-3">🔐 Login Credentials</p>
                <p className="text-xs text-center text-blue-700 mb-3">Share these with the user</p>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="font-mono font-bold text-blue-700 text-lg">{createdCredentials.userId}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdCredentials.userId)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="text-xs text-gray-500">Password</p>
                    <p className="font-mono font-bold text-purple-700 text-lg">{createdCredentials.password}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdCredentials.password)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  className="w-full bg-blue-600"
                  onClick={() => copyToClipboard(`User ID: ${createdCredentials.userId}\nPassword: ${createdCredentials.password}`)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Both Credentials
                </Button>
              </CardContent>
            </Card>

            <Button onClick={handleClose} variant="outline" className="w-full">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-semibold">Full Name *</Label>
              <Input
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Phone Number *</Label>
              <Input
                placeholder="Enter mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Email (Optional)</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">City *</Label>
              <Input
                placeholder="Enter city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>

            {tasks.length > 0 && (
              <div className="space-y-2">
                <Label className="font-semibold">Assign Tasks</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {tasks.map(task => (
                    <label key={task.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedTasks.includes(task.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedTasks([...assignedTasks, task.id]);
                          } else {
                            setAssignedTasks(assignedTasks.filter(id => id !== task.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{task.name} — ₹{task.reward}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                ✅ User ID and Password will be auto-generated.<br />
                Share the credentials with the user after creation.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" />Create User</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}