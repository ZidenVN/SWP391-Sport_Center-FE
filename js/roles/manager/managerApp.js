// =========================================================================
// MANAGER WEB APP: ROOT CONTROLLER & ORCHESTRATOR
// Modulized into clean sub-features:
// - features/managerDashboard.js
// - features/managerMembers.js
// - features/managerPackages.js
// - features/managerClasses.js
// - features/managerStaff.js
// - features/managerFinances.js
// - features/managerAudit.js
// =========================================================================

import { renderManagerDashboard, initChartsIfNeeded, refreshManagerDashboardFromApi } from './features/managerDashboard.js';
import { 
  renderManagerMembers, 
  refreshManagerUsersFromApi,
  setManagerMemberFilterRole,
  setManagerMemberFilterStatus,
  setManagerMemberSearch,
  openEditUserModal,
  renderEditUserModal,
  handleEditUserSubmit,
  openAssignRoleModal,
  renderAssignRoleModal,
  handleAssignRoleSubmit,
  handleToggleUserStatus,
  openRenewModal,
  confirmManagerRenew,
  renderRenewMemberModal 
} from './features/managerMembers.js';
import { 
  renderManagerPackages, 
  setManagerPackageFilter,
  setManagerPackageSearch,
  refreshManagerPackagesFromApi,
  openEditPackageModal,
  openDeletePackageModal,
  renderCreatePackageModal,
  renderEditPackageModal,
  renderDeletePackageModal,
  handleCreatePackageSubmit,
  handleEditPackageSubmit,
  confirmDeletePackage 
} from './features/managerPackages.js';
import { 
  renderManagerClasses, 
  renderCreateClassModal, 
  handleCreateClassSubmit,
  refreshManagerClassesFromApi,
  openAssignCoachModal,
  renderAssignCoachModal,
  handleAssignCoachSubmit,
  openDeleteClassModal,
  renderDeleteClassModal,
  confirmDeleteClass,
  openCreateRoomModal,
  renderCreateRoomModal,
  handleCreateRoomSubmit,
  openDeleteRoomModal,
  renderDeleteRoomModal,
  confirmDeleteRoom,
  setManagerClassSubView
} from './features/managerClasses.js';
import { 
  renderManagerStaff,
  refreshManagerCoachesFromApi,
  setManagerCoachSearch,
  setManagerCoachFilterSpecialty,
  openCreateCoachModal,
  openCoachDetailModal,
  openEditCoachModal,
  openDeleteCoachModal,
  renderCoachDetailModal,
  renderCreateCoachModal,
  renderEditCoachModal,
  renderDeleteCoachModal,
  handleCreateCoachSubmit,
  handleEditCoachSubmit,
  confirmDeleteCoach
} from './features/managerStaff.js';
import { renderManagerFinances } from './features/managerFinances.js';
import { renderManagerAuditLogs, setManagerAuditSearch, refreshManagerAuditLogsFromApi, goToAuditPage } from './features/managerAudit.js';

export function openManagerModal(modalName) {
  appState.managerActiveModal = modalName;
  renderApp();
}

export function closeManagerModal() {
  appState.managerActiveModal = null;
  appState.managerSelectedMemberForRenew = null;
  appState.managerSelectedPackageForEdit = null;
  appState.managerSelectedPackageForDelete = null;
  appState.managerSelectedUserForEdit = null;
  appState.managerSelectedUserForRole = null;
  appState.managerSelectedCoachForDetail = null;
  appState.managerSelectedCoachForEdit = null;
  appState.managerSelectedCoachForDelete = null;
  appState.managerSelectedClassForCoach = null;
  appState.managerSelectedClassForDelete = null;
  appState.managerSelectedRoomForDelete = null;
  renderApp();
}

export function getManagerTabTitle(tab) {
  switch (tab) {
    case 'dashboard': return 'Báo Cáo Tổng Quan & Doanh Thu';
    case 'manager-members': return 'Quản Lý Danh Sách Hội Viên';
    case 'manager-packages': return 'Danh Mục Các Gói Tập';
    case 'manager-classes': return 'Quản Lý Lớp Học & Phòng Tập';
    case 'manager-staff': return 'Quản Lý Nhân Sự & Huấn Luyện Viên';
    case 'manager-finances': return 'Sổ Cái Lịch Sử Hóa Đơn';
    case 'manager-audit': return 'Nhật Ký Kiểm Toán & Vết Thao Tác Hệ Thống';
    default: return 'Bảng Quản Trị';
  }
}

