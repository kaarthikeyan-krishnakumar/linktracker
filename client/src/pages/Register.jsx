import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // stop the browser from reloading the page
        setError("");
        setLoading(true);

        try {
            await apiRequest("/api/auth/register", {
                method: "POST",
                body: { name, email, password }
            });

            navigate("/login", { state: { registered: true } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow p-8 w-full max-w-sm"
            >
                <h1 className="text-2xl font-bold text-indigo-600">Create account</h1>
                <p className="text-slate-500 text-sm mt-1">Start tracking your links</p>

                {error && (
                    <p className="mt-4 rounded bg-red-50 text-red-700 text-sm p-3">
                        {error}
                    </p>
                )}

                <label className="block mt-4 text-sm font-medium text-slate-700">
                    Name
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </label>

                <label className="block mt-4 text-sm font-medium text-slate-700">
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </label>

                <label className="block mt-4 text-sm font-medium text-slate-700">
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p className="mt-4 text-sm text-slate-600 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Register;