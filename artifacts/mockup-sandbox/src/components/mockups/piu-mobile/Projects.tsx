import { useState } from "react";
import { Search, Plus, ChevronRight, Menu, ArrowLeft, Filter } from "lucide-react";

const projects = [
  { id: "PIU-001", name: "Rural Water Supply Project", funding: "NGN 2,450,000", category: "Water & Sanitation", date: "2024-01-15", status: "Active" },
  { id: "PIU-002", name: "Road Infrastructure Development", funding: "USD 5,800,000", category: "Infrastructure", date: "2023-06-01", status: "Active" },
  { id: "PIU-003", name: "Health Facility Upgrade", funding: "EUR 1,200,000", category: "Health", date: "2024-03-20", status: "Active" },
  { id: "PIU-004", name: "Education Empowerment Program", funding: "USD 900,000", category: "Education", date: "2023-09-10", status: "Active" },
  { id: "PIU-005", name: "Agricultural Modernization", funding: "NGN 3,100,000", category: "Agriculture", date: "2024-02-01", status: "Active" },
  { id: "PIU-006", name: "Solar Energy Initiative", funding: "USD 2,200,000", category: "Energy", date: "2023-11-15", status: "Planning" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Water & Sanitation": { bg: "bg-blue-50", text: "text-blue-700" },
  Infrastructure: { bg: "bg-orange-50", text: "text-orange-700" },
  Health: { bg: "bg-red-50", text: "text-red-700" },
  Education: { bg: "bg-purple-50", text: "text-purple-700" },
  Agriculture: { bg: "bg-green-50", text: "text-green-700" },
  Energy: { bg: "bg-yellow-50", text: "text-yellow-700" },
};

export function Projects() {
  const [search, setSearch] = useState("");
  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0d6efd] px-5 pt-10 pb-5">
        <div className="flex items-center justify-between mb-4">
          <button className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Menu size={18} color="white" />
          </button>
          <span className="text-white font-bold text-base">Projects</span>
          <button className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus size={18} color="white" />
          </button>
        </div>
        {/* Search */}
        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-xl px-3 h-11 gap-2">
          <Search size={16} color="rgba(255,255,255,0.8)" />
          <input
            className="flex-1 bg-transparent text-white placeholder-white/60 text-sm outline-none"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Count */}
      <div className="px-5 py-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">{filtered.length} projects found</p>
        <button className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
          <Filter size={12} />
          Filter
        </button>
      </div>

      {/* List */}
      <div className="px-5 flex flex-col gap-3 flex-1">
        {filtered.map((p) => {
          const cat = CATEGORY_COLORS[p.category] || { bg: "bg-gray-50", text: "text-gray-700" };
          return (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <div className="flex items-start justify-between mb-2">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">{p.id}</span>
                <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg">{p.status}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{p.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{p.funding}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                  {p.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>{p.date}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No projects found</p>
          </div>
        )}
      </div>
      <div className="h-6" />
    </div>
  );
}
