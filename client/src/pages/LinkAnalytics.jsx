import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import DailyClicksChart from "../components/DailyClicksChart";

function LinkAnalytics() {
    // useParams reads the ":id" part of the URL /analytics/:id
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest(`/api/analytics/${id}`)
            .then((res) => setData(res.data))
            .catch((err) => setError(err.message));
    }, [id]);

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">
                    &larr; Back to dashboard
                </Link>

                {error && <p className="text-red-600">{error}</p>}
                {!error && !data && <p className="text-slate-500">Loading...</p>}

                {data && (
                    <>
                        <div className="bg-white rounded-xl shadow p-5">
                            <h1 className="text-xl font-bold text-slate-800">
                                /{data.url.short_code}
                            </h1>
                            <p className="mt-1 text-sm text-slate-600 break-all">
                                {data.url.original_url}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Created {new Date(data.url.created_at).toLocaleDateString()}
                            </p>
                        </div>

                        <StatCard label="Total clicks" value={data.totalClicks} />

                        <div className="bg-white rounded-xl shadow p-5">
                            <h2 className="text-lg font-semibold text-slate-800 mb-3">
                                Clicks, last 30 days
                            </h2>
                            <DailyClicksChart data={data.dailyClicks} />
                        </div>

                        <div className="bg-white rounded-xl shadow p-5">
                            <h2 className="text-lg font-semibold text-slate-800 mb-3">
                                Top referrers
                            </h2>
                            {data.topReferrers.length === 0 ? (
                                <p className="text-sm text-slate-500">No clicks yet.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {data.topReferrers.map((r) => (
                                        <li
                                            key={r.referrer}
                                            className="flex justify-between py-2 text-sm"
                                        >
                                            <span className="truncate pr-4">{r.referrer}</span>
                                            <span className="font-semibold">{r.clicks}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default LinkAnalytics;