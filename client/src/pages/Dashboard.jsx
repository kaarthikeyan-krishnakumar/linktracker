import { useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../auth";

function Dashboard() {
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow p-8 text-center">
                <h1 className="text-2xl font-bold text-indigo-600">
                    Welcome, {user?.name}
                </h1>
                <p className="mt-2 text-slate-600">Dashboard coming next.</p>
                <button
                    onClick={handleLogout}
                    className="mt-6 rounded bg-slate-800 text-white px-4 py-2 hover:bg-slate-900"
                >
                    Log out
                </button>
            </div>
        </div>
    );
}

export default Dashboard;