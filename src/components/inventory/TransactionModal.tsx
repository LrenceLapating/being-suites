import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Edit3 } from 'lucide-react';
import { InventoryItem } from '../../services/inventoryService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onTransaction: (transaction: any) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  items,
  onTransaction
}) => {
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sourceDestination, setSourceDestination] = useState('');
  const [remarks, setRemarks] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'Over' | 'Short'>('Over');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction = {
      item_id: selectedItem,
      transaction_type: transactionType,
      quantity: parseFloat(quantity),
      transaction_date: new Date().toISOString().split('T')[0],
      source_destination: sourceDestination,
      remarks,
      adjustment_type: transactionType === 'ADJUSTMENT' ? adjustmentType : null
    };

    onTransaction(transaction);
    onClose();
    
    // Reset form
    setSelectedItem('');
    setQuantity('');
    setSourceDestination('');
    setRemarks('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Stock Transaction</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('IN')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  transactionType === 'IN'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Plus className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs font-medium">Stock In</span>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('OUT')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  transactionType === 'OUT'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Minus className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs font-medium">Stock Out</span>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('ADJUSTMENT')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  transactionType === 'ADJUSTMENT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Edit3 className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs font-medium">Adjust</span>
              </button>
            </div>
          </div>

          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Item
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose an item...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_name} (Current: {item.current_balance || 0} {item.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter quantity"
            />
          </div>

          {/* Adjustment Type (only for adjustments) */}
          {transactionType === 'ADJUSTMENT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('Over')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    adjustmentType === 'Over'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Over (Surplus)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('Short')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    adjustmentType === 'Short'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Short (Deficit)
                </button>
              </div>
            </div>
          )}

          {/* Source/Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {transactionType === 'IN' ? 'Supplier/Source' : 
               transactionType === 'OUT' ? 'Recipient/Department' : 'Reference'}
            </label>
            <input
              type="text"
              value={sourceDestination}
              onChange={(e) => setSourceDestination(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={
                transactionType === 'IN' ? 'e.g., ABC Supplier' :
                transactionType === 'OUT' ? 'e.g., Kitchen Department' :
                'e.g., Physical Count'
              }
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                transactionType === 'IN' ? 'bg-green-600 hover:bg-green-700' :
                transactionType === 'OUT' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Record Transaction
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TransactionModal;