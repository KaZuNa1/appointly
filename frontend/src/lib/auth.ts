// src/lib/auth.ts

const TOKEN_KEY = "appointly_token";

// Save JWT to storage
export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

// Get JWT
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Delete JWT (logout)
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/"; // redirect to home
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}
