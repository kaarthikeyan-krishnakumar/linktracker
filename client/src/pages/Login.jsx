import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { saveAuth } from "../auth";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const justRegistered = location.state?.registered;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await apiRequest("/api/auth/login", {
                method: "POST",
                body: { email, password }
            });

            saveAuth(data.token, data.user);
            navigate("/dashboard");
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
                <h1 className="text-2xl font-bold text-indigo-600">Welcome back</h1>
                <p className="text-slate-500 text-sm mt-1">Log in to LinkTrack</p>

                {justRegistered && !error && (
                    <p className="mt-4 rounded bg-green-50 text-green-700 text-sm p-3">
                        Registration successful. Please log in.
                    </p>
                )}

                {error && (
                    <p className="mt-4 rounded bg-red-50 text-red-700 text-sm p-3">
                        {error}
                    </p>
                )}

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
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Log in"}
                </button>

                <p className="mt-4 text-sm text-slate-600 text-center">
                    New here?{" "}
                    <Link to="/register" className="text-indigo-600 hover:underline">
                        Create an account
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;