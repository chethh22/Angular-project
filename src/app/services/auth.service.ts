import { Injectable } from '@angular/core';

export type UserRole = 'Admin' | 'Organizer' | 'Participant';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  passwords: string[];
  role: UserRole;
  description: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  loginTime: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserSession;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly roleKey = 'eventnestRole';
  private readonly userKey = 'eventnest_user';

  // Demo accounts with credentials
  readonly demoAccounts: UserAccount[] = [
    {
      id: 'usr_admin',
      name: 'Alex Mitchell',
      email: 'admin@eventnest.com',
      username: 'admin',
      passwords: ['admin123', 'Admin@123', 'admin'],
      role: 'Admin',
      description: 'Full administrative access: create, edit & delete any event.'
    },
    {
      id: 'usr_organizer',
      name: 'Sarah Jenkins',
      email: 'organizer@eventnest.com',
      username: 'organizer',
      passwords: ['organizer123', 'Organizer@123', 'organizer'],
      role: 'Organizer',
      description: 'Event planner access: create, update and publish events.'
    },
    {
      id: 'usr_participant',
      name: 'David Chen',
      email: 'user@eventnest.com',
      username: 'user',
      passwords: ['user123', 'participant123', 'User@123', 'user', 'participant'],
      role: 'Participant',
      description: 'Community attendee access: discover and view events.'
    }
  ];

  /**
   * Authenticate user with email or username and password
   */
  authenticate(identifier: string, password: string, rememberMe = false): AuthResponse {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanId || !cleanPassword) {
      return {
        success: false,
        message: 'Please enter both username/email and password.'
      };
    }

    const matchedAccount = this.demoAccounts.find(
      acc => acc.email.toLowerCase() === cleanId || acc.username.toLowerCase() === cleanId
    );

    if (!matchedAccount) {
      return {
        success: false,
        message: 'No account found matching this email or username.'
      };
    }

    const isMatch = matchedAccount.passwords.includes(cleanPassword);
    if (!isMatch) {
      return {
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      };
    }

    const session: UserSession = {
      id: matchedAccount.id,
      name: matchedAccount.name,
      email: matchedAccount.email,
      username: matchedAccount.username,
      role: matchedAccount.role,
      loginTime: new Date().toISOString()
    };

    const targetStorage = rememberMe ? localStorage : sessionStorage;
    targetStorage.setItem(this.roleKey, matchedAccount.role);
    targetStorage.setItem(this.userKey, JSON.stringify(session));

    // Also populate sessionStorage for consistent synchronous retrieval
    sessionStorage.setItem(this.roleKey, matchedAccount.role);
    sessionStorage.setItem(this.userKey, JSON.stringify(session));

    return {
      success: true,
      user: session
    };
  }

  /**
   * Quick login helper for backward compatibility
   */
  login(role: UserRole): void {
    const acc = this.demoAccounts.find(a => a.role === role) || this.demoAccounts[0];
    const session: UserSession = {
      id: acc.id,
      name: acc.name,
      email: acc.email,
      username: acc.username,
      role: acc.role,
      loginTime: new Date().toISOString()
    };
    sessionStorage.setItem(this.roleKey, role);
    sessionStorage.setItem(this.userKey, JSON.stringify(session));
  }

  logout(): void {
    sessionStorage.removeItem(this.roleKey);
    sessionStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey);
  }

  getRole(): UserRole | null {
    return (sessionStorage.getItem(this.roleKey) || localStorage.getItem(this.roleKey)) as UserRole | null;
  }

  getCurrentUser(): UserSession | null {
    const raw = sessionStorage.getItem(this.userKey) || localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getRole() !== null;
  }
}
