function StatCard({ label, value }) {
    return (
        <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
        </div>
    );
}

export default StatCard;