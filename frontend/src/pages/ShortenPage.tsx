import { useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import { useAuth } from "../hooks/useAuth";

const ShortenPage: React.FC = () => {
  const { authHeaders, handleAuthError } = useAuth();
  const [form, setForm] = useState({ originalUrl: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    originalUrl: string;
    shortCode: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/links",
        { originalUrl: form.originalUrl },
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        }
      );

      const { data } = response;
      setResult({
        originalUrl: data.data.originalUrl,
        shortCode: data.data.shortCode,
      });
      setForm({ originalUrl: "" });
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleAuthError();
        return;
      }
      setError(
        err.response?.data?.message ||
          "Что-то пошло не так при сокращении ссылки."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Сократить ссылку
          </h2>
          {error && (
            <div className="p-3 text-red-700 bg-red-100 rounded-md text-sm sm:text-base">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="originalUrl"
                className="block mb-1 text-gray-600 text-sm sm:text-base"
              >
                Введите ссылку
              </label>
              <input
                type="url"
                name="originalUrl"
                id="originalUrl"
                value={form.originalUrl}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="https://example.com/very/long/url"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? "Сокращаем..." : "Сократить"}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 bg-green-50 rounded-md space-y-3 text-sm sm:text-base">
              <p className="text-gray-700">
                <strong>Оригинал:</strong>{" "}
                <a
                  href={result.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {result.originalUrl}
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Short URL:</strong>{" "}
                <a
                  href={`http://localhost:5000/links/${result.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  http://localhost:5000/links/{result.shortCode}
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Stats URL:</strong>{" "}
                <a
                  href={`http://localhost:5173/stats/${result.shortCode}`}
                  className="text-blue-600 hover:underline break-all"
                >
                  http://localhost:5173/stats/{result.shortCode}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortenPage;
