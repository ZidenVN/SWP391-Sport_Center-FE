// =========================================================================
// COACH WEB APP: ROOT CONTROLLER & ORCHESTRATOR
// Modulized into clean sub-features:
// - features/coachAttendance.js  (Today classes, attendance checks, weekly calendar)
// - features/coachStudents.js   (Students roster, fitness tracking, workout plans)
// =========================================================================

import { 
  renderCoachTodayMode, 
  renderCoachWeekMode,
  selectCoachClass,
  toggleStudentAttendance,
  updateStudentNote,
  saveClassAttendance 
} from './features/coachAttendance.js';

import { 
  renderCoachStudentsMode,
  openAssignWorkoutPlanModal,
  closeAssignWorkoutPlanModal,
  handleAssignWorkoutPlan,
  renderAssignWorkoutPlanModal 
} from './features/coachStudents.js';

export function setCoachTab(tab) {
  appState.coachActiveTab = tab;
  renderApp();
}

export function renderCoachWebApp() {
  const activeTab = appState.coachActiveTab || 'TODAY';
  const rawCoachClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const selectedClass = appState.selectedClassForBooking || rawCoachClasses[0];
  const attendees = selectedClass?.attendees || [];

  return `
    <div class="min-h-screen bg-slate-100 flex flex-col font-sans">
      <!-- Coach Top Header Bar -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              CO
            </span>
            <div>
              <div class="text-xs font-black tracking-tight text-slate-900 uppercase">SPORTS CENTER COACH</div>
              <div class="text-[10px] text-indigo-600 font-bold">HLV Trần Hoàng Nam &bull; Boxing & Fitness</div>
            </div>
          </div>

          <!-- Coach Navigation Tabs -->
          <nav class="hidden md:flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
            <button type="button" onclick="setCoachTab('TODAY')" class="px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${activeTab === 'TODAY' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              <span>📋</span>
              <span>Lịch Dạy Hôm Nay</span>
            </button>
            <button type="button" onclick="setCoachTab('WEEK')" class="px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${activeTab === 'WEEK' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              <span>📅</span>
              <span>Lịch Tuần & Tháng</span>
            </button>
            <button type="button" onclick="setCoachTab('STUDENTS')" class="px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${activeTab === 'STUDENTS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              <span>🏋️</span>
              <span>Học Viên & Giáo Án</span>
            </button>
          </nav>

          <!-- Right Header Controls -->
          <div class="flex items-center space-x-3">
            <span class="hidden sm:inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100">
              ● Đang Trực Sàn
            </span>
            ${renderNotificationBell('COACH')}
            ${renderUserAvatarDropdown('COACH')}
          </div>
        </div>

        <!-- Mobile Coach Navigation -->
        <div class="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-200 space-x-2 text-xs">
          <button type="button" onclick="setCoachTab('TODAY')" class="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'TODAY' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}">Hôm Nay</button>
          <button type="button" onclick="setCoachTab('WEEK')" class="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'WEEK' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}">Lịch Tuần</button>
          <button type="button" onclick="setCoachTab('STUDENTS')" class="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'STUDENTS' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}">Học Viên</button>
        </div>
      </header>

      <!-- Main Coach Workspace -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        ${activeTab === 'TODAY' ? renderCoachTodayMode(rawCoachClasses, selectedClass, attendees) : ''}
        ${activeTab === 'WEEK' ? renderCoachWeekMode(rawCoachClasses) : ''}
        ${activeTab === 'STUDENTS' ? renderCoachStudentsMode(rawCoachClasses) : ''}
      </main>

      <!-- Workout Plan Modal -->
      ${appState.coachWorkoutPlanModalOpen ? renderAssignWorkoutPlanModal() : ''}
    </div>
  `;
}

// Global attachments
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  _targetGlobal.setCoachTab = setCoachTab;
  _targetGlobal.renderCoachWebApp = renderCoachWebApp;
}

export {
  renderCoachTodayMode,
  renderCoachWeekMode,
  selectCoachClass,
  toggleStudentAttendance,
  updateStudentNote,
  saveClassAttendance,
  renderCoachStudentsMode,
  openAssignWorkoutPlanModal,
  closeAssignWorkoutPlanModal,
  handleAssignWorkoutPlan,
  renderAssignWorkoutPlanModal
};
