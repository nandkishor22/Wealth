import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#3B82F6", "#6366F1"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b0620]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-white font-semibold">{`${payload[0].name}: ₹${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const Chart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="h-[300px] flex items-center justify-center text-gray-400 italic">
      No data available
    </div>
  );

  return (
    <div className="w-full h-[300px]" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Donut chart style for modern look
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer stroke-transparent outline-none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
