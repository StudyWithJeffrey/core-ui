import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  get isLoggedIn(): boolean {
    const authToken = localStorage.getItem('auth-token');
    let cookieTokenExists = false;

    for(const cookie of document.cookie.split(';')) {
      if(cookie.indexOf('auth-token') >= 0) {
        cookieTokenExists = true;
      }
    }

    return !!authToken && cookieTokenExists;
  }

  redirectUrl?: string;

  constructor() { }

  setAuthToken(token: string) {
    localStorage.setItem('auth-token', token);
    const expires = new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toUTCString();
    document.cookie = 'auth-token=' + token + ';path=/;expires=' + expires;
  }

  clearTokens() {
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  takeRedirectUrl(defaultValue = '/'): string|undefined {
    const url = this.redirectUrl;

    this.redirectUrl = undefined;

    if (!url) {
      return defaultValue;
    }

    return url;
  }
}
