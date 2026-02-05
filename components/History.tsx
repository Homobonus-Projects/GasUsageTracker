
import React, { useState } from 'react';
import { GasReading } from '../types';

interface HistoryProps {
  readings: GasReading[];
  onDelete: (id: string) => void;
  onEdit: (id: string, newTimestamp: number, newValue: number) => void;
}

const History: React.FC<HistoryProps> = ({ readings, onDelete, onEdit }) => {
  const sortedReadings = [...readings].sort((a, b) => b.timestamp - a.timestamp);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editValue, setEditValue] = useState('');

  const startEditing = (reading: GasReading) => {
    setEditingId(reading.id);
    const date = new Date(reading.timestamp);
    // Use local time components for inputs
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    setEditDate(`${year}-${month}-${day}`);
    setEditTime(`${hours}:${minutes}`);
    setEditValue(reading.value.toString());
  };

  const saveEditing = () => {
    if (editingId && editDate && editTime && editValue) {
      const newTimestamp = new Date(`${editDate}T${editTime}`).getTime();
      if (!isNaN(newTimestamp) && !isNaN(parseFloat(editValue))) {
        onEdit(editingId, newTimestamp, parseFloat(editValue));
        setEditingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900">Reading History</h2>
        <p className="text-slate-500">View and manage all your past recorded data</p>
      </header>

      {sortedReadings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-folder-open text-2xl"></i>
          </div>
          <p className="text-slate-400 font-medium">No readings found yet.</p>
          <p className="text-slate-300 text-sm mt-1">Recorded gas usage will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reading (m³)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Image</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-slate-50 transition-colors group">
                    {editingId === reading.id ? (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <input 
                              type="date" 
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-sm"
                            />
                            <input 
                              type="time" 
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            step="0.001"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 font-mono w-full max-w-[120px]"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {new Date(reading.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-mono font-bold text-blue-600">
                        {reading.value.toFixed(3)}
                      </span>
                    </td>
                      </>
                    )}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {reading.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity shadow-sm">
                          <img 
                            src={reading.imageUrl} 
                            alt="Meter" 
                            className="w-full h-full object-cover"
                            onClick={() => window.open(reading.imageUrl, '_blank')}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                          <i className="fas fa-image text-xs"></i>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === reading.id ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={saveEditing}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Save"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                            title="Cancel"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => startEditing(reading)}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all active:scale-95"
                            title="Edit reading"
                          >
                            <i className="fas fa-pen"></i>
                          </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(reading.id);
                        }}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-95"
                        title="Delete reading"
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
