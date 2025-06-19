import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

interface UserLink {
  id: number;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { authHeaders, handleAuthError } = useAuth();

  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await axios.get<{ links: UserLink[] }>(
          "http://localhost:5000/links",
          { headers: authHeaders() }
        );
        setLinks(response.data.links);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleAuthError();
          return;
        }
        setError(
          err.response?.data?.message || "Ошибка при загрузке списка ссылок."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [authHeaders, handleAuthError]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const deleteButtonHandler = async (id: number) => {
    if (!confirm("Удалить эту ссылку?")) return;

    try {
      await axios.delete(`http://localhost:5000/links/${id}`, {
        headers: authHeaders(),
      });
      setLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (e) {
      console.error(e);
      alert("Ошибка при удалении");
    }
  };

  const filtered = links.filter(
    (l) =>
      l.originalUrl.toLowerCase().includes(search.trim().toLowerCase()) ||
      l.shortCode.toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
          <button
            onClick={() => navigate("/shorten")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
          >
            Создать новую ссылку
          </button>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Поиск по URL или коду"
            className="w-full sm:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Ваши сокращённые ссылки
        </h1>

        {loading && (
          <p className="text-gray-700 text-sm sm:text-base">
            Загрузка списка ссылок...
          </p>
        )}

        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm sm:text-base">
            {error}
          </div>
        )}

        {!loading && !error && links.length === 0 && (
          <p className="text-gray-700 text-sm sm:text-base">
            У вас ещё нет ни одной ссылки.
          </p>
        )}

        {!loading && !error && links.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow text-sm sm:text-base border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-3 sm:px-4 py-2 border">#</th>
                  <th className="px-3 sm:px-4 py-2 border">Оригинальный URL</th>
                  <th className="px-3 sm:px-4 py-2 border">Short URL</th>
                  <th className="px-3 sm:px-4 py-2 border">Дата</th>
                  <th className="px-3 sm:px-4 py-2 border">Действия</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((link, idx) => (
                  <tr
                    key={link.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-3 sm:px-4 py-2 border text-gray-700">
                      {(page - 1) * perPage + idx + 1}
                    </td>
                    <td className="px-3 sm:px-4 py-2 border text-blue-600 hover:underline break-all">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.originalUrl.length > 50
                          ? link.originalUrl.slice(0, 50) + "..."
                          : link.originalUrl}
                      </a>
                    </td>
                    <td className="px-3 sm:px-4 py-2 border">
                      <a
                        href={`http://localhost:5000/links/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {`http://localhost:5000/links/${link.shortCode}`}
                      </a>
                    </td>
                    <td className="px-3 sm:px-4 py-2 border text-gray-700">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border">
                      <div
                        className="px-3 sm:px-4  
                       align-top text-gray-700 space-y-1 sm:space-y-0 sm:flex sm:space-x-2"
                      >
                        <button
                          onClick={() => navigate(`/stats/${link.shortCode}`)}
                          className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Статистика
                        </button>

                        <button
                          onClick={() => deleteButtonHandler(link.id)}
                          className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs sm:text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-2 py-1 rounded ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } text-xs sm:text-sm`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
