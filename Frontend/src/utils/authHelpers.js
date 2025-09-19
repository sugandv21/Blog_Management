export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
