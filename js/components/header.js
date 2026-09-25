// =========================================================================
// HEADER & NOTIFICATION BELL & AVATAR DROPDOWN
// =========================================================================

// =========================================================================
// ERD ENTITIES HELPERS: AUDIT LOGS, NOTIFICATIONS, TICKETS, WORKOUT PLANS
// =========================================================================

function recordAuditLog(actionType, targetTable, details, accountId) {
  if (!appState.data.auditLogs) appState.data.auditLogs = [];
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const logId = 'AUD' + String(appState.data.auditLogs.length + 1).padStart(2, '0');
  const newLog = {
    logId: logId,
    id: logId,
    actionType: actionType,
    targetTable: targetTable,
    timestamp: timestamp,
    details: details,
    accountId: accountId || (appState.currentUser?.email || (appState.currentRole === 'MANAGER' ? 'manager@sportscenter.vn' : (appState.currentRole === 'COACH' ? 'coach.nam@sportscenter.vn' : (appState.currentRole === 'RECEPTIONIST' ? 'letan@sportscenter.vn' : 'member@sportscenter.vn'))))
  };
  appState.data.auditLogs.unshift(newLog);
  return newLog;
}

function addNotification(title, content, targetType, targetId) {
  if (!appState.data.notifications) appState.data.notifications = [];
  const now = new Date();
  const sentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const notifId = 'NOTIF' + String(appState.data.notifications.length + 1).padStart(2, '0');
  const newNotif = {
    notificationId: notifId,
    id: notifId,
    title: title,
    content: content,
    sentDate: sentDate,
    targetType: targetType || 'ACCOUNT',
    targetId: targetId || 'MEM101',
    isRead: false
  };
  appState.data.notifications.unshift(newNotif);
  return newNotif;
}

function toggleNotificationDropdown() {
  appState.showNotificationDropdown = !appState.showNotificationDropdown;
  renderApp();
}

function markAllNotificationsAsRead(role) {
  const notifs = appState.data?.notifications || [];
  notifs.forEach(n => {
    n.isRead = true;
  });
  showToast('Thông Báo', 'Đã đánh dấu tất cả thông báo là đã đọc', 'success');
  renderApp();
}

function markSingleNotificationAsRead(notifId) {
  const notifs = appState.data?.notifications || [];
  const target = notifs.find(n => (n.notificationId || n.id) === notifId);
  if (target) {
    target.isRead = true;
    renderApp();
  }
}

