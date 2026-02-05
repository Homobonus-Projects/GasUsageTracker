
import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { View, GasReading } from './types';
import Dashboard from './components/Dashboard';
import History from './components/History';
import AddReading from './components/AddReading';
import ConfirmationModal from './components/ConfirmationModal';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [readings, setReadings] = useState<GasReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Try fetching from API (Server)
        const response = await fetch('api/readings');
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const serverData = await response.json();
            
            // Migration logic: If server is empty but local has data, use local (it will be synced back to server)
            if (Array.isArray(serverData) && serverData.length === 0) {
              const localSaved = localStorage.getItem('gas_readings');
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setReadings(parsed);
                  return; // Exit, we used local data
                }
              }
            }
            
            if (Array.isArray(serverData)) {
              setReadings(serverData);
            }
          } else {
            console.warn("API returned non-JSON response (likely HTML fallback)");
          }
        }
      } catch (e) {
        console.error("Failed to load from API, falling back to local:", e);
        // Fallback to localStorage
        const saved = localStorage.getItem('gas_readings');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) setReadings(parsed);
          } catch (err) { console.error(err); }
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data to API and localStorage whenever readings change
  useEffect(() => {
    if (!isLoading) {
      // Save to Server
      fetch('api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readings)
      }).catch(err => console.error("API Save failed:", err));

      // Keep LocalStorage as backup
      try {
        localStorage.setItem('gas_readings', JSON.stringify(readings));
      } catch (e: any) {
        console.error("LocalStorage error:", e);
      }
    }
  }, [readings, isLoading]);

  const handleAddReading = useCallback((value: number, imageUrl?: string) => {
    const newReading: GasReading = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) 
          ? crypto.randomUUID() 
          : `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      value,
      imageUrl
    };
    setReadings(prev => [...prev, newReading].sort((a, b) => a.timestamp - b.timestamp));
    setCurrentView(View.DASHBOARD);
    toast.success("Reading added successfully!");
  }, []);

  const handleDeleteReading = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      setReadings(prev => prev.filter(r => r.id !== deleteId));
      setDeleteId(null);
      toast.success("Reading deleted successfully");
    }
  }, [deleteId]);

  const handleEditReading = useCallback((id: string, newTimestamp: number, newValue: number) => {
    setReadings(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, timestamp: newTimestamp, value: newValue } : r);
      return updated.sort((a, b) => a.timestamp - b.timestamp);
    });
    toast.success("Reading updated successfully");
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0 lg:pl-64 relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      
      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Reading"
        message="Are you sure you want to delete this reading? This action cannot be undone."
      />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <i className="fas fa-fire"></i> GasTrack
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest mt-1 font-semibold">Heating Notepad</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavButton 
            active={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)}
            icon="fa-chart-line" 
            label="Dashboard" 
          />
          <NavButton 
            active={currentView === View.HISTORY} 
            onClick={() => setCurrentView(View.HISTORY)}
            icon="fa-history" 
            label="History" 
          />
          <NavButton 
            active={currentView === View.ADD} 
            onClick={() => setCurrentView(View.ADD)}
            icon="fa-plus-circle" 
            label="Add Reading" 
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        {currentView === View.DASHBOARD && (
          <Dashboard readings={readings} />
        )}
        {currentView === View.HISTORY && (
          <History readings={readings} onDelete={handleDeleteReading} onEdit={handleEditReading} />
        )}
        {currentView === View.ADD && (
          <AddReading onAdd={handleAddReading} onCancel={() => setCurrentView(View.DASHBOARD)} />
        )}
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-40">
        <MobileNavButton 
          active={currentView === View.DASHBOARD} 
          onClick={() => setCurrentView(View.DASHBOARD)} 
          icon="fa-chart-line" 
          label="Home" 
        />
        <MobileNavButton 
          active={currentView === View.ADD} 
          onClick={() => setCurrentView(View.ADD)} 
          icon="fa-camera" 
          label="Add" 
          featured
        />
        <MobileNavButton 
          active={currentView === View.HISTORY} 
          onClick={() => setCurrentView(View.HISTORY)} 
          icon="fa-history" 
          label="History" 
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
        : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <i className={`fas ${icon} w-5`}></i>
    {label}
  </button>
);

interface MobileNavButtonProps extends NavButtonProps {
  featured?: boolean;
}

const MobileNavButton: React.FC<MobileNavButtonProps> = ({ active, onClick, icon, label, featured }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 min-w-[64px] ${
      featured 
        ? 'relative -top-6' 
        : active ? 'text-blue-600 font-medium' : 'text-slate-500'
    }`}
  >
    {featured ? (
      <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 border-4 border-slate-50">
        <i className={`fas ${icon} text-xl`}></i>
      </div>
    ) : (
      <>
        <i className={`fas ${icon} text-lg`}></i>
        <span className="text-[10px]">{label}</span>
      </>
    )}
  </button>
);

export default App;
