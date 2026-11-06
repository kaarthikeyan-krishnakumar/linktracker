import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// "data" is the dailyClicks array from your API: [{ date: "2026-11-06", clicks: 3 }, ...]
function DailyClicksChart({ data }) {
    return (
        // ResponsiveContainer fills its parent, so the parent MUST have a height
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(d) => d.slice(5)}
                        tick={{ fontSize: 12 }}
                        minTickGap={20}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default DailyClicksChart;