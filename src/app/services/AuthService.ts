import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthUser {
	id: number;
	email: string;
}

interface LoginResponse {
	token: string;
	user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	// Store current user (null when logged out)
	private currentUserSig = signal<AuthUser | null>(null);
	
	// Store JWT token
	private tokenSig = signal<string | null>(null);

	// Derived auth state
	isAuthenticated = computed(() => this.currentUserSig() !== null);

	constructor(private client: HttpClient) {}

	login(email: string, password: string): Observable<LoginResponse> {
		return this.client.post<LoginResponse>('http://localhost:3000/users/login', { email, password }).pipe(
			tap(response => {
				const { token, user } = response;
				this.currentUserSig.set(user);
				this.tokenSig.set(token);
				// Persist token and user data
				localStorage.setItem('auth_token', token);
				localStorage.setItem('auth_user', JSON.stringify(user));
			})
		);
	}

	signup(email: string, password: string): Observable<LoginResponse> {
		return this.client.post<LoginResponse>('http://localhost:3000/users', { email, password }).pipe(
			tap(response => {
				const { token, user } = response;
				this.currentUserSig.set(user);
				this.tokenSig.set(token);
				// Persist token and user data
				localStorage.setItem('auth_token', token);
				localStorage.setItem('auth_user', JSON.stringify(user));
			})
		);
	}

	logout(): void {
		this.currentUserSig.set(null);
		this.tokenSig.set(null);
		localStorage.removeItem('auth_token');
		localStorage.removeItem('auth_user');
	}

	restore(): void {
		const token = localStorage.getItem('auth_token');
		const userRaw = localStorage.getItem('auth_user');
		
		if (token && userRaw) {
			try {
				const user: AuthUser = JSON.parse(userRaw);
				this.tokenSig.set(token);
				this.currentUserSig.set(user);
			} catch { /* ignore */ }
		}
	}

	getToken(): string | null {
		// Try signal first, fallback to localStorage
		const token = this.tokenSig();
		if (token) return token;
		
		// Fallback: check localStorage directly
		return localStorage.getItem('auth_token');
	}

	get currentUser(): AuthUser | null {
		return this.currentUserSig();
	}
}
