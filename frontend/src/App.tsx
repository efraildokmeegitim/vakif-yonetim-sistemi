import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
const CurrentAccounts = React.lazy(() => import('./CurrentAccounts'));
const CurrentAccountDetail = React.lazy(() => import('./CurrentAccountDetail'));
const Sacrifices = React.lazy(() => import('./Sacrifices'));
const Plugins = React.lazy(() => import('./Plugins'));
const Communications = React.lazy(() => import('./Communications'));
const Personnel = React.lazy(() => import('./Personnel'));
const PersonnelDetail = React.lazy(() => import('./PersonnelDetail'));
const Scholarships = React.lazy(() => import('./Scholarships'));
const ScholarshipDetail = React.lazy(() => import('./ScholarshipDetail'));
const Assets = React.lazy(() => import('./Assets'));
const AssetDetail = React.lazy(() => import('./AssetDetail'));
const Lodgings = React.lazy(() => import('./Lodgings'));
const LodgingDetail = React.lazy(() => import('./LodgingDetail'));
const Accommodations = React.lazy(() => import('./Accommodations'));
const Warehouses = React.lazy(() => import('./Warehouses'));
const Stock = React.lazy(() => import('./Stock'));
const Tasks = React.lazy(() => import('./Tasks'));
const TaskDetail = React.lazy(() => import('./TaskDetail'));
const Projects = React.lazy(() => import('./Projects'));
const ProjectDetail = React.lazy(() => import('./ProjectDetail'));
const Publications = React.lazy(() => import('./Publications'));
const Catalog = React.lazy(() => import('./Catalog'));
const Subscriptions = React.lazy(() => import('./Subscriptions'));
const POS = React.lazy(() => import('./POS'));
const Wallets = React.lazy(() => import('./Wallets'));
const WalletDetail = React.lazy(() => import('./WalletDetail'));
const CostCenters = React.lazy(() => import('./CostCenters'));
const Households = React.lazy(() => import('./Households'));
const HouseholdDetail = React.lazy(() => import('./HouseholdDetail'));
const SoupKitchen = React.lazy(() => import('./SoupKitchen'));
const Vehicles = React.lazy(() => import('./Vehicles'));
const VehicleDetail = React.lazy(() => import('./VehicleDetail'));
const CalendarEvents = React.lazy(() => import('./CalendarEvents'));
const Sponsorships = React.lazy(() => import('./Sponsorships'));
const SponsorshipDetail = React.lazy(() => import('./SponsorshipDetail'));
const Users = React.lazy(() => import('./Users'));
const Settings = React.lazy(() => import('./Settings'));
const Reports = React.lazy(() => import('./Reports'));
const Roles = React.lazy(() => import('./Roles'));
import Dashboard, { DashboardHome } from './Dashboard';
import Todos from './Todos';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>}>{children}</Suspense> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/current-accounts" element={<PrivateRoute><Dashboard><CurrentAccounts /></Dashboard></PrivateRoute>} />
        <Route path="/current-accounts/:id" element={<PrivateRoute><Dashboard><CurrentAccountDetail /></Dashboard></PrivateRoute>} />
        <Route path="/sacrifices" element={<PrivateRoute><Dashboard><Sacrifices /></Dashboard></PrivateRoute>} />
        <Route path="/personnel" element={<PrivateRoute><Dashboard><Personnel /></Dashboard></PrivateRoute>} />
        <Route path="/personnel/:id" element={<PrivateRoute><Dashboard><PersonnelDetail /></Dashboard></PrivateRoute>} />
        <Route path="/scholarships" element={<PrivateRoute><Dashboard><Scholarships /></Dashboard></PrivateRoute>} />
        <Route path="/scholarships/:id" element={<PrivateRoute><Dashboard><ScholarshipDetail /></Dashboard></PrivateRoute>} />
        <Route path="/assets" element={<PrivateRoute><Dashboard><Assets /></Dashboard></PrivateRoute>} />
        <Route path="/assets/:id" element={<PrivateRoute><Dashboard><AssetDetail /></Dashboard></PrivateRoute>} />
        <Route path="/lodgings" element={<PrivateRoute><Dashboard><Lodgings /></Dashboard></PrivateRoute>} />
        <Route path="/lodgings/:id" element={<PrivateRoute><Dashboard><LodgingDetail /></Dashboard></PrivateRoute>} />
        <Route path="/accommodations" element={<PrivateRoute><Dashboard><Accommodations /></Dashboard></PrivateRoute>} />
        <Route path="/warehouses" element={<PrivateRoute><Dashboard><Warehouses /></Dashboard></PrivateRoute>} />
        <Route path="/stock" element={<PrivateRoute><Dashboard><Stock /></Dashboard></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Dashboard><Tasks /></Dashboard></PrivateRoute>} />
        <Route path="/tasks/:id" element={<PrivateRoute><Dashboard><TaskDetail /></Dashboard></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Dashboard><Projects /></Dashboard></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><Dashboard><ProjectDetail /></Dashboard></PrivateRoute>} />
        <Route path="/publications" element={<PrivateRoute><Dashboard><Publications /></Dashboard></PrivateRoute>} />
        <Route path="/publications/catalog" element={<PrivateRoute><Dashboard><Catalog /></Dashboard></PrivateRoute>} />
        <Route path="/publications/subscriptions" element={<PrivateRoute><Dashboard><Subscriptions /></Dashboard></PrivateRoute>} />
        <Route path="/publications/pos" element={<PrivateRoute><Dashboard><POS /></Dashboard></PrivateRoute>} />
        <Route path="/plugins" element={<PrivateRoute><Dashboard><Plugins /></Dashboard></PrivateRoute>} />
        <Route path="/communications" element={<PrivateRoute><Dashboard><Communications /></Dashboard></PrivateRoute>} />
        <Route path="/todos" element={<PrivateRoute><Dashboard><Todos /></Dashboard></PrivateRoute>} />
        <Route path="/wallets" element={<PrivateRoute><Dashboard><Wallets /></Dashboard></PrivateRoute>} />
        <Route path="/wallets/:id" element={<PrivateRoute><Dashboard><WalletDetail /></Dashboard></PrivateRoute>} />
        
        {/* Aile, Yetim ve Yardım Modülü */}
        <Route path="/households" element={<PrivateRoute><Dashboard><Households /></Dashboard></PrivateRoute>} />
        <Route path="/households/:id" element={<PrivateRoute><Dashboard><HouseholdDetail /></Dashboard></PrivateRoute>} />
        
        <Route path="/cost-centers" element={<PrivateRoute><Dashboard><CostCenters /></Dashboard></PrivateRoute>} />
        <Route path="/soup-kitchen" element={<PrivateRoute><Dashboard><SoupKitchen /></Dashboard></PrivateRoute>} />
        
        <Route path="/vehicles" element={<PrivateRoute><Dashboard><Vehicles /></Dashboard></PrivateRoute>} />
        <Route path="/vehicles/:id" element={<PrivateRoute><Dashboard><VehicleDetail /></Dashboard></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><Dashboard><CalendarEvents /></Dashboard></PrivateRoute>} />
        <Route path="/sponsorships" element={<PrivateRoute><Dashboard><Sponsorships /></Dashboard></PrivateRoute>} />
        <Route path="/sponsorships/:id" element={<PrivateRoute><Dashboard><SponsorshipDetail /></Dashboard></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Dashboard><Users /></Dashboard></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Dashboard><Settings /></Dashboard></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Dashboard><Reports /></Dashboard></PrivateRoute>} />
        <Route path="/roles" element={<PrivateRoute><Dashboard><Roles /></Dashboard></PrivateRoute>} />
        
        <Route path="/dashboard" element={<PrivateRoute><Dashboard><DashboardHome /></Dashboard></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
