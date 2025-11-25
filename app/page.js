"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("bgvUser");
    const tokenCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("bgvTemp="));

    if (storedUser && tokenCookie) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role?.toUpperCase();

        if (
          ["SUPER_ADMIN", "SUPER_ADMIN_HELPER", "SUPER_SPOC"].includes(role)
        ) {
          router.replace("/superadmin/dashboard");
          return;
        }
        if (["ORG_HR", "HELPER", "SPOC", "ORG_SPOC"].includes(role)) {
          router.replace("/org/dashboard");
          return;
        }
      } catch {
        localStorage.removeItem("bgvUser");
      }
    }

    router.replace("/login");
  }, [router]);

  // ❗VERY IMPORTANT — return LOADING UI instead of null
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin h-12 w-12 rounded-full border-4 border-[#ff004f] border-t-transparent"></div>
      <p className="mt-4 text-gray-500">Redirecting...</p>
    </div>
  );
}
