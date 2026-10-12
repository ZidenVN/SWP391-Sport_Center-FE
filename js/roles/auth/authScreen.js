// =========================================================================
// AUTH SCREEN & HANDLERS
// =========================================================================

// ===================================================
// 1. AUTH SCREEN
// ===================================================
function renderAuthScreen() {
  const currentTab = appState.authTab;

  return `
    <style>
      :root, .auth-page-container {
        --color-navy: #0f172a;
        --color-blue: #2563eb;
        --color-blue-dark: #1d4ed8;
        --color-cyan: #0284c7;
        --color-desc: #64748b;
        --color-sub: #64748b;
        --color-placeholder: #94a3b8;
        --color-border: #e2e8f0;
        --color-border-logo: #e2e8f0;
        --bg-page: linear-gradient(135deg, #eef5fc 0%, #e0edf9 50%, #dbeafe 100%);
        --bg-card: #ffffff;
        --card-shadow: 0 20px 45px -10px rgba(37, 99, 235, 0.12), 0 8px 24px -6px rgba(15, 23, 42, 0.08);
        --btn-primary-bg: #2563eb;
      }

      .auth-page-container {
        min-height: 100vh;
        min-height: 100dvh;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-page);
        font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', Inter, sans-serif;
        overflow-y: auto;
        padding: 32px 16px;
        box-sizing: border-box;
        position: relative;
      }

      .auth-card {
        background: var(--bg-card);
        border-radius: 24px;
        box-shadow: var(--card-shadow);
        padding: 32px 32px 28px 32px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 420px;
        position: relative;
        z-index: 10;
        border: 1px solid rgba(255, 255, 255, 0.8);
      }

      .auth-welcome-title {
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.5px;
        line-height: 1.2;
        margin: 0 0 6px 0;
      }
      
      .auth-sub-title {
        font-size: 13px;
        color: #64748b;
        font-weight: 400;
        margin: 0;
      }

      .auth-block-gap {
        margin-bottom: 20px;
      }

      .auth-input-field {
        height: 44px !important;
        border-radius: 12px;
        font-size: 13.5px;
        box-sizing: border-box;
        background: #ffffff !important;
        border: 1.5px solid #e2e8f0 !important;
        color: #0f172a !important;
      }
      .auth-input-field::placeholder {
        color: #94a3b8 !important;
        font-size: 13px;
      }
      .auth-input-field:focus {
        border-color: #2563eb !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
      }
      .auth-input-field.input-error {
        border-color: #ef4444 !important;
      }
      .auth-input-field.input-error:focus {
        border-color: #dc2626 !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15) !important;
      }
      .field-error-msg {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #dc2626;
        font-size: 12px;
        font-weight: 500;
        margin-top: 4px;
        line-height: 1.2;
        min-height: 16px;
      }
      .field-error-msg:empty {
        display: none;
      }
      .field-error-msg svg {
        flex-shrink: 0;
        width: 13px;
        height: 13px;
      }

      .auth-btn-primary {
        height: 44px !important;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700 !important;
        box-sizing: border-box;
        background: #2563eb !important;
        box-shadow: 0 6px 18px -4px rgba(37, 99, 235, 0.4) !important;
        color: #ffffff !important;
        transition: all 0.15s ease;
      }
      .auth-btn-primary:hover {
        background: #1d4ed8 !important;
        box-shadow: 0 8px 22px -4px rgba(37, 99, 235, 0.5) !important;
      }

      .auth-btn-google {
        height: 44px !important;
        border-radius: 12px;
        font-size: 13.5px;
        box-sizing: border-box;
        background: #ffffff !important;
        border: 1.5px solid #e2e8f0 !important;
        color: #1e293b !important;
        font-weight: 600 !important;
        transition: all 0.15s ease;
      }
      .auth-btn-google:hover {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
      }
      
      .auth-google-icon {
        width: 18px;
        height: 18px;
      }

      .auth-input-icon {
        width: 18px;
        height: 18px;
      }

      @media (max-width: 480px) {
        .auth-card {
          padding: 24px 20px;
          border-radius: 20px;
        }
      }
    </style>

    <div class="auth-page-container">

      <!-- Background: Modern gym photo with dark navy overlay (55–65%) -->
      <div aria-hidden="true" class="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" style="background-color: #0b1329;">
        <!-- Real gym background image -->
        <img
          src="assets/images/gym-bg.jpg"
          alt=""
          loading="eager"
          class="w-full h-full"
          style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; filter: brightness(0.85) contrast(1.05);"
          onerror="this.src='https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'"
        />
        <!-- Dark navy / blue-gray overlay 55% - 62% for contrast -->
        <div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(11, 22, 44, 0.62) 0%, rgba(15, 30, 58, 0.56) 50%, rgba(10, 20, 40, 0.65) 100%);"></div>
        <!-- Soft subtle vignette around edges -->
        <div class="absolute inset-0" style="background: radial-gradient(circle at 50% 45%, transparent 40%, rgba(7, 14, 28, 0.45) 100%);"></div>
      </div>

      <!-- Top Header Brand / Logo -->
      <div class="relative z-10 flex items-center justify-center mb-6" style="margin-bottom: 24px;">
        <div style="display: inline-flex; align-items: center; gap: 14px; padding: 10px 16px; background: rgba(15, 31, 61, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.25);">
          <!-- Logo icon box -->
          <div style="width: 46px; height: 46px; min-width: 46px; background: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);">
            <svg style="width: 22px; height: 22px;" viewBox="0 0 24 24" fill="none" stroke="#0F1F3D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 9l2 3-2 3M22 9l-2 3 2 3"/>
            </svg>
          </div>
          <!-- Brand names -->
          <div style="display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.3px; line-height: 1.2;">Sport Center</div>
            <div style="font-size: 13px; font-weight: 500; color: #22C7E8; letter-spacing: 0.2px; margin-top: 2px; line-height: 1.2;">Gym Management System</div>
          </div>
        </div>
      </div>

      <!-- Login Card -->
      <div class="auth-card">

        <!-- Back link -->
        <button type="button" onclick="closeLoginScreen()" style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:#0f172a;background:none;border:none;cursor:pointer;padding:0;margin-bottom:18px;transition:color 0.15s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#0f172a'">
          <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Quay lại trang chủ
        </button>

        ${currentTab !== 'forgot' ? `
        <!-- Title -->
        <div class="auth-block-gap">
          <h2 class="auth-welcome-title">Welcome Back</h2>
          <p class="auth-sub-title">Đăng nhập để tiếp tục sử dụng Sport Center</p>
        </div>
        ` : ''}

        ${currentTab === 'login' ? renderLoginForm() : (currentTab === 'register' ? renderRegisterForm() : renderForgotPasswordForm())}

      </div>

    </div>
  `;
}

