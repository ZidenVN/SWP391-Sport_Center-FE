// =========================================================================
// RECEPTIONIST WEB APP: ROOT CONTROLLER & ORCHESTRATOR
// Modulized into clean sub-features:
// - features/receptionistGate.js  (Turnstile Gate Scanner & Real-time Check-in Stream)
// - features/receptionistPOS.js   (Front-Desk POS Cashier & Receipt Billing Modal)
// - features/receptionistOps.js   (Member Lookup, Rapid Renewal, Shift Cashier, Support Tickets)
// =========================================================================

import { 
  renderReceptionGateMode, 
  handleGateBarcodeSubmit, 
  simulateGateScan 
} from './features/receptionistGate.js';

import { 
  renderReceptionPOSMode, 
  renderPOSReceiptModal,
  selectPOSPackage,
  setPOSPaymentMethod,
  setPOSQuickCash,
  handlePOSCashInput,
  updatePOSCustInfo,
  handleSimulatePOSVnpayPaid,
  closePOSReceiptModal,
  handlePOSCheckout 
} from './features/receptionistPOS.js';

import { 
  renderReceptionLookupMode, 
  renderReceptionShiftMode, 
  renderReceptionTicketsMode,
  setReceptionSearchQuery,
  fastRenewMemberAtReception,
  setReceptionTicketFilter,
  handleResolveSupportTicket,
  handleRejectSupportTicket 
} from './features/receptionistOps.js';

export function setReceptionMode(mode) {
  appState.receptionMode = mode;
  renderApp();
}

export function renderReceptionistWebApp() {
  const mode = appState.receptionMode || 'GATE';

  return `
    <div class="min-h-screen bg-slate-100 flex flex-col font-sans">
      <!-- Receptionist Top Header & Fast Kiosk Bar -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              RE
            </span>
            <div>
              <div class="text-xs font-black tracking-tight text-slate-900 uppercase">SPORTS CENTER KIOT</div>
              <div class="text-[10px] text-slate-500 font-bold">Lễ Tân Thu Ngân (Reception Desk #01)</div>
            </div>
          </div>

          <!-- Kiosk Function Tabs -->
          <nav class="hidden md:flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
            <button type="button" onclick="setReceptionMode('GATE')" class="px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${mode === 'GATE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              <span>🚪</span>
              <span>Quét Cổng Vào</span>
            </button>
            <button type="button" onclick="setReceptionMode('POS')" class="px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${mode === 'POS' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              <span>💳</span>
              <span>Bán Thẻ POS</span>
            </button>
            <button type="button" onclick="setReceptionMode('LOOKUP')" class="px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${mode === 'LOOKUP' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              <span>🔍</span>
              <span>Tra Cứu & Gia Hạn</span>
            </button>
            <button type="button" onclick="setReceptionMode('SHIFT')" class="px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${mode === 'SHIFT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              <span>📊</span>
              <span>Sổ Quỹ Ca Trực</span>
            </button>
            <button type="button" onclick="setReceptionMode('TICKETS')" class="px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${mode === 'TICKETS' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              <span>🎫</span>
              <span>Hỗ Trợ Hội Viên</span>
              ${(appState.data?.supportTickets || []).filter(t => t.status === 'PENDING').length > 0 ? `
                <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                  ${(appState.data?.supportTickets || []).filter(t => t.status === 'PENDING').length}
                </span>
              ` : ''}
            </button>
          </nav>

          <!-- Top-Right Actions -->
          <div class="flex items-center space-x-3">
            <span class="hidden sm:inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
              ● Ca Trực Đang Mở
            </span>
            ${renderNotificationBell('RECEPTIONIST')}
            ${renderUserAvatarDropdown('RECEPTIONIST')}
          </div>
        </div>

        <!-- Mobile Navigation Bar -->
        <div class="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-200 space-x-2 text-xs">
          <button type="button" onclick="setReceptionMode('GATE')" class="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${mode === 'GATE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}">Quét Cổng</button>
          <button type="button" onclick="setReceptionMode('POS')" class="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${mode === 'POS' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">Bán Thẻ POS</button>
          <button type="button" onclick="setReceptionMode('LOOKUP')" class="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${mode === 'LOOKUP' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}">Tra Cứu</button>
          <button type="button" onclick="setReceptionMode('SHIFT')" class="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${mode === 'SHIFT' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}">Sổ Quỹ</button>
          <button type="button" onclick="setReceptionMode('TICKETS')" class="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${mode === 'TICKETS' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}">Hỗ Trợ</button>
        </div>
      </header>

      <!-- Main Kiosk Workspace -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        ${mode === 'GATE' ? renderReceptionGateMode() : ''}
        ${mode === 'POS' ? renderReceptionPOSMode() : ''}
        ${mode === 'LOOKUP' ? renderReceptionLookupMode() : ''}
        ${mode === 'SHIFT' ? renderReceptionShiftMode() : ''}
        ${mode === 'TICKETS' ? renderReceptionTicketsMode() : ''}
      </main>

      <!-- POS Receipt Modal -->
      ${renderPOSReceiptModal()}
    </div>
  `;
}

// Global attachments
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  _targetGlobal.setReceptionMode = setReceptionMode;
  _targetGlobal.renderReceptionistWebApp = renderReceptionistWebApp;
}

export {
  renderReceptionGateMode,
  handleGateBarcodeSubmit,
  simulateGateScan,
  renderReceptionPOSMode,
  renderPOSReceiptModal,
  selectPOSPackage,
  setPOSPaymentMethod,
  setPOSQuickCash,
  handlePOSCashInput,
  updatePOSCustInfo,
  handleSimulatePOSVnpayPaid,
  closePOSReceiptModal,
  handlePOSCheckout,
  renderReceptionLookupMode,
  renderReceptionShiftMode,
  renderReceptionTicketsMode,
  setReceptionSearchQuery,
  fastRenewMemberAtReception,
  setReceptionTicketFilter,
  handleResolveSupportTicket,
  handleRejectSupportTicket
};
