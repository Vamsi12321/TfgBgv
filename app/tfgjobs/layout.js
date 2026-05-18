"use client";

import { usePathname } from "next/navigation";
import JobSeekerNavbar from "./jobseeker/components/Navbar";

export default function JobSeekerLayout({ children }) {
  const pathname = usePathname();
  const hideNavFooter = pathname === "/tfgjobs/jobseeker/login" || pathname === "/tfgjobs/jobseeker/register";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!hideNavFooter && <JobSeekerNavbar />}
      <main className="flex-1">{children}</main>

      {!hideNavFooter && (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-lg font-extrabold text-white">TFG Jobs</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  AI-powered job portal connecting talented professionals with verified opportunities at top companies.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">For Job Seekers</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><a href="/tfgjobs/jobseeker/jobs" className="text-gray-400 hover:text-blue-400 transition">Browse Jobs</a></li>
                  <li><a href="/tfgjobs/jobseeker/register" className="text-gray-400 hover:text-blue-400 transition">Create Account</a></li>
                  <li><a href="/tfgjobs/jobseeker/profile" className="text-gray-400 hover:text-blue-400 transition">Build Profile</a></li>
                  <li><a href="/tfgjobs/jobseeker/dashboard" className="text-gray-400 hover:text-blue-400 transition">My Applications</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><a href="https://www.tfgorg.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">About TFG</a></li>
                  <li><a href="/login" className="text-gray-400 hover:text-blue-400 transition">For Employers</a></li>
                  <li><span className="text-gray-400">Careers</span></li>
                  <li><span className="text-gray-400">Blog</span></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
                <div className="space-y-2.5 text-sm text-gray-400">
                  <p>TFG AI Powered IT Solutions</p>
                  <p>T-Hub 4th Floor, Hyderabad</p>
                  <p>Telangana 500081</p>
                  <p className="pt-2">8886099008</p>
                  <p>naresh@tfgorg.com</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">2026 TFG Jobs. All rights reserved.</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="hover:text-blue-400 transition cursor-pointer">Privacy Policy</span>
                <span className="hover:text-blue-400 transition cursor-pointer">Terms of Service</span>
                <a href="https://www.tfgorg.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">tfgorg.com</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