function renderNotificationBell(role) {
  const allNotifs = appState.data?.notifications || [];
  let userNotifs = [];
  if (role === 'MEMBER') {
    userNotifs = allNotifs.filter(n => n.targetId === 'MEM101' || n.targetType === 'CLASS');
  } else if (role === 'RECEPTIONIST') {
    userNotifs = allNotifs.filter(n => n.targetId === 'REC01' || n.targetType === 'ACCOUNT');
  } else if (role === 'COACH') {
    userNotifs = allNotifs.filter(n => n.targetId === 'COACH' || n.targetId === 'COA01' || n.targetType === 'CLASS');
  } else {
    userNotifs = allNotifs;
  }
  const unreadCount = userNotifs.filter(n => !n.isRead).length;
  const isOpen = appState.showNotificationDropdown;

  return `
    <div class="relative inline-block text-left">
      <button type="button" onclick="toggleNotificationDropdown()" class="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none" title="Thông Báo Hệ Thống">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        ${unreadCount > 0 ? `
          <span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
            ${unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ` : ''}
      </button>

      ${isOpen ? `
        <div class="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div class="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-xs text-slate-900 uppercase tracking-wider">Thông Báo (${unreadCount} mới)</span>
            </div>
            ${unreadCount > 0 ? `
              <button type="button" onclick="markAllNotificationsAsRead('${role}')" class="text-[11px] font-semibold text-indigo-600 hover:underline">
                Đánh dấu đã đọc
              </button>
            ` : ''}
          </div>

          <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
            ${userNotifs.length === 0 ? `
              <div class="py-8 text-center text-xs text-slate-400">Không có thông báo nào.</div>
            ` : userNotifs.map(n => `
              <div onclick="markSingleNotificationAsRead('${n.notificationId || n.id}')" class="p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start space-x-3 ${!n.isRead ? 'bg-indigo-50/40' : ''}">
                <div class="mt-0.5 w-2 h-2 rounded-full ${!n.isRead ? 'bg-indigo-600' : 'bg-transparent'} flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold ${!n.isRead ? 'text-indigo-950 font-extrabold' : 'text-slate-800'} truncate">${n.title}</span>
                    <span class="text-[10px] text-slate-400 ml-2 whitespace-nowrap">${n.sentDate}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">${n.content}</p>
                  <div class="mt-1 flex items-center space-x-2">
                    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${n.targetType === 'CLASS' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'}">
                      ${n.targetType === 'CLASS' ? 'Lớp học' : 'Cá nhân'}
                    </span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// User Avatar Dropdown Menu (Opened by clicking avatar)
function toggleUserDropdown() {
  appState.showUserDropdown = !appState.showUserDropdown;
  if (appState.showUserDropdown) {
    appState.showNotificationDropdown = false;
  }
  renderApp();
}

function closeUserDropdown() {
  if (appState.showUserDropdown) {
    appState.showUserDropdown = false;
    renderApp();
  }
}

function navigateToMemberPage(tab) {
  appState.showUserDropdown = false;
  if (!appState.isAuthenticated) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản để xem thông tin cá nhân!', 'info');
    openLoginScreen('login');
    return;
  }
  switchTab(tab);
}

function renderUserAvatarDropdown(role) {
  const isOpen = appState.showUserDropdown;
  const currentTab = appState.currentTab;

  const user = getResolvedCurrentUserProfile();
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  const member = role === 'MEMBER' ? (resolveMember(rawMember) || user) : user;

  const isDarkHeader = role === 'RECEPTIONIST' || role === 'MANAGER';

  return `
    <div class="relative inline-block text-left">
      <!-- Avatar Trigger Button -->
      <button type="button" onclick="toggleUserDropdown()" class="flex items-center space-x-2.5 p-1.5 rounded-2xl transition group focus:outline-none ${
        isDarkHeader
          ? (isOpen ? 'bg-slate-800 ring-2 ring-indigo-500/50' : 'hover:bg-slate-800')
          : (isOpen ? 'bg-slate-100 ring-2 ring-indigo-500/30' : 'hover:bg-slate-100/90')
      }" title="Menu tài khoản cá nhân">
        <div class="relative flex-shrink-0">
          <img src="${member.avatar || user.avatar}" class="w-8 h-8 rounded-full border ${isDarkHeader ? 'border-slate-700' : 'border-slate-200'} object-cover shadow-2xs group-hover:scale-105 transition" />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${isDarkHeader ? 'border-slate-900' : 'border-white'}"></span>
        </div>
        <div class="hidden sm:block text-left min-w-0 max-w-[155px]">
          <div class="text-xs font-bold ${isDarkHeader ? 'text-white' : 'text-slate-900'} truncate flex items-center space-x-1">
            <span class="truncate">${member.name || user.name}</span>
            <svg class="w-3 h-3 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180 text-indigo-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div class="text-[10px] text-emerald-500 font-semibold truncate">
            ${role === 'MEMBER' ? `${member.status === 'ACTIVE' ? 'Thẻ Active' : 'Hết hạn'} &bull; ${member.activePackage}` : (user.department || user.roleLabel || role)}
          </div>
        </div>
      </button>

      <!-- Click-outside backdrop -->
      ${isOpen ? `
        <div class="fixed inset-0 z-40" onclick="closeUserDropdown()"></div>

        <!-- Dropdown Menu Box -->
        <div class="absolute right-0 mt-2.5 w-64 sm:w-72 rounded-3xl bg-white shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden divide-y divide-slate-100 text-slate-900">
          <!-- User Summary Card -->
          <div class="px-4 py-3 bg-gradient-to-br from-slate-50 to-indigo-50/40">
            <div class="flex items-center space-x-3">
              <img src="${member.avatar || user.avatar}" class="w-11 h-11 rounded-2xl border-2 border-white shadow-sm object-cover flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="font-black text-sm text-slate-900 truncate">${member.name || user.name}</div>
                <div class="text-[11px] text-slate-500 font-medium truncate">${member.email || user.email || 'member@sportscenter.vn'}</div>
                <div class="mt-1 flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ${role === 'MEMBER' ? (member.status === 'ACTIVE' ? 'HỘI VIÊN CHÍNH THỨC' : 'HẾT HẠN') : role}
                  </span>
                  <span class="text-[10px] text-indigo-700 font-bold truncate">${member.activePackage || user.roleLabel || ''}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu Items List -->
          <div class="p-2 space-y-1">
            ${role === 'MEMBER' ? `
              <!-- 1. Hồ Sơ Cá Nhân -->
              <button type="button" onclick="navigateToMemberPage('member-profile')" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition group ${currentTab === 'member-profile' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}">
                <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                  👤
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-indigo-600 transition">Hồ Sơ Cá Nhân</div>
                </div>
                <span class="text-slate-300 group-hover:text-indigo-600 transition text-xs">&rarr;</span>
              </button>

              <!-- 2. Thẻ Điện Tử & Hóa Đơn -->
              <button type="button" onclick="navigateToMemberPage('member-pass')" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition group ${currentTab === 'member-pass' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                  💳
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-emerald-700 transition">Thẻ Điện Tử & Hóa Đơn</div>
                </div>
                <span class="text-slate-300 group-hover:text-emerald-600 transition text-xs">&rarr;</span>
              </button>

              <!-- 3. Thể Trạng & InBody -->
              <button type="button" onclick="navigateToMemberPage('member-fitness')" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition group ${currentTab === 'member-fitness' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}">
                <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                  📊
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-amber-700 transition">Thể Trạng & InBody</div>
                </div>
                <span class="text-slate-300 group-hover:text-amber-600 transition text-xs">&rarr;</span>
              </button>

              <!-- 4. Gửi Hỗ Trợ / Ticket -->
              <button type="button" onclick="closeUserDropdown(); openSupportTicketModal();" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition hover:bg-slate-50 text-slate-700 group">
                <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                  🎫
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-blue-600 transition">Hỗ Trợ & Khiếu Nại</div>
                </div>
                <span class="text-slate-300 group-hover:text-blue-600 transition text-xs">&rarr;</span>
              </button>
            ` : `
              <!-- Staff / Coach / Manager Items -->
              <button type="button" onclick="closeUserDropdown(); openUserProfileModal('INFO');" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition hover:bg-slate-50 text-slate-700 group">
                <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  👤
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-indigo-600 transition">Hồ Sơ Cá Nhân & Công Tác</div>
                </div>
                <span class="text-slate-300 group-hover:text-indigo-600 transition text-xs">&rarr;</span>
              </button>
              <button type="button" onclick="closeUserDropdown(); openUserProfileModal('SECURITY');" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition hover:bg-slate-50 text-slate-700 group">
                <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  🔒
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-indigo-600 transition">Bảo Mật & Mật Khẩu</div>
                </div>
                <span class="text-slate-300 group-hover:text-indigo-600 transition text-xs">&rarr;</span>
              </button>
            `}
          </div>

          <!-- Logout Button -->
          <div class="p-2">
            <button type="button" onclick="closeUserDropdown(); handleLogout();" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition hover:bg-rose-50 text-rose-600 group">
              <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                🚪
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold leading-tight text-rose-600">Đăng Xuất Tài Khoản</div>
              </div>
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Support Tickets: Member functions

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof recordAuditLog !== 'undefined') _targetGlobal.recordAuditLog = recordAuditLog;
  if (typeof addNotification !== 'undefined') _targetGlobal.addNotification = addNotification;
  if (typeof toggleNotificationDropdown !== 'undefined') _targetGlobal.toggleNotificationDropdown = toggleNotificationDropdown;
  if (typeof markAllNotificationsAsRead !== 'undefined') _targetGlobal.markAllNotificationsAsRead = markAllNotificationsAsRead;
  if (typeof markSingleNotificationAsRead !== 'undefined') _targetGlobal.markSingleNotificationAsRead = markSingleNotificationAsRead;
  if (typeof renderNotificationBell !== 'undefined') _targetGlobal.renderNotificationBell = renderNotificationBell;
  if (typeof toggleUserDropdown !== 'undefined') _targetGlobal.toggleUserDropdown = toggleUserDropdown;
  if (typeof closeUserDropdown !== 'undefined') _targetGlobal.closeUserDropdown = closeUserDropdown;
  if (typeof navigateToMemberPage !== 'undefined') _targetGlobal.navigateToMemberPage = navigateToMemberPage;
  if (typeof renderUserAvatarDropdown !== 'undefined') _targetGlobal.renderUserAvatarDropdown = renderUserAvatarDropdown;
}
