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
        --color-navy: #0A1F44;
        --color-blue: #2F6BF0;
        --color-blue-dark: #1D4ED8;
        --color-cyan: #0A94D1;
        --color-desc: #3F5273;
        --color-sub: #64748B;
        --color-placeholder: #8A97AE;
        --color-border: #DFE6F2;
        --color-border-logo: #D3E1F5;
        --bg-page: linear-gradient(120deg, #F6FAFF 0%, #E4EFFC 55%, #CFE2FA 100%);
        --bg-card: #FFFFFF;
        --card-shadow: 0 30px 70px -26px rgba(15, 67, 160, 0.4);
        --role-active-bg: linear-gradient(160deg, #4C86F7, #1D4ED8);
        --role-active-shadow: 0 10px 22px -8px rgba(47, 107, 240, 0.75);
        --btn-primary-bg: linear-gradient(90deg, #3B82F6, #1D4ED8);
      }

      .auth-page-container {
        height: 100vh;
        height: 100dvh;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        background: var(--bg-page);
        font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', Inter, sans-serif;
        overflow-y: auto;
        padding-bottom: env(safe-area-inset-bottom, 0px);
        box-sizing: border-box;
      }

      @media (min-width: 901px) and (min-height: 561px) {
        .auth-page-container {
          grid-template-columns: minmax(400px, 51vw) 1fr;
          overflow: hidden !important;
          padding-bottom: 0;
          height: 100vh;
          height: 100dvh;
        }
        .auth-left-panel {
          display: flex !important;
          height: 100%;
          max-height: 100dvh;
          overflow: hidden;
        }
        .auth-right-panel {
          height: 100%;
          max-height: 100dvh;
          overflow: hidden !important;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: clamp(24px, 5.2vh, 57px) clamp(16px, 2.6vw, 50px) 24px 24px;
          box-sizing: border-box;
        }
      }

      @media (max-width: 900px), (max-height: 560px) {
        .auth-page-container {
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100vh;
          min-height: 100dvh;
          display: block !important;
          padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
        }
        .auth-left-panel {
          display: none !important;
        }
        .auth-right-panel {
          height: auto !important;
          min-height: 100vh;
          min-height: 100dvh;
          overflow: visible !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 12px;
          box-sizing: border-box;
        }
        .auth-card {
          max-height: none !important;
          max-width: 100% !important;
        }
      }

      .auth-card {
        background: var(--bg-card);
        border-radius: clamp(24px, 2.5vw, 48px);
        box-shadow: var(--card-shadow);
        padding: clamp(20px, 3vw, 53px);
        max-height: calc(100dvh - clamp(24px, 5.2vh, 57px) - 24px);
        max-height: calc(100vh - clamp(24px, 5.2vh, 57px) - 24px);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        width: 100%;
        max-width: clamp(480px, 49vw, 925px);
        overflow-y: auto;
        scrollbar-width: thin;
      }

      .auth-welcome-title {
        font-size: clamp(28px, 2.7vw, 52px);
        font-weight: 800;
        color: var(--color-navy);
        letter-spacing: -0.5px;
        line-height: 1.15;
        margin: 0 0 clamp(4px, 0.6vh, 8px);
      }
      
      .auth-sub-title {
        font-size: clamp(14px, 1.25vw, 24px);
        color: var(--color-sub);
        font-weight: 400;
        margin: 0;
      }

      .auth-block-gap {
        margin-bottom: clamp(10px, 1.8vh, 24px);
      }

      .auth-role-btn {
        height: clamp(80px, 7vw, 130px);
        min-height: 68px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px 4px;
        border-radius: clamp(14px, 1.1vw, 22px);
        cursor: pointer;
        transition: all 0.18s;
        gap: clamp(6px, 0.8vw, 12px);
        box-sizing: border-box;
      }
      
      .auth-role-btn .role-icon {
        width: clamp(20px, 1.8vw, 34px) !important;
        height: clamp(20px, 1.8vw, 34px) !important;
      }

      .auth-role-btn .role-name {
        font-size: clamp(12px, 1.1vw, 22px) !important;
        font-weight: 500 !important;
      }

      .auth-input-field {
        height: clamp(44px, 3.7vw, 70px) !important;
        border-radius: clamp(12px, 1vw, 20px);
        font-size: clamp(14px, 1.1vw, 22px);
        box-sizing: border-box;
        background: #FFFFFF !important;
        border: 1.5px solid var(--color-border) !important;
        color: var(--color-navy) !important;
      }
      .auth-input-field::placeholder {
        color: var(--color-placeholder) !important;
      }
      .auth-input-field:focus {
        border-color: var(--color-blue) !important;
        box-shadow: 0 0 0 4px rgba(47, 107, 240, 0.2) !important;
      }

      .auth-btn-primary {
        height: clamp(44px, 3.7vw, 70px) !important;
        border-radius: clamp(12px, 1vw, 20px);
        font-size: clamp(15px, 1.25vw, 24px);
        font-weight: 700 !important;
        box-sizing: border-box;
        background: var(--btn-primary-bg) !important;
        box-shadow: 0 8px 24px -6px rgba(47, 107, 240, 0.5) !important;
        color: #FFFFFF !important;
      }

      .auth-btn-google {
        height: clamp(40px, 3vw, 64px) !important;
        border-radius: clamp(12px, 1vw, 20px);
        font-size: clamp(14px, 1.1vw, 22px);
        box-sizing: border-box;
        background: #FFFFFF !important;
        border: 1.5px solid var(--color-border) !important;
        color: var(--color-navy) !important;
      }
      
      .auth-google-icon {
        width: clamp(16px, 1.3vw, 24px);
        height: clamp(16px, 1.3vw, 24px);
      }

      .auth-left-content {
        padding: clamp(24px, 5.2vh, 57px) clamp(24px, 3.7vw, 70px);
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        height: 100%;
        box-sizing: border-box;
      }

      .auth-left-hero-margin {
        margin-top: clamp(24px, 4vw, 84px);
        margin-bottom: clamp(16px, 2vw, 32px);
      }

      .auth-feature-list {
        display: flex;
        flex-direction: row;
        gap: clamp(16px, 2.9vw, 55px);
        margin-top: clamp(16px, 2.5vw, 48px);
      }
      
      .auth-input-icon {
        width: clamp(16px, 1.4vw, 26px);
        height: clamp(16px, 1.4vw, 26px);
      }

      @media (max-width: 520px) {
        .auth-role-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }

      @media (max-height: 800px) {
        .auth-role-btn {
          height: 72px !important;
          min-height: 72px !important;
          padding: 6px 4px !important;
          gap: 3px !important;
        }
        .auth-card {
          padding: clamp(14px, 2.4vh, 22px) !important;
        }
        .auth-left-hero-margin {
          margin-top: 10px !important;
          margin-bottom: 8px !important;
        }
        .auth-feature-list {
          gap: 16px !important;
          margin-top: 12px !important;
        }
      }

      @media (max-height: 680px) {
        .auth-sub-title {
          display: none !important;
        }
        .auth-card {
          padding: 10px 16px !important;
        }
        .auth-block-gap {
          margin-bottom: 4px !important;
        }
        .auth-role-btn {
          height: 62px !important;
          min-height: 62px !important;
          padding: 4px 2px !important;
        }
        .auth-input-field {
          height: 38px !important;
        }
        .auth-btn-primary {
          height: 38px !important;
          font-size: 13.5px !important;
        }
        .auth-btn-google {
          height: 36px !important;
          font-size: 12.5px !important;
        }
      }
    </style>

    <div class="auth-page-container relative">

      <!-- Background: real gym photo, blurred + light blue overlay, spans full page but fades on right -->
      <div aria-hidden="true" class="fixed inset-0 z-0 pointer-events-none">
        <!-- Gym photo layer -->
        <img
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&auto=format&fit=crop&q=75"
          alt=""
          loading="lazy"
          class="w-full h-full object-cover"
          style="filter: blur(2px) brightness(0.95); opacity: 0.45; transform: scale(1.04);"
        />
        <!-- Blue-tint multiply layer -->
        <div class="absolute inset-0" style="background:#CFE2FA;mix-blend-mode:multiply;opacity:0.55;"></div>
        <!-- Gradient overlay: white-blue, fades right so card side is fully clean -->
        <div class="absolute inset-0" style="background:linear-gradient(120deg, rgba(246,250,255,.80) 0%, rgba(228,239,252,.92) 45%, rgba(207,226,250,1) 85%);"></div>
        <!-- Soft top fade -->
        <div class="absolute inset-0" style="background:linear-gradient(to bottom, rgba(246,250,255,.6) 0%, transparent 30%);"></div>
      </div>

      <!-- ===== LEFT PANEL ===== -->
      <div class="auth-left-panel hidden relative flex-shrink-0">
        <!-- Left panel content -->
        <div class="auth-left-content relative z-10 w-full">
          <!-- Logo box: square, rounded, white bg, navy dumbbell -->
          <div class="flex items-center" style="gap: clamp(12px, 1.4vw, 24px);">
            <div style="width:clamp(46px,4.5vw,84px);height:clamp(46px,4.5vw,84px);background:#FFFFFF;border:1.5px solid var(--color-border-logo);border-radius:clamp(12px,1.2vw,22px);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,67,160,0.06);">
              <svg style="width:clamp(22px,2vw,40px);height:clamp(22px,2vw,40px);" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 9l2 3-2 3M22 9l-2 3 2 3"/>
              </svg>
            </div>
            <div>
              <div style="font-size:clamp(18px,2.1vw,40px);font-weight:800;color:var(--color-navy);letter-spacing:-0.3px;line-height:1.2;">Sport Center</div>
              <div style="font-size:clamp(12px,1.4vw,26px);font-weight:500;color:var(--color-blue);letter-spacing:0.3px;margin-top:clamp(2px, 0.2vw, 4px);">Gym Management System</div>
            </div>
          </div>

          <!-- Main hero text -->
          <div class="auth-left-hero-margin">
            <h1 style="font-size:clamp(36px,5.5vw,104px);font-weight:800;line-height:1.05;color:var(--color-navy);letter-spacing:-0.04em;margin:0;">
              Train harder.
            </h1>
            <h1 style="font-size:clamp(36px,5.5vw,104px);font-weight:800;line-height:1.05;letter-spacing:-0.04em;color:var(--color-cyan);margin:0;">
              Live healthier.
            </h1>
            <p style="margin-top:clamp(16px,2vw,42px);font-size:clamp(14px,1.5vw,28px);line-height:1.6;color:var(--color-desc);font-weight:450;max-width:clamp(340px,38vw,740px);">
              All-in-one solution to manage memberships, classes, coaches and your fitness journey.
            </p>
          </div>

          <!-- Feature list: 3 items in a clean row with cyan icons and navy text -->
          <div>
            <div class="auth-feature-list">
              <div style="display:flex;flex-direction:column;align-items:flex-start;gap:clamp(8px,1.2vw,22px);">
                <svg style="width:clamp(24px,2.2vw,42px);height:clamp(24px,2.2vw,42px);" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <div style="font-size:clamp(12px,1.3vw,24px);font-weight:700;color:var(--color-navy);line-height:1.3;">Manage<br/>your membership</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-start;gap:clamp(8px,1.2vw,22px);">
                <svg style="width:clamp(24px,2.2vw,42px);height:clamp(24px,2.2vw,42px);" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div style="font-size:clamp(12px,1.3vw,24px);font-weight:700;color:var(--color-navy);line-height:1.3;">Book<br/>classes easily</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-start;gap:clamp(8px,1.2vw,22px);">
                <svg style="width:clamp(24px,2.2vw,42px);height:clamp(24px,2.2vw,42px);" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
                <div style="font-size:clamp(12px,1.3vw,24px);font-weight:700;color:var(--color-navy);line-height:1.3;">Track<br/>your progress</div>
              </div>
            </div>

            <!-- Copyright -->
            <div style="font-size:clamp(11px,1.1vw,20px);color:var(--color-sub);font-weight:500;margin-top:clamp(16px,3vw,64px);">
              &copy; 2025 Sport Center. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      <!-- ===== RIGHT PANEL ===== -->
      <div class="auth-right-panel w-full relative z-10">

        <!-- Right card -->
        <div class="auth-card">

          <!-- Back link -->
          <button type="button" onclick="closeLoginScreen()" style="display:inline-flex;align-items:center;gap:clamp(6px,0.8vw,12px);font-size:clamp(13px,1.2vw,22px);font-weight:600;color:var(--color-navy);background:none;border:none;cursor:pointer;padding:0;margin-bottom:clamp(12px,2vh,32px);transition:color 0.15s;" onmouseover="this.style.color='var(--color-blue)'" onmouseout="this.style.color='var(--color-navy)'">
            <svg style="width:clamp(14px,1.3vw,24px);height:clamp(14px,1.3vw,24px);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
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

    </div>
  `;
}

function renderLoginForm() {
  return `
    <div style="display:flex;flex-direction:column;">

      <!-- Role selector UI removed per user request -->

      <form onsubmit="return handleFormLogin(event)" style="display:flex;flex-direction:column;gap:clamp(12px,1.8vh,24px);">

        <!-- Email input -->
        <div>
          <label style="display:block;font-size:clamp(14px,1.25vw,22px);font-weight:700;color:var(--color-navy);letter-spacing:0.3px;margin-bottom:clamp(4px,0.8vh,8px);">Email</label>
          <div style="position:relative;">
            <span style="position:absolute;left:clamp(12px,1.2vw,20px);top:50%;transform:translateY(-50%);color:var(--color-sub);display:flex;align-items:center;">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <input type="email" id="login-email" required value="trang.pham@gmail.com"
              placeholder="Nhập email của bạn"
              class="auth-input-field"
              style="width:100%;padding:0 14px 0 clamp(36px,3.2vw,56px);outline:none;transition:border-color 0.15s, box-shadow 0.15s;"
            />
          </div>
        </div>

        <!-- Password input -->
        <div>
          <label style="display:block;font-size:clamp(14px,1.25vw,22px);font-weight:700;color:var(--color-navy);letter-spacing:0.3px;margin-bottom:clamp(4px,0.8vh,8px);">Mật khẩu</label>
          <div style="position:relative;">
            <span style="position:absolute;left:clamp(12px,1.2vw,20px);top:50%;transform:translateY(-50%);color:var(--color-sub);display:flex;align-items:center;">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input type="password" id="login-password" required value="123"
              placeholder="Nhập mật khẩu"
              class="auth-input-field"
              style="width:100%;padding:0 clamp(36px,3.2vw,56px) 0 clamp(36px,3.2vw,56px);outline:none;transition:border-color 0.15s, box-shadow 0.15s;"
            />
            <button type="button" onclick="(function(){const i=document.getElementById('login-password');i.type=i.type==='password'?'text':'password';})()"
              style="position:absolute;right:clamp(10px,1vw,16px);top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--color-sub);display:flex;align-items:center;padding:4px;" title="Hiện/Ẩn mật khẩu">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <!-- Remember + Forgot -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:clamp(2px,0.5vh,6px);">
          <label style="display:flex;align-items:center;gap:clamp(6px,0.8vw,10px);cursor:pointer;font-size:clamp(14px,1.25vw,22px);font-weight:400;color:var(--color-desc);">
            <input type="checkbox" id="login-remember" style="width:clamp(16px,1.4vw,24px);height:clamp(16px,1.4vw,24px);border-radius:4px;accent-color:var(--color-blue);cursor:pointer;" />
            Ghi nhớ đăng nhập
          </label>
          <button type="button" onclick="setAuthTab('forgot')" style="font-size:clamp(14px,1.25vw,22px);font-weight:500;color:var(--color-blue);background:none;border:none;cursor:pointer;padding:0;text-decoration:none;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">
            Quên mật khẩu?
          </button>
        </div>

        <!-- Submit button -->
        <button type="submit" id="login-submit-btn" class="auth-btn-primary"
          style="width:100%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity 0.15s,transform 0.1s;letter-spacing:0.1px;margin-top:clamp(4px,0.8vh,8px);"
          onmouseover="this.style.opacity='0.92';this.style.transform='translateY(-1px)'"
          onmouseout="this.style.opacity='1';this.style.transform='translateY(0)'">
          <span>Đăng nhập</span>
        </button>

        <!-- Divider -->
        <div style="display:flex;align-items:center;gap:10px;margin:clamp(2px, 0.5vh, 6px) 0;">
          <div style="flex:1;height:1px;background:var(--color-border);"></div>
          <span style="font-size:clamp(12px,1.1vw,20px);color:var(--color-sub);font-weight:400;">Hoặc</span>
          <div style="flex:1;height:1px;background:var(--color-border);"></div>
        </div>

        <!-- Google login -->
        <button type="button" onclick="handleGoogleLogin()" class="auth-btn-google"
          style="width:100%;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:background 0.15s,border-color 0.15s,box-shadow 0.15s;"
          onmouseover="this.style.background='#F6FAFF';this.style.borderColor='var(--color-blue)';this.style.boxShadow='0 2px 8px rgba(47,107,240,0.08)'"
          onmouseout="this.style.background='#FFFFFF';this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
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
      <p style="text-align:center;margin-top:clamp(12px,1.8vh,24px);font-size:clamp(14px,1.2vw,22px);color:var(--color-sub);font-weight:400;margin-bottom:0;">
        Chưa có tài khoản?
        <button type="button" onclick="setAuthTab('register')" style="font-size:clamp(14px,1.2vw,22px);font-weight:600;color:var(--color-blue);background:none;border:none;cursor:pointer;padding:0 0 0 6px;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">Đăng ký</button>
      </p>

    </div>

  `;
}

function renderRegisterForm() {
  return `
    <div>
      <!-- Title for register -->
      <div style="margin-bottom:20px;">
        <h2 style="font-size:22px;font-weight:800;color:#0A1F44;letter-spacing:-0.4px;margin:0 0 4px;">Tạo tài khoản mới</h2>
        <p style="font-size:13px;color:#64748b;font-weight:400;">Điền thông tin để đăng ký Hội Viên Sport Center</p>
      </div>

      <form onsubmit="return handleFormRegister(event)" style="display:flex;flex-direction:column;gap:12px;">
        <!-- Name row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:6px;text-transform:uppercase;">Họ <span style="color:#ef4444;">*</span></label>
            <input type="text" id="reg-lastname" required placeholder="Ví dụ: Nguyễn"
              style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:6px;text-transform:uppercase;">Tên <span style="color:#ef4444;">*</span></label>
            <input type="text" id="reg-firstname" required placeholder="Ví dụ: Văn A"
              style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
          </div>
        </div>

        <!-- Phone + Gender row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:6px;text-transform:uppercase;">Điện thoại <span style="color:#ef4444;">*</span></label>
            <input type="tel" id="reg-phone" required pattern="[0-9]{9,11}" placeholder="0987123456"
              style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:6px;text-transform:uppercase;">Giới tính <span style="color:#ef4444;">*</span></label>
            <select id="reg-gender"
              style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;cursor:pointer;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'">
              <option value="MALE">Nam (MALE)</option>
              <option value="FEMALE">Nữ (FEMALE)</option>
              <option value="OTHER">Khác (OTHER)</option>
            </select>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:6px;text-transform:uppercase;">Địa chỉ Email <span style="color:#ef4444;">*</span></label>
          <input type="email" id="reg-email" required placeholder="email@gmail.com"
            style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;"
            onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
            onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
        </div>

        <!-- Password row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:6px;text-transform:uppercase;">Mật khẩu <span style="color:#ef4444;">*</span></label>
            <input type="password" id="reg-password" required minlength="6" placeholder="Tối thiểu 6 ký tự"
              style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:6px;text-transform:uppercase;">Xác nhận MK <span style="color:#ef4444;">*</span></label>
            <input type="password" id="reg-confirm-password" required minlength="6" placeholder="Nhập lại mật khẩu"
              style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" id="reg-submit-btn"
          style="width:100%;height:50px;border-radius:14px;border:none;background:linear-gradient(135deg,#2F6BF0,#1D4ED8);color:#fff;font-size:14.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(47,107,240,0.28);transition:opacity 0.15s,transform 0.1s;margin-top:4px;"
          onmouseover="this.style.opacity='0.9';this.style.transform='translateY(-1px)'"
          onmouseout="this.style.opacity='1';this.style.transform='translateY(0)'">
          <span>Hoàn Tất Đăng Ký Tài Khoản</span>
        </button>

        <!-- Login link -->
        <p style="text-align:center;margin-top:6px;font-size:13px;color:#64748b;font-weight:400;">
          Đã có tài khoản?
          <button type="button" onclick="setAuthTab('login')" style="font-size:13px;font-weight:700;color:#2F6BF0;background:none;border:none;cursor:pointer;padding:0 0 0 4px;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">Đăng nhập ngay</button>
        </p>
      </form>
    </div>
  `;
}

function renderForgotPasswordForm() {
  return `
    <div>
      <!-- Title -->
      <div style="margin-bottom:20px;">
        <h2 style="font-size:22px;font-weight:800;color:#0A1F44;letter-spacing:-0.4px;margin:0 0 4px;">Khôi phục mật khẩu</h2>
        <p style="font-size:13px;color:#64748b;font-weight:400;">Nhập email để nhận mã xác minh OTP 6 chữ số</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;">
        <!-- Email + OTP -->
        <div>
          <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:7px;text-transform:uppercase;">Email của bạn</label>
          <div style="display:flex;gap:8px;">
            <input type="email" id="forgot-email" value="trang.pham@gmail.com" placeholder="email@gmail.com"
              style="flex:1;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
            <button type="button" onclick="handleSendOtpBtn()"
              style="height:46px;padding:0 16px;border-radius:12px;border:1.5px solid #e2e8f0;background:#f1f5f9;font-size:12.5px;font-weight:700;color:#475569;cursor:pointer;white-space:nowrap;transition:all 0.15s;"
              onmouseover="this.style.background='#e0eaff';this.style.borderColor='#2F6BF0';this.style.color='#2F6BF0'"
              onmouseout="this.style.background='#f1f5f9';this.style.borderColor='#e2e8f0';this.style.color='#475569'">
              Gửi OTP
            </button>
          </div>
        </div>

        ${appState.otpSent ? `
          <div style="padding:12px 14px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;font-size:12.5px;color:#166534;">
            Mã OTP giả lập của bạn là: <strong>888999</strong> (Hạn 5 phút)
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:7px;text-transform:uppercase;">Nhập mã OTP (6 số)</label>
            <input type="text" id="forgot-otp" maxlength="6" value="888999"
              style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:18px;font-weight:800;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;text-align:center;letter-spacing:8px;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#0A1F44;letter-spacing:0.3px;margin-bottom:7px;text-transform:uppercase;">Mật khẩu mới</label>
            <input type="password" id="forgot-newpass" value="123456"
              style="width:100%;height:46px;padding:0 14px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:13.5px;color:#0A1F44;background:#fff;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;"
              onfocus="this.style.borderColor='#2F6BF0';this.style.boxShadow='0 0 0 3px rgba(47,107,240,0.10)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'" />
          </div>
          <button type="button" onclick="handleVerifyAndResetPassword()"
            style="width:100%;height:50px;border-radius:14px;border:none;background:linear-gradient(135deg,#2F6BF0,#1D4ED8);color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(47,107,240,0.28);transition:opacity 0.15s;"
            onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            Xác Nhận Đổi Mật Khẩu
          </button>
        ` : ''}

        <p style="text-align:center;margin-top:4px;font-size:13px;color:#64748b;">
          <button type="button" onclick="setAuthTab('login')" style="font-size:13px;font-weight:700;color:#2F6BF0;background:none;border:none;cursor:pointer;padding:0;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">← Quay lại đăng nhập</button>
        </p>
      </div>
    </div>
  `;
}


function selectAuthRole(role) {
  const roles = ['MEMBER', 'RECEPTIONIST', 'COACH', 'MANAGER'];
  roles.forEach(r => {
    const btn = document.getElementById('role-btn-' + r);
    if (!btn) return;
    if (r === role) {
      btn.style.background = 'linear-gradient(160deg, #4C86F7, #1D4ED8)';
      btn.style.borderColor = '#4C86F7';
      btn.style.boxShadow = '0 10px 22px -8px rgba(47, 107, 240, 0.75)';
      btn.onmouseover = null;
      btn.onmouseout = null;
      btn.querySelectorAll('*').forEach(el => {
        el.style.color = '#fff';
        if (el.tagName && (el.tagName.toLowerCase() === 'svg' || el.tagName.toLowerCase() === 'path' || el.tagName.toLowerCase() === 'rect' || el.tagName.toLowerCase() === 'line' || el.tagName.toLowerCase() === 'circle')) {
          el.style.stroke = '#fff';
        }
      });
    } else {
      btn.style.background = '#FFFFFF';
      btn.style.borderColor = '#DFE6F2';
      btn.style.boxShadow = '0 1px 3px rgba(15, 67, 160, 0.04)';
      btn.onmouseover = function() {
        this.style.background = '#F6FAFF';
        this.style.borderColor = '#2F6BF0';
      };
      btn.onmouseout = function() {
        this.style.background = '#FFFFFF';
        this.style.borderColor = '#DFE6F2';
      };
      btn.querySelectorAll('*').forEach(el => {
        el.style.color = '#0A1F44';
        if (el.tagName && (el.tagName.toLowerCase() === 'svg' || el.tagName.toLowerCase() === 'path' || el.tagName.toLowerCase() === 'rect' || el.tagName.toLowerCase() === 'line' || el.tagName.toLowerCase() === 'circle')) {
          el.style.stroke = '#0A1F44';
        }
      });
      const icon = btn.querySelector('.role-icon');
      if (icon) {
        icon.style.color = '#0A1F44';
        icon.style.stroke = '#0A1F44';
      }
      const name = btn.querySelector('.role-name');
      if (name) name.style.color = '#0A1F44';
    }
  });

  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (emailInput && passInput) {
    if (role === 'MEMBER') emailInput.value = 'trang.pham@gmail.com';
    else if (role === 'RECEPTIONIST') emailInput.value = 'letan@sportscenter.vn';
    else if (role === 'COACH') emailInput.value = 'coach@sportscenter.vn';
    else if (role === 'MANAGER') emailInput.value = 'admin@sportscenter.vn';
    passInput.value = '123';
  }
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
    } else {
      const baseUrl = (typeof window !== 'undefined' && window.api && window.api.client) ? window.api.client.getBaseUrl() : 'http://localhost:8080/api/v1';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Đăng nhập thất bại (Mã lỗi: ${res.status})`);
      }
      responseData = await res.json();
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

    // Fallback: nếu Backend chưa bật, cho phép đăng nhập offline bằng tài khoản demo để trải nghiệm không bị gián đoạn
    if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
      const acc = (appState.data && appState.data.demoAccounts) ? appState.data.demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase()) : null;
      if (acc) {
        quickLoginAs(acc.role);
        showToast('Chế độ Demo Offline', `Máy chủ Backend chưa bật. Đã đăng nhập tạm tài khoản mẫu ${acc.name}!`, 'info');
        return false;
      } else {
        const apiBase = (typeof window !== 'undefined' && window.api && window.api.client) ? window.api.client.getBaseUrl() : 'http://localhost:8080/api/v1';
        errMsg = `Không thể kết nối đến máy chủ (${apiBase}). Vui lòng kiểm tra lại dịch vụ Backend Spring Boot!`;
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

async function handleFormRegister(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }

  const lastName = (document.getElementById('reg-lastname')?.value || '').trim();
  const firstName = (document.getElementById('reg-firstname')?.value || '').trim();
  const gender = document.getElementById('reg-gender')?.value || 'MALE';
  const email = (document.getElementById('reg-email')?.value || '').trim();
  const phone = (document.getElementById('reg-phone')?.value || '').trim();
  const password = document.getElementById('reg-password')?.value || '';
  const confirmPassword = document.getElementById('reg-confirm-password')?.value || '';

  // 1. Kiểm tra validation phía client
  if (!lastName || !firstName) {
    showToast('Lỗi nhập liệu', 'Vui lòng nhập đầy đủ Họ và Tên', 'error');
    return false;
  }
  if (!phone) {
    showToast('Lỗi nhập liệu', 'Vui lòng nhập số điện thoại liên hệ', 'error');
    return false;
  }
  if (!email) {
    showToast('Lỗi nhập liệu', 'Vui lòng nhập địa chỉ email hợp lệ', 'error');
    return false;
  }
  if (!password || password.length < 6) {
    showToast('Mật khẩu yếu', 'Mật khẩu phải chứa tối thiểu 6 ký tự', 'error');
    return false;
  }
  if (confirmPassword && password !== confirmPassword) {
    showToast('Mật khẩu không khớp', 'Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập', 'error');
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
    } else {
      // Fallback gọi fetch trực tiếp tới API endpoint từ env
      const baseUrl = (typeof window !== 'undefined' && window.api && window.api.client) ? window.api.client.getBaseUrl() : 'http://localhost:8080/api/v1';
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerPayload)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (data && (data.message || data.error || data.detail)) || `Đăng ký thất bại (Mã lỗi: ${res.status})`;
        throw new Error(msg);
      }
      responseData = data;
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
    if (err.message && err.message.includes('Failed to fetch')) {
      const apiBase = (typeof window !== 'undefined' && window.api && window.api.client) ? window.api.client.getBaseUrl() : 'http://localhost:8080/api/v1';
      errMsg = `Không thể kết nối đến máy chủ (${apiBase}). Vui lòng kiểm tra lại dịch vụ Backend đang chạy!`;
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
  if (typeof selectAuthRole !== 'undefined') _targetGlobal.selectAuthRole = selectAuthRole;
}
