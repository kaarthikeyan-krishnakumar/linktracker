import { useState } from "react";
import { Link } from "react-router-dom";

function LinkTable({ urls, onDelete }) {
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = async (url) => {
        try {
            await navigator.clipboard.writeText(url.shortUrl);
            setCopiedId(url.id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            alert("Could not copy. Please copy the link manually.");
        }
    };

    if (urls.length === 0) {
        return (
            <p className="p-8 text-center text-slate-500">
                No links found. Create your first one above.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3">Short link</th>
                        <th className="px-4 py-3">Original URL</th>
                        <th className="px-4 py-3">Clicks</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {urls.map((url) => (
                        <tr key={url.id} className="border-t border-slate-100">
                            <td className="px-4 py-3">
                                <a
                                    href={url.shortUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:underline"
                                >
                                    {url.shortUrl}
                                </a>
                            </td>
                            <td className="px-4 py-3 max-w-xs truncate" title={url.original_url}>
                                {url.original_url}
                            </td>
                            <td className="px-4 py-3 font-semibold">{url.click_count}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                {new Date(url.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <Link
                                        to={`/analytics/${url.id}`}
                                        className="rounded border border-indigo-300 text-indigo-600 px-2 py-1 mr-2 hover:bg-indigo-50">
                                        Analytics
                                </Link>
                                <button
                                    onClick={() => handleCopy(url)}
                                    className="rounded border border-slate-300 px-2 py-1 mr-2 hover:bg-slate-100"
                                >
                                    {copiedId === url.id ? "Copied!" : "Copy"}
                                </button>
                                <button
                                    onClick={() => onDelete(url)}
                                    className="rounded border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LinkTable;