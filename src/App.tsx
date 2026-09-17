import { Navigate, Route, Routes } from 'react-router-dom';
import { landingFor, useApp } from './store/app';
import { AppShell } from './components/AppShell';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { LaborRequestForm } from './screens/LaborRequestForm';
import { RequestDetail } from './screens/RequestDetail';
import { Emails } from './screens/Emails';
import { MyProfile } from './screens/MyProfile';
import { Reports } from './screens/Reports';
import { ReportRecord } from './screens/ReportRecord';
import { OnboardingList } from './screens/OnboardingList';
import { Onboarding } from './screens/onboarding/Onboarding';

function Landing() {
  const account = useApp((s) => s.account);
  return <Navigate to={account ? landingFor(account) : '/login'} replace />;
}

export function App() {
  const account = useApp((s) => s.account);
  return (
    <Routes>
      <Route path="/login" element={account ? <Landing /> : <Login />} />
      <Route element={account ? <AppShell /> : <Navigate to="/login" replace />}>
        <Route index element={<Landing />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="requests/new" element={<LaborRequestForm mode="new" />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="requests/:id/edit" element={<LaborRequestForm mode="edit" />} />
        <Route path="drafts/:key" element={<LaborRequestForm mode="draft" />} />
        <Route path="emails" element={<Emails />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/record/:ref" element={<ReportRecord />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="onboardings" element={<OnboardingList />} />
        <Route path="onboarding" element={<Onboarding />} />
      </Route>
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
