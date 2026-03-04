import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LayerRegistryPage from '@/features/admin/LayerRegistryPage';
import LayerHierarchyEditor from '@/features/admin/LayerHierarchyEditor';

type AdminTab = 'registry' | 'hierarchy';

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'registry',  label: 'Layer Registry',    icon: '🗂️' },
  { id: 'hierarchy', label: 'Hierarchy Editor',   icon: '⚙️' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('registry');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
      <Navbar />

      <div className="flex-1 overflow-y-auto">
        {/* ── page header ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Console</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage GIS layer configuration and hierarchy
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
            >
              ← Back to Map
            </button>
          </div>

          {/* ── tabs ── */}
          <div className="flex gap-1 mt-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-700 bg-purple-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── tab content ── */}
        <div className="p-6">
          {activeTab === 'registry'  && <LayerRegistryPage />}
          {activeTab === 'hierarchy' && <LayerHierarchyEditor />}
        </div>
      </div>
    </div>
  );
}
