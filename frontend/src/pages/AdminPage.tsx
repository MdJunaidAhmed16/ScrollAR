import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { useAuthStore } from "../store/authStore";

const ADMIN_EMAIL = "mohammedjunaidah@gmail.com";

interface Stats {
  users: { total: number; new_today: number; new_this_week: number; dau: number; wau: number; retained: number };
  content: { papers: number; cards: number };
  engagement: { total_swipes: number; swipes_today: number; by_direction: Record<string, number>; total_bookmarks: number };
  charts: { signups_per_day: { date: string; count: number }[]; swipes_per_day: { date: string; count: number }[] };
  top_papers: { title: string; likes: number }[];
  recent_users: { username: string; email: string; joined: string | null; last_seen: string | null }[];
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-sm ${color}`}
            style={{ height: `${(d.count / max) * 52}px`, minHeight: "2px" }}
          />
          <span className="text-[9px] text-gray-600">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminPage() {
  const user = useAuthStore((s) => s.user);

  if (!user || user.email !== ADMIN_EMAIL) return <Navigate to="/feed" replace />;

  const { data, isLoading, error, refetch } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: () => client.get("/admin/stats").then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-3 text-gray-400">
        <p>Failed to load stats</p>
        <button onClick={() => refetch()} className="text-purple-400 underline text-sm">Retry</button>
      </div>
    );
  }

  const likeRate = data.engagement.total_swipes > 0
    ? Math.round((data.engagement.by_direction["right"] ?? 0) / data.engagement.total_swipes * 100)
    : 0;

  const retentionRate = data.users.total > 0
    ? Math.round((data.users.retained / data.users.total) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Auto-refreshes every 60s</p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg px-3 py-1.5"
        >
          Refresh
        </button>
      </div>

      {/* Users */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Users</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Users" value={data.users.total} />
          <StatCard label="DAU" value={data.users.dau} sub="Active in last 24h" />
          <StatCard label="WAU" value={data.users.wau} sub="Active in last 7 days" />
          <StatCard label="Retention" value={`${retentionRate}%`} sub={`${data.users.retained} returned users`} />
          <StatCard label="New Today" value={data.users.new_today} />
          <StatCard label="New This Week" value={data.users.new_this_week} />
        </div>
      </section>

      {/* Signups chart */}
      {data.charts.signups_per_day.length > 0 && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Signups — last 7 days</p>
          <MiniBar data={data.charts.signups_per_day} color="bg-purple-500" />
        </section>
      )}

      {/* Content */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Content</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Papers Ingested" value={data.content.papers} />
          <StatCard label="Cards Generated" value={data.content.cards} sub={`${data.content.papers - data.content.cards} pending`} />
        </div>
      </section>

      {/* Engagement */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Engagement</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Swipes" value={data.engagement.total_swipes} />
          <StatCard label="Swipes Today" value={data.engagement.swipes_today} />
          <StatCard label="Like Rate" value={`${likeRate}%`} sub={`${data.engagement.by_direction["right"] ?? 0} likes`} />
          <StatCard label="Bookmarks" value={data.engagement.total_bookmarks} />
        </div>
        {/* Direction breakdown */}
        <div className="mt-3 bg-gray-900 border border-gray-800 rounded-2xl p-4 flex justify-around text-center">
          {[
            { key: "left", label: "Skip", emoji: "👈", color: "text-red-400" },
            { key: "right", label: "Like", emoji: "👉", color: "text-green-400" },
            { key: "up", label: "Save", emoji: "👆", color: "text-blue-400" },
          ].map(({ key, label, emoji, color }) => (
            <div key={key}>
              <p className="text-lg">{emoji}</p>
              <p className={`text-xl font-bold ${color}`}>{data.engagement.by_direction[key] ?? 0}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Swipes chart */}
      {data.charts.swipes_per_day.length > 0 && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Swipes — last 7 days</p>
          <MiniBar data={data.charts.swipes_per_day} color="bg-green-500" />
        </section>
      )}

      {/* Top papers */}
      {data.top_papers.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Top Liked Papers</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
            {data.top_papers.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-gray-600 text-sm w-4">{i + 1}</span>
                <p className="flex-1 text-sm text-gray-300 line-clamp-2">{p.title}</p>
                <span className="text-green-400 text-sm font-semibold shrink-0">👍 {p.likes}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent users */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Recent Users</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
          {data.recent_users.map((u, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium">@{u.username}</span>
                <span className="text-xs text-gray-600">
                  {u.joined ? new Date(u.joined).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-gray-500">{u.email}</span>
                <span className="text-xs text-gray-600">
                  {u.last_seen ? `seen ${new Date(u.last_seen).toLocaleDateString()}` : "never seen"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
