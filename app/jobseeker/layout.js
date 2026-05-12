import JobSeekerNavbar from "./components/Navbar";

export default function JobSeekerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <JobSeekerNavbar />

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-900 text-slate-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">TFG Jobs</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connecting talented professionals with their dream opportunities across the globe.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                {["Browse Jobs", "Create Profile", "Career Resources", "Salary Guide"].map((item) => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm">
                {["About Us", "Blog", "Press", "Careers"].map((item) => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm">
                {["Help Center", "Privacy Policy", "Terms of Service", "Contact Us"].map((item) => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} TFG Jobs. All rights reserved.</p>
            <p className="text-sm text-slate-500">Made with ❤️ for job seekers worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
