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
  Factory,
  Wrench,
  Cpu,
} from "lucide-react";
import "./App.css";

// Use environment variable or fallback to proxy
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "working":
        return "badge badge-working";
      case "idle":
        return "badge badge-idle";
      case "absent":
        return "badge badge-absent";
      case "product_count":
        return "badge bg-blue-100 text-blue-800";
      default:
        return "badge bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="header-gradient text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Factory size={36} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Factory AI Dashboard
                </h1>
                <p className="text-blue-200 text-sm">
                  Real-time manufacturing analytics
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={seedDatabase}
                disabled={loading}
                className="action-btn bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              >
                <Wrench size={18} />
                Initialize DB
              </button>
              <button
                onClick={resetData}
                disabled={resetting}
                className="action-btn action-btn-warning"
              >
                <RefreshCw
                  size={18}
                  className={resetting ? "animate-spin" : ""}
                />
                {resetting ? "Resetting..." : "Reset"}
              </button>
              <button
                onClick={generateRandomData}
                disabled={generating}
                className="action-btn action-btn-success"
              >
                <Activity
                  size={18}
                  className={generating ? "animate-pulse" : ""}
                />
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600 shrink-0" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="tab-nav">
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
