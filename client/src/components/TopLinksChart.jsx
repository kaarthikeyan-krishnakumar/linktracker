import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// "data" is the topLinks array: [{ short_code: "xK_KZPv", click_count: 5, ... }, ...]
function TopLinksChart({ data }) {
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis
                        type="category"
                        dataKey="short_code"
                        width={80}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar
                        dataKey="click_count"
                        name="Clicks"
                        fill="#4f46e5"
                        radius={[0, 4, 4, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TopLinksChart;