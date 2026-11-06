import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import StatCard from "./StatCard";
import DailyClicksChart from "./DailyClicksChart";
import TopLinksChart from "./TopLinksChart";

// "refreshKey" changes whenever the dashboard wants fresh numbers
function AnalyticsOverview({ refreshKey }) {
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        // "cancelled" stops an old request from updating state after the
        // component has re-run or disappeared
        let cancelled = false;

        apiRequest("/api/analytics/summary")
            .then((res) => {
                if (!cancelled) {
                    setSummary(res.data);
                    setError("");
                }
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            });

        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (!summary) return <p className="text-slate-500">Loading analytics...</p>;

    return (
        <section className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total links" value={summary.totalUrls} />
                <StatCard label="Total clicks" value={summary.totalClicks} />
                <StatCard label="Clicks today" value={summary.clicksToday} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">
                        Clicks, last 30 days
                    </h2>
                    <DailyClicksChart data={summary.dailyClicks} />
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">
                        Most popular links
                    </h2>
                    {summary.totalClicks === 0 ? (
                        <p className="text-slate-500 text-sm">No clicks yet.</p>
                    ) : (
                        <TopLinksChart data={summary.topLinks} />
                    )}
                </div>
            </div>
        </section>
    );
}

export default AnalyticsOverview;