import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRole, UserAccount } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="login-page">
      <div class="login-wrapper">

        <!-- Main Login Card -->
        <section class="login-card">
          <header class="card-header">
            <div class="brand-row">
              <div class="brand-mark">E</div>
              <span class="brand-name">EventNest</span>
            </div>
            <p class="eyebrow">COMMUNITY & EVENT MANAGEMENT</p>
            <h1>Welcome back</h1>
            <p class="muted">Enter your account credentials to access your dashboard.</p>
          </header>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage" class="error-banner" role="alert">
            <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div class="error-text">
              <strong>Login failed</strong>
              <span>{{ errorMessage }}</span>
            </div>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="handleLogin()" class="login-form" novalidate>

            <!-- Identifier (Email / Username) -->
            <div class="form-group" [class.has-error]="fieldErrors.identifier">
              <label for="identifier">Email or Username</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
                <input
                  id="identifier"
                  type="text"
                  name="identifier"
                  [(ngModel)]="identifier"
                  (input)="clearErrors('identifier')"
                  placeholder="e.g. admin@eventnest.com or admin"
                  autocomplete="username"
                  required
                />
              </div>
              <small *ngIf="fieldErrors.identifier" class="field-error">
                {{ fieldErrors.identifier }}
              </small>
            </div>

            <!-- Password -->
            <div class="form-group" [class.has-error]="fieldErrors.password">
              <div class="label-row">
                <label for="password">Password</label>
                <button type="button" class="forgot-link" (click)="toggleForgotHint()">
                  Need help?
                </button>
              </div>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  (input)="clearErrors('password')"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="toggle-password"
                  (click)="showPassword = !showPassword"
                  [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                  title="{{ showPassword ? 'Hide password' : 'Show password' }}">
                  <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <small *ngIf="fieldErrors.password" class="field-error">
                {{ fieldErrors.password }}
              </small>
            </div>

            <!-- Forgot Hint Popup -->
            <div *ngIf="showForgotHint" class="hint-box">
              <p><b>Credentials Reminder:</b> Use any of the demo accounts listed below, or enter your registered account username and password.</p>
            </div>

            <!-- Utilities: Remember Me -->
            <div class="form-row">
              <label class="remember-label">
                <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
                <span>Keep me signed in</span>
              </label>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="submit-btn" [disabled]="isLoading">
              <span *ngIf="!isLoading">Sign In to EventNest</span>
              <span *ngIf="isLoading" class="loading-state">
                <span class="spinner"></span> Authenticating...
              </span>
            </button>
          </form>

          <!-- Divider -->
          <div class="divider">
            <span>OR QUICK-FILL DEMO CREDENTIALS</span>
          </div>

          <!-- Demo Roles Presets -->
          <div class="demo-section">
            <p class="demo-intro">Select a role below to auto-fill its verified credentials:</p>
            <div class="demo-grid">
              <button
                *ngFor="let acc of demoAccounts"
                type="button"
                class="demo-card"
                [class.selected]="identifier === acc.email || identifier === acc.username"
                (click)="applyCredentials(acc)">
                <div class="demo-card-head">
                  <span class="role-badge" [attr.data-role]="acc.role">{{ acc.role }}</span>
                  <span class="click-to-fill">Click to fill</span>
                </div>
                <div class="demo-details">
                  <div class="demo-line">
                    <span class="key">User:</span>
                    <code>{{ acc.username }}</code>
                  </div>
                  <div class="demo-line">
                    <span class="key">Pass:</span>
                    <code>{{ acc.passwords[0] }}</code>
                  </div>
                </div>
                <small class="demo-desc">{{ acc.description }}</small>
              </button>
            </div>
          </div>

          <footer class="card-footer">
            <p class="fine-print">
              Secure Local Authentication · EventNest Community Platform
            </p>
          </footer>
        </section>

      </div>
    </main>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px 16px;
      background: linear-gradient(135deg, #f4f5fa 0%, #ebeef8 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .login-wrapper {
      width: 100%;
      max-width: 520px;
    }

    .login-card {
      background: #ffffff;
      border: 1px solid #e3e6f0;
      border-radius: 24px;
      padding: 40px 36px;
      box-shadow: 0 20px 50px rgba(32, 40, 74, 0.08), 0 4px 12px rgba(32, 40, 74, 0.03);
    }

    .brand-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-mark {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: linear-gradient(135deg, #5b5ce2 0%, #4647c4 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 22px;
      box-shadow: 0 4px 12px rgba(91, 92, 226, 0.35);
    }

    .brand-name {
      font-size: 20px;
      font-weight: 800;
      color: #24283d;
      letter-spacing: -0.5px;
    }

    .eyebrow {
      margin: 20px 0 6px;
      color: #6869ce;
      font-size: 11px;
      letter-spacing: 1.4px;
      font-weight: 800;
      text-transform: uppercase;
    }

    h1 {
      font-size: 28px;
      font-weight: 800;
      color: #1f2338;
      letter-spacing: -0.8px;
      margin: 0 0 8px;
    }

    .muted {
      color: #6d7288;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 24px;
    }

    /* Error alert banner */
    .error-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 20px;
      color: #991b1b;
      animation: fadeIn 0.2s ease-out;
    }

    .alert-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: #dc2626;
      margin-top: 1px;
    }

    .error-text {
      display: flex;
      flex-direction: column;
      font-size: 13px;
      line-height: 1.4;
    }

    .error-text strong {
      font-weight: 700;
    }

    /* Form styling */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    label {
      font-size: 13px;
      font-weight: 700;
      color: #33384f;
    }

    .forgot-link {
      background: none;
      border: none;
      color: #5b5ce2;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      width: 18px;
      height: 18px;
      color: #8f95aa;
      pointer-events: none;
    }

    .input-wrapper input {
      width: 100%;
      height: 46px;
      padding: 0 42px 0 42px;
      border: 1.5px solid #dde1ee;
      border-radius: 12px;
      font-size: 14px;
      color: #1f2338;
      background: #fafbfe;
      outline: none;
      box-sizing: border-box;
      transition: all 0.15s ease;
    }

    .input-wrapper input:focus {
      background: #ffffff;
      border-color: #5b5ce2;
      box-shadow: 0 0 0 3px rgba(91, 92, 226, 0.15);
    }

    .has-error .input-wrapper input {
      border-color: #e53e3e;
      background: #fffafa;
    }

    .has-error .input-wrapper input:focus {
      box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.15);
    }

    .field-error {
      color: #dc2626;
      font-size: 12px;
      font-weight: 600;
      margin-top: 2px;
    }

    .toggle-password {
      position: absolute;
      right: 10px;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      background: none;
      border: none;
      color: #8f95aa;
      cursor: pointer;
      border-radius: 6px;
      padding: 0;
    }

    .toggle-password:hover {
      color: #464b63;
      background: #f0f2f8;
    }

    .toggle-password svg {
      width: 18px;
      height: 18px;
    }

    .hint-box {
      background: #f4f6fc;
      border: 1px solid #e1e5f2;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12px;
      color: #494e68;
      line-height: 1.4;
      animation: fadeIn 0.15s ease-out;
    }

    .hint-box p {
      margin: 0;
    }

    .form-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }

    .remember-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      color: #51566e;
    }

    .remember-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #5b5ce2;
      cursor: pointer;
    }

    /* Submit Button */
    .submit-btn {
      width: 100%;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #5b5ce2;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.1s ease;
      box-shadow: 0 4px 14px rgba(91, 92, 226, 0.3);
      margin-top: 4px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #4748cf;
      transform: translateY(-1px);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loading-state {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Divider */
    .divider {
      position: relative;
      text-align: center;
      margin: 28px 0 20px;
    }

    .divider::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e5e8f2;
    }

    .divider span {
      position: relative;
      background: #ffffff;
      padding: 0 12px;
      font-size: 11px;
      font-weight: 750;
      letter-spacing: 1px;
      color: #8b91a6;
    }

    /* Demo credentials presets */
    .demo-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .demo-intro {
      font-size: 12px;
      color: #6f748c;
      margin: 0 0 4px;
    }

    .demo-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .demo-card {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: left;
      padding: 12px 14px;
      border: 1.5px solid #e8eaf2;
      border-radius: 12px;
      background: #ffffff;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .demo-card:hover {
      border-color: #5b5ce2;
      background: #f8f9ff;
      transform: translateX(2px);
    }

    .demo-card.selected {
      border-color: #5b5ce2;
      background: #f3f4ff;
    }

    .demo-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .role-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-badge[data-role="Admin"] {
      background: #fee2e2;
      color: #991b1b;
    }

    .role-badge[data-role="Organizer"] {
      background: #e0e7ff;
      color: #3730a3;
    }

    .role-badge[data-role="Participant"] {
      background: #ecfdf5;
      color: #065f46;
    }

    .click-to-fill {
      font-size: 11px;
      font-weight: 700;
      color: #5b5ce2;
    }

    .demo-details {
      display: flex;
      gap: 16px;
      font-size: 12px;
      margin-top: 2px;
    }

    .demo-line {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .demo-line .key {
      color: #83889f;
      font-weight: 600;
    }

    .demo-line code {
      background: #eef1f9;
      padding: 2px 6px;
      border-radius: 5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #2b3046;
      font-size: 11px;
      font-weight: 600;
    }

    .demo-desc {
      color: #7b8097;
      font-size: 11px;
      line-height: 1.3;
      margin-top: 2px;
    }

    .card-footer {
      margin-top: 24px;
      text-align: center;
    }

    .fine-print {
      margin: 0;
      font-size: 11px;
      color: #9aa0b4;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 28px 20px;
        border-radius: 18px;
      }

      .demo-details {
        flex-direction: column;
        gap: 4px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  identifier = '';
  password = '';
  rememberMe = true;
  showPassword = false;
  isLoading = false;
  errorMessage: string | null = null;
  showForgotHint = false;

  fieldErrors: {
    identifier?: string;
    password?: string;
  } = {};

  readonly demoAccounts = this.authService.demoAccounts;

  ngOnInit(): void {
    // If user is already logged in, we could pre-fill or let them continue
    const current = this.authService.getCurrentUser();
    if (current) {
      this.identifier = current.email || current.username;
    }
  }

  clearErrors(field?: 'identifier' | 'password'): void {
    if (field) {
      delete this.fieldErrors[field];
    } else {
      this.fieldErrors = {};
    }
    this.errorMessage = null;
  }

  toggleForgotHint(): void {
    this.showForgotHint = !this.showForgotHint;
  }

  applyCredentials(account: UserAccount): void {
    this.identifier = account.email;
    this.password = account.passwords[0];
    this.clearErrors();
  }

  validate(): boolean {
    this.fieldErrors = {};
    let valid = true;

    if (!this.identifier || !this.identifier.trim()) {
      this.fieldErrors.identifier = 'Please enter your email or username.';
      valid = false;
    }

    if (!this.password || !this.password.trim()) {
      this.fieldErrors.password = 'Please enter your password.';
      valid = false;
    } else if (this.password.trim().length < 3) {
      this.fieldErrors.password = 'Password must be at least 3 characters.';
      valid = false;
    }

    return valid;
  }

  handleLogin(): void {
    if (!this.validate()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Small timeout for realistic smooth authentication UX
    setTimeout(() => {
      const result = this.authService.authenticate(
        this.identifier,
        this.password,
        this.rememberMe
      );

      this.isLoading = false;

      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = result.message || 'Invalid username or password.';
      }
    }, 400);
  }
}
