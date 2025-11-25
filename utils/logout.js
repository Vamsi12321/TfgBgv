export function logout() {
  // Clear localStorage
  localStorage.removeItem("bgvUser");

  // Clear all server cookies
  document.cookie = "bgvUser=; Path=/; Max-Age=0; SameSite=Lax; Secure";
  document.cookie = "bgvSession=; Path=/; Max-Age=0; SameSite=Lax; Secure";
  document.cookie = "bgvTemp=; Path=/; Max-Age=0; SameSite=Lax; Secure";

  // Redirect to login
  window.location.href = "/login";
}
