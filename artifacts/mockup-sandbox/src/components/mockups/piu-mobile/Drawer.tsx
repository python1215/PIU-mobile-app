import {
  Home, Folder, Users, Settings, DollarSign, TrendingUp,
  Shield, FileText, Map, AlertTriangle, AlertCircle,
  BarChart2, Briefcase, Wrench, Lock, LogOut, ChevronRight
} from "lucide-react";

const navItems = [
  { icon: Home,          label: "Dashboard",            active: false },
  { icon: Folder,        label: "Projects",             active: true },
  { icon: Users,         label: "Donors",               active: false },
  { icon: Settings,      label: "System Setup",         active: false },
  { icon: DollarSign,    label: "Financial Management", active: false },
  { icon: TrendingUp,    label: "Monitoring & Evaluation", active: false },
  { icon: Shield,        label: "Social & Environmental", active: false },
  { icon: FileText,      label: "Documentation",        active: false },
  { icon: Map,           label: "Project Map",          active: false },
  { icon: AlertTriangle, label: "Risk Assessment",      active: false },
  { icon: AlertCircle,   label: "Issues",               active: false },
  { icon: BarChart2,     label: "KPI Monitoring",       active: false },
  { icon: Briefcase,     label: "Project Actions",      active: false },
  { icon: Wrench,        label: "Administration",       active: false },
  { icon: Lock,          label: "Change Password",      active: false },
];

export function Drawer() {
  return (
    <div className="min-h-screen bg-white flex flex-col shadow-2xl">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 flex flex-col items-center"
        style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)" }}
      >
        <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center mb-3 ring-3 ring-white/30">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <p className="text-white font-bold text-base">Admin User</p>
        <p className="text-white/70 text-xs mt-0.5">System Administrator</p>
        <div className="mt-3 bg-white/20 rounded-full px-3 py-1">
          <span className="text-white text-xs font-semibold">● Online</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
              active ? "bg-blue-50 border-r-3 border-blue-600" : "hover:bg-gray-50"
            }`}
            style={active ? { borderRight: "3px solid #0d6efd" } : {}}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                active ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Icon size={15} className={active ? "text-white" : "text-gray-500"} />
            </div>
            <span className={`flex-1 text-sm font-${active ? "bold" : "medium"} ${active ? "text-blue-700" : "text-gray-700"}`}>
              {label}
            </span>
            <ChevronRight size={14} className={active ? "text-blue-400" : "text-gray-300"} />
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-5 py-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-xl px-3 py-3 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <LogOut size={15} className="text-red-500" />
          </div>
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
