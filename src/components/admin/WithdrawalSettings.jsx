import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function WithdrawalSettings({ globalSettings = [], onUpdate }) {
  const minWithdrawal = globalSettings?.find(s => s.setting_key === 'min_withdrawal_amount')?.setting_value || '1000';

  const handleSave = async () => {
    const amount = document.getElementById('min-withdrawal-input').value;
    if (!amount || parseFloat(amount) < 0) {
      alert('Please enter valid amount');
      return;
    }
    await onUpdate('min_withdrawal_amount', amount, 'Minimum withdrawal amount for users');
    alert(`✅ Minimum withdrawal set to ₹${amount}`);
  };

  return (
    <Card className="border-2 border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <CardTitle>💰 Minimum Withdrawal Amount</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 mb-2">
            <strong>Set minimum withdrawal limit for all users:</strong>
          </p>
          <p className="text-xs text-amber-700">
            Users must have at least this amount in their wallet to request withdrawal.
          </p>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
          <p className="text-xs mb-1">Current Minimum:</p>
          <p className="font-bold text-2xl text-green-600">₹{minWithdrawal}</p>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Set Minimum Amount (₹)</Label>
          <Input 
            type="number" 
            id="min-withdrawal-input" 
            placeholder="e.g., 500, 700, 1000" 
            defaultValue={minWithdrawal}
          />
          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
            Save Minimum Amount
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}