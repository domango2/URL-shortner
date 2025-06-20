import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import NavBar from "../components/NavBar";
import { useAuth } from "../hooks/useAuth";
import type { AxiosError } from "axios";

const URL = import.meta.env.VITE_API_URL;

interface ClickStat {
  timestamp: string;
  ip: string;
  region: string;
  browser: string;
  browserVersion: string;
  os: string;
}

interface StatsResponse {
  shortCode: string;
  stats: ClickStat[];
}

interface ChartData {
  date: string;
  count: number;
}

const StatsPage: React.FC = () => {
  const { authHeaders, handleAuthError } = useAuth();
  const { shortCode } = useParams<{ shortCode: string }>();
  const [stats, setStats] = useState<ClickStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!shortCode) {
        setError("Код ссылки не указан");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<StatsResponse>(
          `${URL}/stats/${shortCode}`,
          {
            headers: authHeaders(),
          }
        );
        const data = response.data.stats;
        setStats(data);

        const countsMap: Record<string, number> = {};
        data.forEach((item) => {
          const dateOnly = item.timestamp.slice(0, 10);
          countsMap[dateOnly] = (countsMap[dateOnly] || 0) + 1;
        });
        const chartArr: ChartData[] = Object.entries(countsMap)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => (a.date < b.date ? -1 : 1));
        setChartData(chartArr);
      } catch (unknownErr) {
        const err = unknownErr as AxiosError<{ message: string }>;
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleAuthError();
          return;
        }
        setError(
          err.response?.data?.message || "Ошибка при получении статистики"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-700 text-sm sm:text-base">
            Загрузка статистики...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="flex items-center justify-center p-8">
          <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm sm:text-base">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-4xl mx-auto space-y-6 py-8 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Статистика для: <span className="text-blue-600">{shortCode}</span>
        </h1>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            График кликов по датам
          </h2>
          {chartData.length === 0 ? (
            <p className="text-gray-600 text-sm sm:text-base">
              Нет данных для отображения графика.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3182ce"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Список кликов
          </h2>
          {stats.length === 0 ? (
            <p className="text-gray-600 text-sm sm:text-base">
              Нет данных о кликах.
            </p>
          ) : (
            <table className="min-w-full table-auto border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-3 sm:px-4 py-2 border">Дата и время</th>
                  <th className="px-3 sm:px-4 py-2 border">IP</th>
                  <th className="px-3 sm:px-4 py-2 border">Регион</th>
                  <th className="px-3 sm:px-4 py-2 border">Браузер</th>
                  <th className="px-3 sm:px-4 py-2 border">Версия</th>
                  <th className="px-3 sm:px-4 py-2 border">ОС</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-3 sm:px-4 py-2 border text-gray-700">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-4 py-2 border text-gray-700">
                      {item.ip}
                    </td>
                    <td className="px-3 sm:px-4 py-2 border text-gray-700 break-all">
                      {item.region}
                    </td>
                    <td className="px-3 sm:px-4 py-2 border text-gray-700">
                      {item.browser}
                    </td>
                    <td className="px-3 sm:px-4 py-2 border text-gray-700">
                      {item.browserVersion}
                    </td>
                    <td className="px-3 sm:px-4 py-2 border text-gray-700">
                      {item.os}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