function renderLoginForm() {
  return `
    <div style="display:flex;flex-direction:column;">

      <form novalidate onsubmit="return handleFormLogin(event)" style="display:flex;flex-direction:column;gap:12px;">

        <!-- Email input -->
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#0f172a;margin-bottom:6px;">Email</label>
          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94a3b8;display:flex;align-items:center;">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <input type="email" id="login-email"
              placeholder="Nhập email của bạn"
              class="auth-input-field"
              oninput="clearFieldError('login-email')"
              style="width:100%;padding:0 14px 0 42px;outline:none;transition:border-color 0.15s, box-shadow 0.15s;"
            />
          </div>
          <div id="error-login-email" class="field-error-msg"></div>
        </div>

        <!-- Password input -->
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#0f172a;margin-bottom:6px;">Mật khẩu</label>
          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94a3b8;display:flex;align-items:center;">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input type="password" id="login-password"
              placeholder="Nhập mật khẩu"
              class="auth-input-field"
              oninput="clearFieldError('login-password')"
              style="width:100%;padding:0 42px 0 42px;outline:none;transition:border-color 0.15s, box-shadow 0.15s;"
            />
            <button type="button" onclick="(function(){const i=document.getElementById('login-password');i.type=i.type==='password'?'text':'password';})()"
              style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94a3b8;display:flex;align-items:center;padding:4px;" title="Hiện/Ẩn mật khẩu">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <div id="error-login-password" class="field-error-msg"></div>
        </div>

        <!-- Remember + Forgot -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12.5px;font-weight:500;color:#475569;">
            <input type="checkbox" id="login-remember" style="width:16px;height:16px;border-radius:4px;border:1.5px solid #cbd5e1;accent-color:#2563eb;cursor:pointer;" />
            Ghi nhớ đăng nhập
          </label>
          <button type="button" onclick="setAuthTab('forgot')" style="font-size:12.5px;font-weight:600;color:#2563eb;background:none;border:none;cursor:pointer;padding:0;text-decoration:none;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">
            Quên mật khẩu?
          </button>
        </div>

        <button type="submit" id="login-submit-btn" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center justify-center space-x-2">
          <span>Đăng Nhập Vào Hệ Thống</span>
        </button>

        <!-- Divider -->
        <div style="display:flex;align-items:center;gap:10px;margin:2px 0;">
          <div style="flex:1;height:1px;background:#e2e8f0;"></div>
          <span style="font-size:12px;color:#94a3b8;font-weight:500;">Hoặc</span>
          <div style="flex:1;height:1px;background:#e2e8f0;"></div>
        </div>

        <!-- Google login -->
        <button type="button" onclick="handleGoogleLogin()" class="auth-btn-google"
          style="width:100%;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;">
          <svg class="auth-google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Đăng nhập bằng Google</span>
        </button>

      </form>

      <!-- Register link -->
      <p style="text-align:center;margin-top:16px;font-size:12.5px;color:#64748b;font-weight:400;margin-bottom:0;">
        Chưa có tài khoản?
        <button type="button" onclick="setAuthTab('register')" style="font-size:12.5px;font-weight:600;color:#2563eb;background:none;border:none;cursor:pointer;padding:0 0 0 4px;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">Đăng ký</button>
      </p>

    </div>

  `;
}