export function renderManagerWebApp() {
  const currentTab = appState.currentTab;

  return `
    <div class="min-h-screen bg-[#f8fafc] flex">
      <!-- Admin Left Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shadow-xs">
        <div>
          <div class="h-16 flex items-center px-6 border-b border-slate-200">
            <div class="flex items-center space-x-2.5">
              <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">SC</span>
              <div>
                <div class="font-extrabold text-xs tracking-tight text-slate-900 uppercase">SPORTS CENTER</div>
                <div class="text-[9px] text-indigo-600 font-bold uppercase">Center Admin</div>
              </div>
            </div>
          </div>

          <nav class="p-3.5 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">Quản Trị Hệ Thống</div>
            <button type="button" onclick="switchTab('dashboard')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'dashboard' ? 'bg-blue-50 text-blue-950 font-black border border-blue-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'}">
              <span>Báo Cáo Tổng Quan & KPIs</span>
            </button>
            <button type="button" onclick="switchTab('manager-members')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-members' ? 'bg-blue-50 text-blue-950 font-black border border-blue-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'}">
              <span>Quản Lý Hội Viên</span>
            </button>
            <button type="button" onclick="switchTab('manager-packages')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-packages' ? 'bg-blue-50 text-blue-950 font-black border border-blue-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'}">
              <span>Danh Mục Gói Tập</span>
            </button>
            <button type="button" onclick="switchTab('manager-classes')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-classes' ? 'bg-blue-50 text-blue-950 font-black border border-blue-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'}">
              <span>Lớp Học & Phòng Tập</span>
            </button>
            <button type="button" onclick="switchTab('manager-staff')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-staff' ? 'bg-blue-50 text-blue-950 font-black border border-blue-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'}">
              <span>Nhân Sự & HLV</span>
            </button>
            <button type="button" onclick="switchTab('manager-finances')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-finances' ? 'bg-blue-50 text-blue-950 font-black border border-blue-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'}">
              <span>Sổ Cái Hóa Đơn</span>
            </button>
            <button type="button" onclick="switchTab('manager-audit')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-audit' ? 'bg-blue-50 text-blue-950 font-black border border-blue-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'}">
              <span>Nhật Ký Kiểm Toán</span>
            </button>
          </nav>
        </div>
      </aside>

      <!-- Main Admin Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 rounded-md text-xs font-black bg-blue-50 text-blue-950 border border-blue-200">
              Quản Lý Trung Tâm (Manager)
            </span>
            <span class="text-xs text-slate-400">/</span>
            <span class="text-xs font-black text-slate-900">${getManagerTabTitle(currentTab)}</span>
          </div>

          <div class="flex items-center space-x-3">
            ${renderNotificationBell('MANAGER')}
            ${renderUserAvatarDropdown('MANAGER')}
          </div>
        </header>

        <!-- Admin Dynamic Body -->
        <main class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          ${currentTab === 'dashboard' ? renderManagerDashboard() : ''}
          ${currentTab === 'manager-members' ? renderManagerMembers() : ''}
          ${currentTab === 'manager-packages' ? renderManagerPackages() : ''}
          ${currentTab === 'manager-classes' ? renderManagerClasses() : ''}
          ${currentTab === 'manager-staff' ? renderManagerStaff() : ''}
          ${currentTab === 'manager-finances' ? renderManagerFinances() : ''}
          ${currentTab === 'manager-audit' ? renderManagerAuditLogs() : ''}
        </main>
      </div>

      <!-- Manager CRUD Modals -->
      ${appState.managerActiveModal === 'CREATE_PACKAGE' ? renderCreatePackageModal() : ''}
      ${appState.managerActiveModal === 'EDIT_PACKAGE' ? renderEditPackageModal() : ''}
      ${appState.managerActiveModal === 'DELETE_PACKAGE' ? renderDeletePackageModal() : ''}
      ${appState.managerActiveModal === 'CREATE_CLASS' ? renderCreateClassModal() : ''}
      ${appState.managerActiveModal === 'ASSIGN_COACH_MODAL' ? renderAssignCoachModal() : ''}
      ${appState.managerActiveModal === 'DELETE_CLASS_MODAL' ? renderDeleteClassModal() : ''}
      ${appState.managerActiveModal === 'CREATE_ROOM_MODAL' ? renderCreateRoomModal() : ''}
      ${appState.managerActiveModal === 'DELETE_ROOM_MODAL' ? renderDeleteRoomModal() : ''}
      ${appState.managerActiveModal === 'RENEW_MEMBER' ? renderRenewMemberModal() : ''}
      ${appState.managerActiveModal === 'EDIT_USER' ? renderEditUserModal() : ''}
      ${appState.managerActiveModal === 'ASSIGN_ROLE' ? renderAssignRoleModal() : ''}
      ${appState.managerActiveModal === 'DETAIL_COACH' ? renderCoachDetailModal() : ''}
      ${appState.managerActiveModal === 'CREATE_COACH' ? renderCreateCoachModal() : ''}
      ${appState.managerActiveModal === 'EDIT_COACH' ? renderEditCoachModal() : ''}
      ${appState.managerActiveModal === 'DELETE_COACH' ? renderDeleteCoachModal() : ''}
    </div>
  `;
}

