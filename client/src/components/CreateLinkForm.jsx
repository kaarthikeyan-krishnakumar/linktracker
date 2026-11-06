import { useState } from "react";
import { apiRequest } from "../api";

// "onCreated" is a prop: a function the parent (Dashboard) gives us,
// which we call after a link is created so the parent can refresh the list.
function CreateLinkForm({ onCreated }) {
    const [originalUrl, setOriginalUrl] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await apiRequest("/api/urls", {
                method: "POST",
                body: { originalUrl: originalUrl.trim() }
            });

            setOriginalUrl("");
            onCreated();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-slate-800">Shorten a link</h2>

            <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/a/very/long/url"
                    required
                    className="flex-1 rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-indigo-600 text-white px-5 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Shortening..." : "Shorten"}
                </button>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </form>
    );
}

export default CreateLinkForm;