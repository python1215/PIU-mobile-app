import { Folder, AlertCircle, CheckCircle, TrendingUp, Menu, Bell, ChevronRight, BarChart2, Map } from "lucide-react";

const projects = [
  { id: "PIU-001", name: "Rural Water Supply Project", funding: "NGN 2,450,000", status: "Active" },
  { id: "PIU-002", name: "Road Infrastructure Development", funding: "USD 5,800,000", status: "Active" },
  { id: "PIU-003", name: "Health Facility Upgrade", funding: "EUR 1,200,000", status: "Active" },
];

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0d6efd] px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-5">
          <button className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Menu size={18} color="white" />
          </button>
          <span className="text-white font-bold text-base">Dashboard</span>
          <button className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center relative">
            <Bell size={18} color="white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full"></span>
          </button>
        </div>
        <p className="text-white/80 text-xs mb-1">Welcome back, Admin</p>
        <h2 className="text-white text-xl font-bold">PIU Management System</h2>
      </div>

      {/* Stats Grid */}
      <div className="px-5 -mt-4 grid grid-cols-2 gap-3 mb-4">
        <StatCard icon={Folder} label="Total Projects" value={12} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={AlertCircle} label="Open Issues" value={5} color="text-red-500" bg="bg-red-50" />
        <StatCard icon={CheckCircle} label="Resolved" value={28} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={TrendingUp} label="KPI Targets" value="74%" color="text-orange-500" bg="bg-orange-50" />
      </div>

      {/* Quick Access */}
      <div className="px-5 mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Access</p>
        <div className="flex gap-3">
          {[
            { icon: BarChart2, label: "KPI", color: "#8b5cf6" },
            { icon: Map, label: "Map", color: "#0d6efd" },
            { icon: AlertCircle, label: "Issues", color: "#ef4444" },
            { icon: TrendingUp, label: "M&E", color: "#10b981" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex-1 bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm border border-gray-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="px-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Recent Projects</p>
          <button className="text-xs text-blue-600 font-semibold">See All</button>
        </div>
        <div className="flex flex-col gap-2">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-3">
              <div className="bg-blue-50 rounded-xl px-2.5 py-1">
                <span className="text-blue-700 font-bold text-xs">{p.id}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.funding}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
