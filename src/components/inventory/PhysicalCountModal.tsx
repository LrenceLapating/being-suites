import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { InventoryItem } from '../../services/inventoryService';

interface PhysicalCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onPhysicalCount: (counts: any[]) => void;
}

interface PhysicalCountItem {
  id: string;
  item_name: string;
  unit: string;
  system_count: number;
  actual_count: number;
  variance: number;
  variance_status: 'Balanced' | 'Over' | 'Short';
}

const PhysicalCountModal: React.FC<PhysicalCountModalProps> = ({
  isOpen,
  onClose,
  items,
  onPhysicalCount
}) => {
  const [countItems, setCountItems] = useState<PhysicalCountItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && items.length > 0) {
      const initialCounts = items.map(item => ({
        id: item.id,
        item_name: item.item_name,
        unit: item.unit,
        system_count: item.current_balance || 0,
        actual_count: item.current_balance || 0,
        variance: 0,
        variance_status: 'Balanced' as const
      }));
      setCountItems(initialCounts);
    }
  }, [isOpen, items]);

  const updateActualCount = (id: string, actualCount: number) => {
    setCountItems(prev => prev.map(item => {
      if (item.id === id) {
        const variance = actualCount - item.system_count;
        const variance_status = variance === 0 ? 'Balanced' : variance > 0 ? 'Over' : 'Short';
        return {
          ...item,
          actual_count: actualCount,
          variance,
          variance_status
        };
      }
      return item;
    }));
  };

  const filteredItems = countItems.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    const countsToSubmit = countItems.map(item => ({
      item_id: item.id,
      system_count: item.system_count,
      actual_count: item.actual_count,
      variance: item.variance,
      variance_status: item.variance_status,
      count_date: new Date().toISOString().split('T')[0]
    }));

    onPhysicalCount(countsToSubmit);
    onClose();
  };

  const totalVariances = countItems.reduce((acc, item) => {
    if (item.variance_status === 'Over') acc.over++;
    else if (item.variance_status === 'Short') acc.short++;
    else acc.balanced++;
    return acc;
  }, { balanced: 0, over: 0, short: 0 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Physical Count</h3>
            <p className="text-sm text-gray-500 mt-1">
              Enter actual counts to detect variances
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Balanced</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{totalVariances.balanced}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Over</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{totalVariances.over}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Short</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{totalVariances.short}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Items Table */}
        <div className="flex-1 overflow-y-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">System Count</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actual Count</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Variance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.item_name}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.unit}</td>
                  <td className="px-6 py-3 text-sm text-gray-900 font-semibold">{item.system_count}</td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      value={item.actual_count}
                      onChange={(e) => updateActualCount(item.id, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-sm font-semibold ${
                      item.variance === 0 ? 'text-gray-600' :
                      item.variance > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.variance > 0 ? '+' : ''}{item.variance}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.variance_status === 'Balanced' ? 'bg-green-100 text-green-800' :
                      item.variance_status === 'Over' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.variance_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Submit Physical Count
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PhysicalCountModal;