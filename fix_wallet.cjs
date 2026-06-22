const fs = require('fs');
let c = fs.readFileSync('src/pages/Wallet.jsx', 'utf8');

c = c.replace(/walletBalance\?\.toString\(\)2\)/g, 'Number(walletBalance || 0).toFixed(2)');
c = c.replace(/totalEarnings\?\.toString\(\)0\)/g, 'Number(totalEarnings || 0).toFixed(0)');
c = c.replace(/taskEarnings\?\.toString\(\)0\)/g, 'Number(taskEarnings || 0).toFixed(0)');
c = c.replace(/pendingBalance\?\.toString\(\)0\)/g, 'Number(pendingBalance || 0).toFixed(0)');
c = c.replace(/totalWithdrawalsDisplay\?\.toString\(\)0\)/g, 'Number(totalWithdrawalsDisplay || 0).toFixed(0)');
c = c.replace(/pendingWithdrawalsTotal\?\.toString\(\)0\)/g, 'Number(pendingWithdrawalsTotal || 0).toFixed(0)');
c = c.replace(/txn\.old_balance\?\?\.toString\(\)2\)/g, 'Number(txn.old_balance || 0).toFixed(2)');
c = c.replace(/txn\.new_balance\?\?\.toString\(\)2\)/g, 'Number(txn.new_balance || 0).toFixed(2)');
c = c.replace(/txn\.amount\?\.toString\(\)2\)/g, 'Number(txn.amount || 0).toFixed(2)');

fs.writeFileSync('src/pages/Wallet.jsx', c);
