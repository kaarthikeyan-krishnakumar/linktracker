import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import Navbar from "../components/Navbar";
import CreateLinkForm from "../components/CreateLinkForm";
import LinkTable from "../components/LinkTable";
import AnalyticsOverview from "../components/AnalyticsOverview";

function Dashboard() {
    const [urls, setUrls] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    // Runs on the first render, and again whenever "search" or "reloadKey" changes.
    useEffect(() => {
        // Debounce: wait 300ms after the last keystroke before calling the API,
        // so typing "google" sends 1 request instead of 6.
        const timer = setTimeout(async () => {
            try {
                const data = await apiRequest(
                    `/api/urls?search=${encodeURIComponent(search)}`
                );
                setUrls(data.data);
                setError("");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, 300);

        // Cleanup: if the user types again before 300ms, cancel the old timer.
        return () => clearTimeout(timer);
    }, [search, reloadKey]);

    const refresh = () => setReloadKey((key) => key + 1);

    const handleDelete = async (url) => {
        if (!window.confirm(`Delete ${url.shortUrl}? Its click history will be lost.`)) {
            return;
        }

        try {
            await apiRequest(`/api/urls/${url.id}`, { method: "DELETE" });
            // Remove it from the screen without another API call
            setUrls((current) => current.filter((u) => u.id !== url.id));
            refresh();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <AnalyticsOverview refreshKey={reloadKey} />
                <CreateLinkForm onCreated={refresh} />

                <div className="bg-white rounded-xl shadow">
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-800">Your links</h2>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by URL or code..."
                            className="rounded border border-slate-300 px-3 py-2 text-sm sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {error && <p className="px-4 pb-4 text-sm text-red-600">{error}</p>}

                    {loading ? (
                        <p className="p-8 text-center text-slate-500">Loading...</p>
                    ) : (
                        <LinkTable urls={urls} onDelete={handleDelete} />
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;