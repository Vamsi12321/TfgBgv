import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // session cookies
  const sessionCookie =
    req.cookies.get("bgvSession")?.value ||
    req.cookies.get("bgvTemp")?.value ||
    null;

  // parse role
  const userCookie = req.cookies.get("bgvUser")?.value || null;
  let role = null;

  if (userCookie) {
    try {
      role = JSON.parse(userCookie)?.role?.toUpperCase() || null;
    } catch {
      role = null;
    }
  }

  // Public paths
  if (path.startsWith("/candidate")) return NextResponse.next();
  if (path === "/favicon.ico") return NextResponse.next();

  const isPublic = path.startsWith("/login");
  const isSuperAdminRoute = path.startsWith("/superadmin");
  const isOrgRoute = path.startsWith("/org");
  const requiresAuth = isSuperAdminRoute || isOrgRoute;

  // NOT LOGGED IN → redirect to /login
  if (requiresAuth && !sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Already Logged-in AND visiting /login
  if (path === "/login" && sessionCookie && role) {
    const redirectUrl = new URL("/", req.url);

    if (["SUPER_ADMIN", "SUPER_ADMIN_HELPER", "SUPER_SPOC"].includes(role))
      redirectUrl.pathname = "/superadmin/dashboard";

    if (["ORG_HR", "HELPER", "SPOC", "ORG_SPOC"].includes(role))
      redirectUrl.pathname = "/org/dashboard";

    return NextResponse.redirect(redirectUrl);
  }

  // ROLE PROTECTION
  if (sessionCookie && role) {
    // Org HR trying to access superadmin routes
    if (
      isSuperAdminRoute &&
      !["SUPER_ADMIN", "SUPER_ADMIN_HELPER", "SUPER_SPOC"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/org/dashboard", req.url));
    }

    // Superadmin trying to access org routes
    if (
      isOrgRoute &&
      !["ORG_HR", "HELPER", "SPOC", "ORG_SPOC"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/superadmin/dashboard", req.url));
    }

    // base routes
    if (path === "/superadmin") {
      return NextResponse.redirect(new URL("/superadmin/dashboard", req.url));
    }

    if (path === "/org") {
      return NextResponse.redirect(new URL("/org/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/public).*)"],
};