function renderRegisterForm() {
  return `
    <div>
      <!-- Title for register -->
      <div style="margin-bottom:16px;">
        <h2 style="font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.4px;margin:0 0 4px;">Tạo tài khoản mới</h2>
        <p style="font-size:12px;color:#64748b;font-weight:400;margin:0;">Điền thông tin để đăng ký Hội Viên Sport Center</p>
      </div>

      <form novalidate onsubmit="return handleFormRegister(event)" style="display:flex;flex-direction:column;gap:8px;">
        <!-- Name row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;">
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:4px;text-transform:uppercase;">Họ <span style="color:#ef4444;">*</span></label>
            <input type="text" id="reg-lastname" placeholder="Ví dụ: Nguyễn"
              class="auth-input-field"
              oninput="clearFieldError('reg-lastname')"
              style="width:100%;height:40px;padding:0 12px;outline:none;" />
            <div id="error-reg-lastname" class="field-error-msg"></div>
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:4px;text-transform:uppercase;">Tên <span style="color:#ef4444;">*</span></label>
            <input type="text" id="reg-firstname" placeholder="Ví dụ: Văn A"
              class="auth-input-field"
              oninput="clearFieldError('reg-firstname')"
              style="width:100%;height:40px;padding:0 12px;outline:none;" />
            <div id="error-reg-firstname" class="field-error-msg"></div>
          </div>
        </div>

        <!-- Phone + Gender row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;">
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:4px;text-transform:uppercase;">Điện thoại <span style="color:#ef4444;">*</span></label>
            <input type="tel" id="reg-phone" placeholder="0987123456"
              class="auth-input-field"
              oninput="clearFieldError('reg-phone')"
              style="width:100%;height:40px;padding:0 12px;outline:none;" />
            <div id="error-reg-phone" class="field-error-msg"></div>
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:4px;text-transform:uppercase;">Giới tính <span style="color:#ef4444;">*</span></label>
            <select id="reg-gender"
              class="auth-input-field"
              onchange="clearFieldError('reg-gender')"
              style="width:100%;height:40px;padding:0 10px;cursor:pointer;outline:none;">
              <option value="MALE">Nam (MALE)</option>
              <option value="FEMALE">Nữ (FEMALE)</option>
              <option value="OTHER">Khác (OTHER)</option>
            </select>
            <div id="error-reg-gender" class="field-error-msg"></div>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:4px;text-transform:uppercase;">Địa chỉ Email <span style="color:#ef4444;">*</span></label>
          <input type="email" id="reg-email" placeholder="email@gmail.com"
            class="auth-input-field"
            oninput="clearFieldError('reg-email')"
            style="width:100%;height:40px;padding:0 12px;outline:none;" />
          <div id="error-reg-email" class="field-error-msg"></div>
        </div>

        <!-- Password row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;">
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:4px;text-transform:uppercase;">Mật khẩu <span style="color:#ef4444;">*</span></label>
            <input type="password" id="reg-password" placeholder="Tối thiểu 6 ký tự"
              class="auth-input-field"
              oninput="clearFieldError('reg-password')"
              style="width:100%;height:40px;padding:0 12px;outline:none;" />
            <div id="error-reg-password" class="field-error-msg"></div>
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:4px;text-transform:uppercase;">Xác nhận Mật Khẩu <span style="color:#ef4444;">*</span></label>
            <input type="password" id="reg-confirm-password" placeholder="Nhập lại mật khẩu"
              class="auth-input-field"
              oninput="clearFieldError('reg-confirm-password')"
              style="width:100%;height:40px;padding:0 12px;outline:none;" />
            <div id="error-reg-confirm-password" class="field-error-msg"></div>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" id="reg-submit-btn" class="auth-btn-primary"
          style="width:100%;height:42px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;">
          <span>Hoàn Tất Đăng Ký Tài Khoản</span>
        </button>

        <!-- Login link -->
        <p style="text-align:center;margin-top:8px;font-size:12px;color:#64748b;font-weight:400;margin-bottom:0;">
          Đã có tài khoản?
          <button type="button" onclick="setAuthTab('login')" style="font-size:12px;font-weight:600;color:#2563eb;background:none;border:none;cursor:pointer;padding:0 0 0 4px;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">Đăng nhập ngay</button>
        </p>
      </form>
    </div>
  `;
}

