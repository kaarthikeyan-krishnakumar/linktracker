import { useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../auth";

function Navbar() {
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-indigo-600">LinkTrack</h1>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">{user?.name}</span>
                    <button
                        onClick={handleLogout}
                        className="rounded bg-slate-800 text-white text-sm px-3 py-1.5 hover:bg-slate-900"
                    >
                        Log out
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;