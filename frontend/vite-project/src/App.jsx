import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Monitor,
  Activity,
  Package,
  Clock,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

// Use environment variable or fallback to proxy
const API_BASE = import.meta.env.VITE_API_URL || "/api";

function App() {
  const [factoryMetrics, setFactoryMetrics] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState("overview");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [factoryRes, workersRes, stationsRes] = await Promise.all([
        axios.get(`${API_BASE}/metrics/factory`),
        axios.get(`${API_BASE}/metrics/workers`),
        axios.get(`${API_BASE}/metrics/workstations`),
      ]);
      setFactoryMetrics(factoryRes.data);
      setWorkers(workersRes.data);
      setStations(stationsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data from server");
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_BASE}/seed`);
      await fetchData();
    } catch (error) {
      console.error("Error seeding database:", error);
      setError("Failed to seed database");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomData = async () => {
    try {
      setGenerating(true);
      setError(null);
      await axios.post(`${API_BASE}/events/generate-random`, null, {
        params: { days: 1 },
      });
      await fetchData();
    } catch (error) {
      console.error("Error generating data:", error);
      setError("Failed to generate data");
    } finally {
      setGenerating(false);
    }
  };

  const resetData = async () => {
    try {
      setResetting(true);
      setError(null);
      await axios.post(`${API_BASE}/events/reset`);
      await fetchData();
    } catch (error) {
      console.error("Error resetting data:", error);
      setError("Failed to reset data");
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !factoryMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "working":
        return "bg-green-100 text-green-800";
      case "idle":
        return "bg-yellow-100 text-yellow-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "product_count":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-blue-800 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={32} />
              <h1 className="text-3xl font-bold">Factory AI Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={seedDatabase}
                disabled={loading}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50"
              >
                Initialize DB
              </button>
              <button
                onClick={resetData}
                disabled={resetting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Reset Data"}
              </button>
              <button
                onClick={generateRandomData}
                disabled={generating}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw
                  size={18}
                  className={generating ? "animate-spin" : ""}
                />
                {generating ? "Generating..." : "Generate Data"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setSelectedView("overview")}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                selectedView === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView("workers")}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                selectedView === "workers"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Workers
            </button>
            <button
              onClick={() => setSelectedView("stations")}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                selectedView === "stations"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Workstations
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {selectedView === "overview" && factoryMetrics && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Total Workers
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {factoryMetrics.total_workers}
                    </p>
                  </div>
                  <Users className="text-blue-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Active Workers
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {factoryMetrics.active_workers}
                    </p>
                  </div>
                  <Activity className="text-green-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Total Workstations
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {factoryMetrics.total_stations}
                    </p>
                  </div>
                  <Monitor className="text-blue-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Avg Confidence
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {factoryMetrics.average_confidence.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="text-purple-600" size={32} />
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Event Distribution
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-600 text-sm font-semibold">
                    Working
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {factoryMetrics.working_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-600 text-sm font-semibold">Idle</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {factoryMetrics.idle_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-red-600 text-sm font-semibold">Absent</p>
                  <p className="text-2xl font-bold text-red-900">
                    {factoryMetrics.absent_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-600 text-sm font-semibold">
                    Product Count
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {factoryMetrics.product_count_total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workers Tab */}
        {selectedView === "workers" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Worker Performance
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Users className="text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-900">{worker.name}</p>
                        <p className="text-sm text-gray-600">{worker.id}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(worker.status)}`}
                    >
                      {worker.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-xs">Total Events</p>
                      <p className="text-lg font-bold">{worker.total_events}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Working</p>
                      <p className="text-lg font-bold text-green-600">
                        {worker.working_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Idle</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {worker.idle_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Absent</p>
                      <p className="text-lg font-bold text-red-600">
                        {worker.absent_count}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Avg Confidence:{" "}
                      <span className="font-bold text-gray-900">
                        {worker.average_confidence.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workstations Tab */}
        {selectedView === "stations" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Workstation Performance
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {stations.map((station) => (
                <div
                  key={station.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Monitor className="text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-900">
                          {station.name}
                        </p>
                        <p className="text-sm text-gray-600">{station.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-xs">Total Events</p>
                      <p className="text-lg font-bold">
                        {station.total_events}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Active Workers</p>
                      <p className="text-lg font-bold text-blue-600">
                        {station.workers_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Products</p>
                      <p className="text-lg font-bold text-green-600">
                        {station.product_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Avg Confidence</p>
                      <p className="text-lg font-bold text-purple-600">
                        {station.average_confidence.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