function renderForgotPasswordForm() {
  return `
    <div>
      <!-- Title -->
      <div style="margin-bottom:16px;">
        <h2 style="font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.4px;margin:0 0 4px;">Khôi phục mật khẩu</h2>
        <p style="font-size:12px;color:#64748b;font-weight:400;margin:0;">Nhập email để nhận mã xác minh OTP 6 chữ số</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;">
        <!-- Email + OTP -->
        <div>
          <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:5px;text-transform:uppercase;">Email của bạn</label>
          <div style="display:flex;gap:8px;">
            <input type="email" id="forgot-email" value="trang.pham@gmail.com" placeholder="email@gmail.com"
              class="auth-input-field"
              style="flex:1;height:40px;padding:0 12px;outline:none;" />
            <button type="button" onclick="handleSendOtpBtn()"
              style="height:40px;padding:0 14px;border-radius:10px;border:1.5px solid #e2e8f0;background:#f8fafc;font-size:12px;font-weight:600;color:#0f172a;cursor:pointer;white-space:nowrap;transition:all 0.15s;"
              onmouseover="this.style.background='#f1f5f9';this.style.borderColor='#2563eb';"
              onmouseout="this.style.background='#f8fafc';this.style.borderColor='#e2e8f0';">
              Gửi OTP
            </button>
          </div>
        </div>

        ${appState.otpSent ? `
          <div style="padding:10px 12px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;font-size:12px;color:#166534;">
            Mã OTP giả lập của bạn là: <strong>888999</strong> (Hạn 5 phút)
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:5px;text-transform:uppercase;">Nhập mã OTP (6 số)</label>
            <input type="text" id="forgot-otp" maxlength="6" value="888999"
              class="auth-input-field"
              style="width:100%;height:40px;padding:0 12px;font-size:16px;font-weight:800;text-align:center;letter-spacing:6px;outline:none;" />
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#0f172a;letter-spacing:0.2px;margin-bottom:5px;text-transform:uppercase;">Mật khẩu mới</label>
            <input type="password" id="forgot-newpass" value="123456"
              class="auth-input-field"
              style="width:100%;height:40px;padding:0 12px;outline:none;" />
          </div>
          <button type="button" onclick="handleVerifyAndResetPassword()" class="auth-btn-primary"
            style="width:100%;height:42px;border:none;cursor:pointer;margin-top:2px;">
            Xác Nhận Đổi Mật Khẩu
          </button>
        ` : ''}

        <p style="text-align:center;margin-top:4px;font-size:12px;color:#64748b;margin-bottom:0;">
          <button type="button" onclick="setAuthTab('login')" style="font-size:12px;font-weight:600;color:#2563eb;background:none;border:none;cursor:pointer;padding:0;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">← Quay lại đăng nhập</button>
        </p>
      </div>
    </div>
  `;
}


