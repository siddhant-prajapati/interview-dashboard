import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardOverview from './pages/DashboardOverview';
import ApplicationsPage from './pages/ApplicationsPage';
import InterviewsPage from './pages/InterviewsPage';
import CompaniesPage from './pages/CompaniesPage';
import PreparationPage from './pages/PreparationPage';
import QuestionsPage from './pages/QuestionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="preparation" element={<PreparationPage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
