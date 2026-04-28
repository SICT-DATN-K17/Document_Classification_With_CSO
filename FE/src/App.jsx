import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SinglePredictPage from "./pages/SinglePredictPage";
import BatchPredictPage from "./pages/BatchPredictPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";
import FeedbackPage from "./pages/FeedbackPage";
import ModelInfoPage from "./pages/ModelInfoPage";
import LabelsPage from "./pages/LabelsPage";

function App() {
  const [currentPage, setCurrentPage] = useState("single");

  function renderPage() {
    if (currentPage === "batch") {
      return <BatchPredictPage />;
    }

    if (currentPage === "history") {
      return <HistoryPage />;
    }

    if (currentPage === "dashboard") {
      return <DashboardPage />;
    }

    if (currentPage === "feedback") {
      return <FeedbackPage />;
    }

    if (currentPage === "model-info") {
      return <ModelInfoPage />;
    }

    if (currentPage === "labels") {
      return <LabelsPage />;
    }

    return <SinglePredictPage />;
  }

  return (
    <div className="app">
      <Header />

      <div className="app-body">
        <Sidebar currentPage={currentPage} onChangePage={setCurrentPage} />

        <main className="main-content">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;