async function handleFormLogin(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const email = (emailInput?.value || '').trim();
  const password = passInput?.value || '';

  if (!email || !password) {
    showToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ Email và Mật khẩu', 'error');
    return false;
  }

  const submitBtn = document.getElementById('login-submit-btn');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>Đang xác thực tài khoản...</span>
    `;
  }

  try {
    const loginPayload = { email, password };
    let responseData = null;
    const authService = (typeof window !== 'undefined' && window.api && window.api.auth) ? window.api.auth : null;

    if (authService && typeof authService.login === 'function') {
      responseData = await authService.login(loginPayload);
    } else if (window.api && window.api.client && typeof window.api.client.post === 'function') {
      responseData = await window.api.client.post('/auth/login', loginPayload);
    } else {
      const baseUrl = (typeof window !== 'undefined' && window.api && window.api.client) ? window.api.client.getBaseUrl() : 'http://localhost:8080/api/v1';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginPayload),
          signal: controller.signal
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Đăng nhập thất bại (Mã lỗi: ${res.status})`);
        }
        responseData = await res.json();
      } finally {
        clearTimeout(timer);
      }
    }

    console.log('[Auth] Đăng nhập thành công từ API:', responseData);

    // 1. Lưu JWT token vào localStorage để apiClient tự động đính kèm Header Authorization
    if (responseData && responseData.token) {
      localStorage.setItem('token', responseData.token);
    }

    // 2. Xác định Role và Thông tin User
    let userRole = 'MEMBER';
    let userName = email.split('@')[0];
    let userPhone = '';
    let userGender = 'Nam';
    let memberId = 'MEM101';

    // Thử truy vấn danh sách users từ BE với Bearer token vừa nhận
    try {
      const users = await (window.api && window.api.client ? window.api.client.get('/users') : null);
      if (Array.isArray(users)) {
        const matched = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        if (matched) {
          if (matched.userId) memberId = 'MEM' + matched.userId;
          userName = `${matched.lastName || ''} ${matched.firstName || ''}`.trim() || matched.email;
          userPhone = matched.phone || '';
          userGender = matched.gender || 'Nam';
          if (matched.role && matched.role.roleName) {
            const rName = matched.role.roleName.toUpperCase();
            if (rName.includes('ADMIN') || rName.includes('MANAGER')) userRole = 'MANAGER';
            else if (rName.includes('COACH')) userRole = 'COACH';
            else if (rName.includes('RECEPTION')) userRole = 'RECEPTIONIST';
            else userRole = 'MEMBER';
          }
        }
      }
    } catch (ignore) {
      // Backend có thể chặn phân quyền GET /users, chuyển sang kiểm tra email / demoAccounts
    }

    // Map qua danh sách members / demoAccounts nếu khớp
    const matchedMember = appState.data?.members?.find(m => m.email && m.email.toLowerCase() === email.toLowerCase());
    const matchedDemo = appState.data?.demoAccounts?.find(a => a.email && a.email.toLowerCase() === email.toLowerCase());

    if (matchedMember) {
      memberId = matchedMember.memberId || matchedMember.id || memberId;
      userName = matchedMember.name || `${matchedMember.lastName || ''} ${matchedMember.firstName || ''}`.trim() || userName;
      userPhone = matchedMember.phone || userPhone;
      userGender = matchedMember.gender || userGender;
    } else if (matchedDemo) {
      userRole = matchedDemo.role;
      userName = matchedDemo.name || userName;
    } else if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('manager')) {
      userRole = 'MANAGER';
    } else if (email.toLowerCase().includes('coach')) {
      userRole = 'COACH';
    } else if (email.toLowerCase().includes('letan') || email.toLowerCase().includes('reception')) {
      userRole = 'RECEPTIONIST';
    }

    if (userRole === 'MEMBER') {
      if (!appState.data.members) appState.data.members = [];
      const existingIdx = appState.data.members.findIndex(m => m.email && m.email.toLowerCase() === email.toLowerCase());
      if (existingIdx === -1) {
        appState.data.members.unshift({
          memberId: memberId,
          id: memberId,
          name: userName,
          email: email,
          phone: userPhone,
          gender: userGender,
          status: 'ACTIVE',
          activePackage: 'Standard Gym & Cardio',
          startDate: '2026-10-01',
          endDate: '2026-11-01'
        });
      }
    }

    // 3. Cập nhật State ứng dụng
    appState.isAuthenticated = true;
    appState.isViewingAuthScreen = false;
    appState.currentRole = userRole;
    appState.currentUser = {
      id: memberId,
      name: userName,
      email: email,
      phone: userPhone,
      gender: userGender,
      role: userRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    // 4. Điều hướng vào đúng màn hình theo Role
    if (userRole === 'MANAGER') {
      appState.currentTab = 'dashboard';
    } else if (userRole === 'COACH') {
      appState.currentTab = 'coach-hub';
      appState.coachActiveTab = 'TODAY';
    } else if (userRole === 'RECEPTIONIST') {
      appState.currentTab = 'reception-kiosk';
      appState.receptionMode = 'GATE';
    } else {
      appState.currentTab = 'member-home';
    }

    renderApp();
    showToast('Đăng nhập thành công', `Chào mừng ${userName} (${getRoleLabel(userRole)})`, 'success');

  } catch (err) {
    console.error('[Auth] Lỗi đăng nhập:', err);
    let errMsg = err.message || 'Sai Email hoặc Mật khẩu!';

    // Fallback: nếu Backend phản hồi quá chậm (timeout), hoặc chưa bật, cho phép đăng nhập offline bằng tài khoản demo để trải nghiệm không bị gián đoạn
    if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError') || errMsg.includes('Timeout') || err.name === 'TimeoutError' || err.name === 'AbortError') {
      const acc = (appState.data && appState.data.demoAccounts) ? appState.data.demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase()) : null;
      if (acc) {
        quickLoginAs(acc.role);
        showToast('Chế độ Demo Offline', `Máy chủ Backend phản hồi chậm hoặc chưa bật. Đã đăng nhập tạm tài khoản mẫu ${acc.name}!`, 'info');
        return false;
      } else {
        const apiBase = (typeof window !== 'undefined' && window.api && window.api.client) ? window.api.client.getBaseUrl() : 'http://localhost:8080/api/v1';
        errMsg = `Không thể kết nối đến máy chủ (${apiBase}). Vui lòng kiểm tra lại dịch vụ Backend!`;
      }
    }

    showToast('Đăng nhập thất bại', errMsg, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }

  return false;
}

