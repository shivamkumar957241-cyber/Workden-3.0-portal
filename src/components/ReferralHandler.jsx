import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function ReferralHandler() {
  useEffect(() => {
    const handleReferral = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        
        if (!refCode) return;

        localStorage.setItem('workden_referral_code', refCode);

        const currentUser = await base44.auth.me();
        
        if (currentUser && !currentUser.referred_by) {
          const allUsers = await base44.entities.User.list();
          const referrer = allUsers.find(u => u.referral_code === refCode);
          
          if (referrer && referrer.id !== currentUser.id) {
            await base44.entities.User.update(currentUser.id, {
              referred_by: refCode
            });

            await base44.entities.Referral.create({
              referrer_id: referrer.id,
              referrer_name: referrer.full_name || referrer.email,
              referrer_code: refCode,
              referred_user_id: currentUser.id,
              referred_user_name: currentUser.full_name || currentUser.email,
              referred_user_email: currentUser.email,
              referred_user_phone: currentUser.phone || '',
              signup_date: new Date().toISOString(),
              verification_status: currentUser.id_verification_status || 'pending',
              is_notified: false
            });

            await base44.entities.User.update(referrer.id, {
              total_referrals: (referrer.total_referrals || 0) + 1
            });

            await base44.entities.Notification.create({
              title: '🎉 New Referral!',
              message: `${currentUser.full_name || currentUser.email} just signed up using your referral link! You'll get ₹30 bonus after their first task approval.`
            });

            localStorage.removeItem('workden_referral_code');
          }
        }
      } catch (error) {
        console.error('Referral handling error:', error);
      }
    };

    // Also check for referral bonuses when approved proofs happen
    const checkReferralBonuses = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) return;

        const allProofs = await base44.entities.Proof.list();
        const approvedProofs = allProofs.filter(p => p.status === 'approved');

        const allReferrals = await base44.entities.Referral.list();
        const pendingReferrals = allReferrals.filter(r => 
          r.verification_status === 'verified' && !r.bonus_paid
        );

        for (const referral of pendingReferrals) {
          const userHasApprovedWork = approvedProofs.some(p => p.user_id === referral.referred_user_id);
          
          if (userHasApprovedWork) {
            const referrer = await base44.entities.User.get(referral.referrer_id);
            
            if (referrer) {
              const newBalance = (referrer.wallet_balance || 0) + 30;
              const newEarnings = (referrer.total_earnings || 0) + 30;
              
              await base44.entities.User.update(referrer.id, {
                wallet_balance: newBalance,
                total_earnings: newEarnings
              });

              await base44.entities.Referral.update(referral.id, {
                bonus_paid: true,
                bonus_amount: 30,
                bonus_date: new Date().toISOString()
              });

              await base44.entities.Notification.create({
                title: '💰 Referral Bonus Credited!',
                message: `₹30 referral bonus added to your wallet for ${referral.referred_user_name}'s first approved task!`
              });

              await base44.entities.WalletTransaction.create({
                txn_id: `REF${Date.now()}`,
                admin_id: 'system',
                admin_name: 'System',
                user_id: referrer.id,
                user_name: referrer.full_name || referrer.email,
                transaction_type: 'credit',
                amount: 30,
                old_balance: (referrer.wallet_balance || 0),
                new_balance: newBalance,
                reason: `Referral bonus for ${referral.referred_user_name}`,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.error('Referral bonus check error:', error);
      }
    };

    handleReferral();
    checkReferralBonuses();

    const interval = setInterval(checkReferralBonuses, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
