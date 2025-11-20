import React, { useEffect, useState } from "react";
import apiClient from "./components/apiClient";
import ReviewTable from "./components/ReviewTable";
import "./App.css"
function App() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      alert("Error loading reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-6xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-4xl">📝</span>
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            WhatsReview Dashboard
          </h1>
        </div>
        <p className="text-gray-500 mb-6">Real-time WhatsApp review stream</p>

        <button
          onClick={fetchReviews}
          className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-sm transition-all mb-6 font-medium"
        >
          🔄 Refresh
        </button>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <ReviewTable reviews={reviews} />
        )}
      </div>
    </div>
  );
}

export default App;