function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById('error-' + fieldId);
  if (input) {
    input.classList.add('input-error');
  }
  if (errorEl) {
    errorEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>${message}</span>
    `;
  }
}

function clearFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById('error-' + fieldId);
  if (input) {
    input.classList.remove('input-error');
  }
  if (errorEl) {
    errorEl.innerHTML = '';
  }
}

function clearAllRegisterErrors() {
  const fields = ['reg-lastname', 'reg-firstname', 'reg-phone', 'reg-gender', 'reg-email', 'reg-password', 'reg-confirm-password'];
  fields.forEach(f => clearFieldError(f));
}

async function handleFormRegister(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }

  clearAllRegisterErrors();

  const lastNameInput = document.getElementById('reg-lastname');
  const firstNameInput = document.getElementById('reg-firstname');
  const genderInput = document.getElementById('reg-gender');
  const emailInput = document.getElementById('reg-email');
  const phoneInput = document.getElementById('reg-phone');
  const passwordInput = document.getElementById('reg-password');
  const confirmPasswordInput = document.getElementById('reg-confirm-password');

  const lastName = (lastNameInput?.value || '').trim();
  const firstName = (firstNameInput?.value || '').trim();
  const gender = genderInput?.value || '';
  const email = (emailInput?.value || '').trim();
  const phone = (phoneInput?.value || '').trim();
  const password = passwordInput?.value || '';
  const confirmPassword = confirmPasswordInput?.value || '';

  let hasError = false;
  let firstErrorInput = null;

  // 1. Kiểm tra validation theo từng trường
  if (!lastName) {
    setFieldError('reg-lastname', 'Vui lòng nhập họ.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = lastNameInput;
  }

  if (!firstName) {
    setFieldError('reg-firstname', 'Vui lòng nhập tên.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = firstNameInput;
  }

  if (!phone) {
    setFieldError('reg-phone', 'Vui lòng nhập số điện thoại.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = phoneInput;
  }

  if (!gender) {
    setFieldError('reg-gender', 'Vui lòng chọn giới tính.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = genderInput;
  }

  if (!email) {
    setFieldError('reg-email', 'Vui lòng nhập email.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = emailInput;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldError('reg-email', 'Vui lòng nhập email hợp lệ.');
      hasError = true;
      if (!firstErrorInput) firstErrorInput = emailInput;
    }
  }

  if (!password) {
    setFieldError('reg-password', 'Vui lòng nhập mật khẩu.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = passwordInput;
  } else if (password.length < 6) {
    setFieldError('reg-password', 'Mật khẩu phải có ít nhất 6 ký tự.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = passwordInput;
  }

  if (!confirmPassword) {
    setFieldError('reg-confirm-password', 'Vui lòng xác nhận mật khẩu.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = confirmPasswordInput;
  } else if (password && confirmPassword && password !== confirmPassword) {
    setFieldError('reg-confirm-password', 'Mật khẩu xác nhận không khớp.');
    hasError = true;
    if (!firstErrorInput) firstErrorInput = confirmPasswordInput;
  }

  if (hasError) {
    if (firstErrorInput && typeof firstErrorInput.focus === 'function') {
      firstErrorInput.focus();
    }
    return false;
  }

  // 2. Chuẩn bị payload chuẩn theo API backend
  const registerPayload = {
    firstName: firstName,
    lastName: lastName,
    gender: gender,
    email: email,
    phone: phone,
    passwordHash: password
  };

  const submitBtn = document.getElementById('reg-submit-btn');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>Đang gửi thông tin đăng ký...</span>
    `;
  }

  try {
    // 3. Gọi Backend Register API
    let responseData = null;
    const authService = (typeof window !== 'undefined' && window.api && window.api.auth) ? window.api.auth : null;

    if (authService && typeof authService.register === 'function') {
      responseData = await authService.register(registerPayload);
    } else if (window.api && window.api.client && typeof window.api.client.post === 'function') {
      responseData = await window.api.client.post('/auth/register', registerPayload);
    } else {
      // Fallback gọi fetch trực tiếp tới API endpoint từ env với timeout 8s
      const baseUrl = (typeof window !== 'undefined' && window.api && window.api.client) ? window.api.client.getBaseUrl() : 'http://localhost:8080/api/v1';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`${baseUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registerPayload),
          signal: controller.signal
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = (data && (data.message || data.error || data.detail)) || `Đăng ký thất bại (Mã lỗi: ${res.status})`;
          throw new Error(msg);
        }
        responseData = data;
      } finally {
        clearTimeout(timer);
      }
    }

    console.log('[Auth] Đăng ký thành công từ API:', responseData);

    // 4. Đồng bộ vào Local App State & Demo Accounts
    const fullName = `${lastName} ${firstName}`.trim();
    if (appState && appState.data) {
      if (Array.isArray(appState.data.demoAccounts)) {
        const accIdx = appState.data.demoAccounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
        const accObj = {
          email: email,
          name: fullName,
          role: 'MEMBER',
          roleLabel: 'Hội Viên Mới',
          phone: phone,
          gender: gender
        };
        if (accIdx >= 0) {
          appState.data.demoAccounts[accIdx] = accObj;
        } else {
          appState.data.demoAccounts.push(accObj);
        }
      }

      if (Array.isArray(appState.data.members)) {
        const newMember = {
          memberId: 'MEM' + (100 + appState.data.members.length + 1),
          id: 'MEM' + (100 + appState.data.members.length + 1),
          firstName: firstName,
          lastName: lastName,
          name: fullName,
          email: email,
          phone: phone,
          gender: gender,
          status: 'ACTIVE'
        };
        appState.data.members.unshift(newMember);
      }
    }

    showToast('Đăng ký thành công', `Tài khoản ${email} đã được đăng ký thành công! Vui lòng đăng nhập.`, 'success');

    // 5. Chuyển tab sang Đăng Nhập và điền sẵn email
    setAuthTab('login');
    setTimeout(() => {
      const emailInput = document.getElementById('login-email');
      if (emailInput) {
        emailInput.value = email;
      }
      const passInput = document.getElementById('login-password');
      if (passInput) {
        passInput.value = '';
        passInput.focus();
      }
    }, 150);

  } catch (err) {
    console.error('[Auth] Lỗi đăng ký:', err);
    let errMsg = err.message || 'Đăng ký không thành công!';
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Timeout') || err.name === 'TimeoutError' || err.name === 'AbortError')) {
      const apiBase = (typeof window !== 'undefined' && window.api && window.api.client) ? window.api.client.getBaseUrl() : 'http://localhost:8080/api/v1';
      errMsg = `Không thể kết nối hoặc máy chủ phản hồi quá chậm (${apiBase}). Vui lòng kiểm tra lại dịch vụ Backend!`;
    }
    showToast('Đăng ký thất bại', errMsg, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }

  return false;
}

function handleSendOtpBtn() {
  appState.otpSent = true;
  renderApp();
  showToast('Đã gửi mã OTP', 'Mã xác minh 888999 đã được gửi đến email của bạn', 'info');
}

function handleVerifyAndResetPassword() {
  const otp = document.getElementById('forgot-otp')?.value;
  if (otp === '888999') {
    appState.authTab = 'login';
    renderApp();
    showToast('Thành công', 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập!', 'success');
  } else {
    showToast('Lỗi', 'Mã OTP không chính xác!', 'error');
  }
}

function handleGoogleLogin() {
  showToast('Đăng nhập Google', 'Tính năng đang được phát triển', 'info');
}

// Member Booking Interactions

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderAuthScreen !== 'undefined') _targetGlobal.renderAuthScreen = renderAuthScreen;
  if (typeof renderLoginForm !== 'undefined') _targetGlobal.renderLoginForm = renderLoginForm;
  if (typeof renderRegisterForm !== 'undefined') _targetGlobal.renderRegisterForm = renderRegisterForm;
  if (typeof renderForgotPasswordForm !== 'undefined') _targetGlobal.renderForgotPasswordForm = renderForgotPasswordForm;
  if (typeof handleFormLogin !== 'undefined') _targetGlobal.handleFormLogin = handleFormLogin;
  if (typeof handleFormRegister !== 'undefined') _targetGlobal.handleFormRegister = handleFormRegister;
  if (typeof handleSendOtpBtn !== 'undefined') _targetGlobal.handleSendOtpBtn = handleSendOtpBtn;
  if (typeof handleVerifyAndResetPassword !== 'undefined') _targetGlobal.handleVerifyAndResetPassword = handleVerifyAndResetPassword;
  if (typeof handleGoogleLogin !== 'undefined') _targetGlobal.handleGoogleLogin = handleGoogleLogin;
}
