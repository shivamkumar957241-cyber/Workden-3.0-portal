// Task Lock Storage - localStorage based strict locking system

export function getTaskLockKey(taskName) {
  const userId = localStorage.getItem('workden_3_login_id') || 'guest';
  return `workden_task_lock_${userId}_${taskName.replace(/\s+/g, '_')}`;
}

export function setTaskLocked(taskName) {
  const now = new Date();
  const lockUntil = new Date(now);

  // Always lock until NEXT day's 9:00 AM — NOT 24 hours from now
  lockUntil.setDate(lockUntil.getDate() + 1);
  lockUntil.setHours(9, 0, 0, 0);

  const key = getTaskLockKey(taskName);
  localStorage.setItem(key, lockUntil.toISOString());
  return lockUntil;
}

export function getTaskLockStatus(taskName) {
  const key = getTaskLockKey(taskName);
  const lockUntilStr = localStorage.getItem(key);
  if (!lockUntilStr) return { isLocked: false, lockUntil: null };
  const lockUntil = new Date(lockUntilStr);
  const now = new Date();
  if (now >= lockUntil) {
    // Lock expired - clear it
    localStorage.removeItem(key);
    return { isLocked: false, lockUntil: null };
  }
  return { isLocked: true, lockUntil };
}

export function clearTaskLock(taskName) {
  const key = getTaskLockKey(taskName);
  localStorage.removeItem(key);
}

// Format a VIP report header
export function buildVIPReportHeader({ user, taskName, startDate, endDate, totalSec, completed, total, reward }) {
  const fmt = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const pad = (label, value, width = 22) => `  ${label.padEnd(width)}: ${value}\n`;
  const line60 = '='.repeat(60);
  const line60d = '-'.repeat(60);
  const line60s = '*'.repeat(60);
  const center = (text, width = 60) => {
    const pad = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(pad) + text;
  };

  let txt = `\n${line60}\n`;
  txt += `${center('★  WORKDEN  —  OFFICIAL TASK REPORT  ★')}\n`;
  txt += `${line60}\n`;
  txt += `${center('www.workden.online  |  support@workden.online')}\n`;
  txt += `${line60s}\n\n`;

  txt += `  ┌${'─'.repeat(56)}┐\n`;
  txt += `  │${center('USER DETAILS', 56)}│\n`;
  txt += `  └${'─'.repeat(56)}┘\n`;
  txt += pad('Full Name', user?.full_name || user?.name || 'N/A');
  txt += pad('Email Address', user?.email || 'N/A');
  txt += pad('Mobile Number', user?.phone || user?.mobile || 'N/A');
  txt += pad('User ID', user?.login_user_id || user?.id || 'N/A');
  txt += `\n${line60d}\n\n`;

  txt += `  ┌${'─'.repeat(56)}┐\n`;
  txt += `  │${center('TASK DETAILS', 56)}│\n`;
  txt += `  └${'─'.repeat(56)}┘\n`;
  txt += pad('Task Name', taskName);
  txt += pad('Start Time', startDate.toLocaleString('en-IN'));
  txt += pad('End Time', endDate.toLocaleString('en-IN'));
  txt += pad('Total Time Taken', fmt(totalSec));
  txt += `\n${line60d}\n\n`;

  txt += `  ┌${'─'.repeat(56)}┐\n`;
  txt += `  │${center('PERFORMANCE SUMMARY', 56)}│\n`;
  txt += `  └${'─'.repeat(56)}┘\n`;
  txt += pad('Items Completed', `${completed} / ${total}`);
  txt += pad('Completion Rate', `${Math.round((completed / total) * 100)}%`);
  txt += pad('Reward Amount', reward);
  txt += pad('Status', completed > 0 ? 'SUBMITTED FOR REVIEW' : 'INCOMPLETE');
  txt += `\n${line60s}\n\n`;

  return txt;
}

export function buildVIPReportFooter() {
  const line60 = '='.repeat(60);
  const line60s = '*'.repeat(60);
  const center = (text, width = 60) => {
    const pad = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(pad) + text;
  };
  let txt = `\n${line60s}\n`;
  txt += `${center('— END OF OFFICIAL REPORT —')}\n`;
  txt += `${center('WorkDen  |  Work From Home Platform')}\n`;
  txt += `${line60}\n`;
  txt += `${center('Generated: ' + new Date().toLocaleString('en-IN'))}\n`;
  txt += `${line60}\n\n`;
  txt += `  NOTE: Upload this file to Google Drive and share the\n`;
  txt += `  link via Menu (☰) → "Submit Your Work" for approval.\n`;
  txt += `${line60}\n`;
  return txt;
}