// Global attachments
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  _targetGlobal.renderManagerWebApp = renderManagerWebApp;
  _targetGlobal.getManagerTabTitle = getManagerTabTitle;
  _targetGlobal.openManagerModal = openManagerModal;
  _targetGlobal.closeManagerModal = closeManagerModal;
  _targetGlobal.refreshManagerDashboardFromApi = refreshManagerDashboardFromApi;
  _targetGlobal.refreshManagerClassesFromApi = refreshManagerClassesFromApi;
  _targetGlobal.openAssignCoachModal = openAssignCoachModal;
  _targetGlobal.renderAssignCoachModal = renderAssignCoachModal;
  _targetGlobal.handleAssignCoachSubmit = handleAssignCoachSubmit;
  _targetGlobal.openDeleteClassModal = openDeleteClassModal;
  _targetGlobal.renderDeleteClassModal = renderDeleteClassModal;
  _targetGlobal.confirmDeleteClass = confirmDeleteClass;
  _targetGlobal.setManagerClassSubView = setManagerClassSubView;
  _targetGlobal.openCreateRoomModal = openCreateRoomModal;
  _targetGlobal.renderCreateRoomModal = renderCreateRoomModal;
  _targetGlobal.handleCreateRoomSubmit = handleCreateRoomSubmit;
  _targetGlobal.openDeleteRoomModal = openDeleteRoomModal;
  _targetGlobal.renderDeleteRoomModal = renderDeleteRoomModal;
  _targetGlobal.confirmDeleteRoom = confirmDeleteRoom;
  _targetGlobal.refreshManagerAuditLogsFromApi = refreshManagerAuditLogsFromApi;
  _targetGlobal.goToAuditPage = goToAuditPage;
  _targetGlobal.refreshManagerCoachesFromApi = refreshManagerCoachesFromApi;
  _targetGlobal.setManagerCoachSearch = setManagerCoachSearch;
  _targetGlobal.setManagerCoachFilterSpecialty = setManagerCoachFilterSpecialty;
  _targetGlobal.openCreateCoachModal = openCreateCoachModal;
  _targetGlobal.openCoachDetailModal = openCoachDetailModal;
  _targetGlobal.openEditCoachModal = openEditCoachModal;
  _targetGlobal.openDeleteCoachModal = openDeleteCoachModal;
  _targetGlobal.renderCoachDetailModal = renderCoachDetailModal;
  _targetGlobal.renderCreateCoachModal = renderCreateCoachModal;
  _targetGlobal.renderEditCoachModal = renderEditCoachModal;
  _targetGlobal.renderDeleteCoachModal = renderDeleteCoachModal;
  _targetGlobal.handleCreateCoachSubmit = handleCreateCoachSubmit;
  _targetGlobal.handleEditCoachSubmit = handleEditCoachSubmit;
  _targetGlobal.confirmDeleteCoach = confirmDeleteCoach;
}

export {
  renderManagerDashboard,
  initChartsIfNeeded,
  refreshManagerDashboardFromApi,
  renderManagerMembers,
  refreshManagerUsersFromApi,
  setManagerMemberFilterRole,
  setManagerMemberFilterStatus,
  setManagerMemberSearch,
  openEditUserModal,
  renderEditUserModal,
  handleEditUserSubmit,
  openAssignRoleModal,
  renderAssignRoleModal,
  handleAssignRoleSubmit,
  handleToggleUserStatus,
  openRenewModal,
  confirmManagerRenew,
  renderRenewMemberModal,
  renderManagerPackages,
  setManagerPackageFilter,
  setManagerPackageSearch,
  refreshManagerPackagesFromApi,
  openEditPackageModal,
  openDeletePackageModal,
  renderCreatePackageModal,
  renderEditPackageModal,
  renderDeletePackageModal,
  handleCreatePackageSubmit,
  handleEditPackageSubmit,
  confirmDeletePackage,
  renderManagerClasses,
  renderCreateClassModal,
  handleCreateClassSubmit,
  refreshManagerClassesFromApi,
  openAssignCoachModal,
  renderAssignCoachModal,
  handleAssignCoachSubmit,
  openDeleteClassModal,
  renderDeleteClassModal,
  confirmDeleteClass,
  openCreateRoomModal,
  renderCreateRoomModal,
  handleCreateRoomSubmit,
  openDeleteRoomModal,
  renderDeleteRoomModal,
  confirmDeleteRoom,
  setManagerClassSubView,
  renderManagerStaff,
  refreshManagerCoachesFromApi,
  setManagerCoachSearch,
  setManagerCoachFilterSpecialty,
  openCreateCoachModal,
  openCoachDetailModal,
  openEditCoachModal,
  openDeleteCoachModal,
  renderCoachDetailModal,
  renderCreateCoachModal,
  renderEditCoachModal,
  renderDeleteCoachModal,
  handleCreateCoachSubmit,
  handleEditCoachSubmit,
  confirmDeleteCoach,
  renderManagerFinances,
  renderManagerAuditLogs,
  setManagerAuditSearch,
  refreshManagerAuditLogsFromApi,
  goToAuditPage
};
