import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  CartesianGrid,
  ComposedChart,
} from "recharts";
import { fetchReports } from "../../features/reportsSlice/reportsSlice";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";

const formatMonthYear = (str: string, format: "short" | "long") =>
  new Date(str).toLocaleDateString("ru-RU", {
    month: format,
    year: "numeric",
  });

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 backdrop-blur-sm bg-opacity-95">
        <p className="font-bold text-gray-900 mb-2 border-b pb-1 border-gray-200">
          {formatMonthYear(label!, "long")}
        </p>
        <div className="space-y-1 text-sm">
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex justify-between items-center"
            >
              <span
                className="text-gray-600 mr-4"
                style={{ color: entry.color }}
              >
                {entry.name}:
              </span>
              <span className="font-semibold text-gray-800">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Report: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { monthlyReports, monthlySavings, loadingReports } = useSelector(
    (state: RootState) => state.reports
  );

  useEffect(() => {
    dispatch(fetchReports());
  }, []);

  if (loadingReports) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700 text-lg font-medium">
          Загрузка финансов...
        </p>
      </div>
    );
  }

  const lastSavings =
    monthlySavings.length > 0
      ? monthlySavings[monthlySavings.length - 1]
      : null;

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            📊 Финансовые Отчёты
          </h1>
          <p className="mt-2 text-xl text-gray-600 font-light">
            Детальный анализ доходов, расходов и накоплений
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transition-shadow duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              💸 Доходы vs Расходы (Сравнение)
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={monthlyReports}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={(str) => formatMonthYear(str, "short")}
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(Number(value))}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f3f4f6" }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
                <Bar
                  dataKey="totalIncomeAmount"
                  name="Доходы (Сумма)"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="totalExpenseAmount"
                  name="Расходы (Сумма)"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="totalIncomeAmount"
                  name="Тренд Доходов"
                  stroke="#047857"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="totalExpenseAmount"
                  name="Тренд Расходов"
                  stroke="#b91c1c"
                  strokeWidth={3}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:w-1/3 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transition-shadow duration-300 hover:shadow-2xl h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              💰 Текущие Накопления
            </h2>
            {lastSavings ? (
              <div className="space-y-4 pt-2">
                <div className="text-sm text-gray-500">
                  Данные за {formatMonthYear(lastSavings.month, "long")}
                </div>
                <div className="flex justify-between items-center text-lg font-medium border-b pb-3">
                  <span className="text-gray-700">Общий Доход:</span>
                  <span className="text-green-600 font-bold">
                    {formatCurrency(lastSavings.income)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-medium border-b pb-3">
                  <span className="text-gray-700">Общий Расход:</span>
                  <span className="text-red-600 font-bold">
                    {formatCurrency(lastSavings.expense)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl pt-4">
                  <span className="text-gray-800 font-extrabold">
                    Накопления:
                  </span>
                  <span className="text-blue-600 font-extrabold">
                    {formatCurrency(lastSavings.savings)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-5 text-gray-500">
                Нет данных о накоплениях.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
