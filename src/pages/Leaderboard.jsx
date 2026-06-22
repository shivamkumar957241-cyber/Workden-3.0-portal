import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, TrendingUp, Edit, Crown, Star, Gem, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [rankForm, setRankForm] = useState({ tasks_completed: 0, total_earnings: 0 });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: baseUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    refetchInterval: 5000,
    initialData: [],
  });

  const { data: appUsers = [] } = useQuery({
    queryKey: ['all-app-users-leaderboard'],
    queryFn: () => base44.entities.AppUser.list(),
    refetchInterval: 5000,
    initialData: [],
  });

  // Merge both user types into one leaderboard list
  const users = [...baseUsers, ...appUsers.map(u => ({
    ...u,
    tasks_completed: u.tasks_completed || 0,
    total_earnings: u.total_earnings || 0,
    role: u.role || 'user'
  }))];

  const updateUserRankMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setEditDialog(false);
      setEditingUser(null);
      alert("User ranking updated!");
    },
  });

  const topUsers = [...users]
    .filter(u => u.role !== 'admin')
    .sort((a, b) => {
      const aScore = (a.tasks_completed || 0) * 1000 + (a.total_earnings || 0);
      const bScore = (b.tasks_completed || 0) * 1000 + (b.total_earnings || 0);
      return bScore - aScore;
    });

  const getTrophyIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="w-12 h-12 text-yellow-500" />;
      case 1:
        return <Medal className="w-10 h-10 text-gray-400" />;
      case 2:
        return <Award className="w-10 h-10 text-orange-600" />;
      default:
        return null;
    }
  };

  const getBadgeInfo = (points) => {
    if (points >= 10000) return { name: 'Diamond', color: 'from-cyan-400 to-blue-500', icon: <Gem className="w-4 h-4" /> };
    if (points >= 5000) return { name: 'Platinum', color: 'from-gray-300 to-gray-400', icon: <Crown className="w-4 h-4" /> };
    if (points >= 2000) return { name: 'Gold', color: 'from-yellow-400 to-yellow-600', icon: <Star className="w-4 h-4" /> };
    if (points >= 1000) return { name: 'Silver', color: 'from-gray-200 to-gray-400', icon: <Shield className="w-4 h-4" /> };
    return { name: 'Bronze', color: 'from-orange-400 to-orange-600', icon: <Medal className="w-4 h-4" /> };
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 0:
        return "from-yellow-400 to-yellow-600";
      case 1:
        return "from-gray-300 to-gray-500";
      case 2:
        return "from-orange-400 to-orange-600";
      default:
        return "from-blue-400 to-blue-600";
    }
  };

  const handleEditRank = (userData) => {
    setEditingUser(userData);
    setRankForm({
      tasks_completed: userData.tasks_completed || 0,
      total_earnings: userData.total_earnings || 0
    });
    setEditDialog(true);
  };

  const handleUpdateRank = () => {
    if (!editingUser) return;
    
    updateUserRankMutation.mutate({
      userId: editingUser.id,
      data: rankForm
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8" />
            Top Performers
          </h1>
          <p className="text-slate-600">Real-time leaderboard of our best workers</p>
        </div>

        <div className="space-y-6">
          {topUsers.map((userData, index) => (
            <Card 
              key={userData.id} 
              className={`bg-gradient-to-r ${getPositionColor(index)} text-white shadow-xl transform hover:scale-105 transition-transform`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    {getTrophyIcon(index)}
                    <Badge className="mt-2 bg-white text-slate-900">
                      #{index + 1}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {userData.profile_picture ? (
                        <img 
                          src={userData.profile_picture} 
                          alt={userData.full_name} 
                          className="w-16 h-16 rounded-full border-4 border-white object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center text-2xl font-bold">
                          {userData.full_name?.[0] || userData.email?.[0] || "U"}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold">{userData.full_name}</h2>
                        <p className="text-sm opacity-90">ID: {userData.user_id || userData.login_user_id || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                        <p className="text-sm opacity-90">Tasks</p>
                        <p className="text-2xl font-bold">{userData.tasks_completed || 0}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                        <p className="text-sm opacity-90">Earnings</p>
                        <p className="text-2xl font-bold">₹{Number(userData.total_earnings || 0).toFixed(0)}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                        <p className="text-sm opacity-90">Badge</p>
                        <div className={`flex items-center gap-1 text-lg font-bold`}>
                          {getBadgeInfo(userData.gamification_points || 0).icon}
                          <span>{getBadgeInfo(userData.gamification_points || 0).name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditRank(userData)}
                        className="bg-white text-slate-900 hover:bg-slate-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Rank
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {topUsers.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-slate-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg">No rankings yet</p>
                <p className="text-sm mt-2">Complete tasks to appear on the leaderboard!</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Ranking Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User Ranking</DialogTitle>
            <DialogDescription>
              Manually adjust {editingUser?.full_name}'s performance metrics
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rank_tasks">Tasks Completed</Label>
              <Input
                id="rank_tasks"
                type="number"
                value={rankForm.tasks_completed}
                onChange={(e) => setRankForm({...rankForm, tasks_completed: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rank_earnings">Total Earnings (₹)</Label>
              <Input
                id="rank_earnings"
                type="number"
                value={rankForm.total_earnings}
                onChange={(e) => setRankForm({...rankForm, total_earnings: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRank}>
              Update Ranking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}