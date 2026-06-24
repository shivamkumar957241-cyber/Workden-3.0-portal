import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Zap, Target, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Gamification() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: () => base44.entities.Badge.filter({ user_id: user?.id }),
    enabled: !!user?.id,
    placeholderData: []
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    placeholderData: []
  });

  const userPoints = user?.gamification_points || 0;
  const userRank = allUsers
    .sort((a, b) => (b.gamification_points || 0) - (a.gamification_points || 0))
    .findIndex(u => u.id === user?.id) + 1;

  const levels = [
    { name: "Beginner", min: 0, max: 99, icon: Target, color: "from-gray-400 to-gray-500" },
    { name: "Intermediate", min: 100, max: 499, icon: Star, color: "from-blue-400 to-blue-500" },
    { name: "Advanced", min: 500, max: 999, icon: Zap, color: "from-purple-400 to-purple-500" },
    { name: "Expert", min: 1000, max: 4999, icon: Award, color: "from-orange-400 to-orange-500" },
    { name: "Master", min: 5000, max: Infinity, icon: Crown, color: "from-yellow-400 to-yellow-500" }
  ];

  const currentLevel = levels.find(l => userPoints >= l.min && userPoints <= l.max) || levels[0];
  const nextLevel = levels[levels.findIndex(l => l === currentLevel) + 1];
  const progressToNext = nextLevel ? ((userPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  const availableBadges = [
    { name: "First Task", desc: "Complete your first task", points: 10, type: "bronze" },
    { name: "Fast Worker", desc: "Complete 10 tasks", points: 50, type: "silver" },
    { name: "High Earner", desc: "Earn ₹1000", points: 100, type: "gold" },
    { name: "Top Performer", desc: "Complete 50 tasks", points: 200, type: "platinum" },
    { name: "Legend", desc: "Earn ₹10000", points: 500, type: "diamond" }
  ];

  const badgeColors = {
    bronze: "from-orange-300 to-orange-400",
    silver: "from-gray-300 to-gray-400",
    gold: "from-yellow-400 to-yellow-500",
    platinum: "from-cyan-400 to-blue-500",
    diamond: "from-purple-400 to-pink-500"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}><Button variant="outline" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Gamification</h1><p className="text-sm text-slate-600">Your Achievements & Progress</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center"><Trophy className="w-12 h-12 mx-auto mb-2" /><p className="text-sm opacity-90">Total Points</p><p className="text-4xl font-bold">{userPoints}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center"><Award className="w-12 h-12 mx-auto mb-2" /><p className="text-sm opacity-90">Your Rank</p><p className="text-4xl font-bold">#{userRank}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardContent className="p-6 text-center"><Crown className="w-12 h-12 mx-auto mb-2" /><p className="text-sm opacity-90">Badges Earned</p><p className="text-4xl font-bold">{badges.length}</p></CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><currentLevel.icon className="w-6 h-6" />Level: {currentLevel.name}</CardTitle></CardHeader>
          <CardContent><div className="space-y-3"><div className="flex justify-between text-sm"><span>Current: {userPoints} points</span>{nextLevel && <span>Next: {nextLevel.min} points</span>}</div><div className="w-full bg-gray-200 rounded-full h-4"><div className={`h-4 rounded-full bg-gradient-to-r ${currentLevel.color}`} style={{ width: `${Math.min(progressToNext, 100)}%` }}></div></div><p className="text-xs text-gray-500">{nextLevel ? `${nextLevel.min - userPoints} points to ${nextLevel.name}` : 'Max level reached!'}</p></div></CardContent>
        </Card>

        <Card className="mb-6"><CardHeader><CardTitle>Your Badges</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{badges.length > 0 ? badges.map(badge => (
            <div key={badge.id} className={`p-4 rounded-lg bg-gradient-to-br ${badgeColors[badge.badge_type]} text-white text-center shadow-lg`}><Award className="w-12 h-12 mx-auto mb-2" /><p className="font-bold">{badge.badge_name}</p><p className="text-xs mt-1 opacity-90">{badge.description}</p><p className="text-sm mt-2">+{badge.points} pts</p></div>
          )) : <div className="col-span-full text-center py-8 text-gray-500"><Award className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>No badges yet. Complete tasks to earn badges!</p></div>}</div></CardContent>
        </Card>

        <Card><CardHeader><CardTitle>Available Badges</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{availableBadges.map(badge => {
            const earned = badges.some(b => b.badge_name === badge.name);
            return (<div key={badge.name} className={`p-4 rounded-lg border-2 ${earned ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'}`}><div className="flex items-start gap-3"><div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badgeColors[badge.type]} flex items-center justify-center flex-shrink-0`}><Award className="w-6 h-6 text-white" /></div><div className="flex-1"><p className="font-bold text-lg">{badge.name}</p><p className="text-sm text-gray-600">{badge.desc}</p><Badge className="mt-2" variant={earned ? 'default' : 'secondary'}>{earned ? '✓ Earned' : `${badge.points} points`}</Badge></div></div></div>);
          })}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
