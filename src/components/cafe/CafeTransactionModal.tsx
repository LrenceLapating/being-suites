import React, { useState } from 'react';
import { createCafeTransaction } from '../../services/inventoryService';
import { useToast } from '../../hooks/useToast';

interface CafeTransactionModalProps {
  item: any;
  onClose: () => void;
  onComplete: () => void;
}

const CafeTransactionModal: React.FC<CafeTransactionModalProps> = ({ item, onClose, onComplete }) => {
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState('');
  const [sourceDestination, setSourceDestination] = useState('');
  const [remarks, setRemarks] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'Over' | 'Short'>('Over');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || parseFloat(quantity) <= 0) {
      error('Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData: any = {
        cafe_item_id: item.id,
        transaction_type: transactionType,
        quantity: parseFloat(quantity),
        transaction_date: new Date().toISOString().split('T')[0],
        source_destination: sourceDestination || getDefaultSourceDestination(),
        remarks: remarks || getDefaultRemarks()
      };

      if (transactionType === 'ADJUSTMENT') {
        transactionData.adjustment_type = adjustmentType;
      }

      await createCafeTransaction(transactionData);
      
      success(`${transactionType} transaction created successfully`);
      onComplete();
    } catch (err) {
      console.error('Failed to create cafe transaction:', err);
      error('Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultSourceDestination = () => {
    switch (transactionType) {
      case 'IN':
        return 'Cafe Stock In';
      case 'OUT':
        return 'Cafe Usage';
      case 'ADJUSTMENT':
        return 'Physical Count Adjustment';
      default:
        return '';
    }
  };

  const getDefaultRemarks = () => {
    switch (transactionType) {
      case 'IN':
        return 'Stock received for cafe operations';
      case 'OUT':
        return 'Used in cafe operations';
      case 'ADJUSTMENT':
        return `Physical count ${adjustmentType.toLowerCase()} adjustment`;
      default:
        return '';
    }
  };

  const getTransactionIcon = () => {
    switch (transactionType) {
      case 'IN':
        return '📥';
      case 'OUT':
        return '📤';
      case 'ADJUSTMENT':
        return '⚖️';
      default:
        return '📝';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{getTransactionIcon()} Cafe Transaction - {item.item_name}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="item-info">
            <p><strong>Current Stock:</strong> {item.current_stock?.toFixed(2) || '0.00'} {item.unit}</p>
            <p><strong>Category:</strong> {item.category || 'N/A'}</p>
          </div>

          <div className="form-group">
            <label>Transaction Type *</label>
            <div className="transaction-type-buttons">
              <button
                type="button"
                className={`btn ${transactionType === 'IN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTransactionType('IN')}
              >
                📥 Stock IN
              </button>
              <button
                type="button"
                className={`btn ${transactionType === 'OUT' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTransactionType('OUT')}
              >
                📤 Stock OUT
              </button>
              <button
                type="button"
                className={`btn ${transactionType === 'ADJUSTMENT' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTransactionType('ADJUSTMENT')}
              >
                ⚖️ Adjustment
              </button>
            </div>
          </div>

          {transactionType === 'ADJUSTMENT' && (
            <div className="form-group">
              <label>Adjustment Type *</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as 'Over' | 'Short')}
                className="form-select"
                required
              >
                <option value="Over">Over (Add Stock)</option>
                <option value="Short">Short (Reduce Stock)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Quantity * ({item.unit})</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              min="0.01"
              step="0.01"
              required
              placeholder="Enter quantity"
            />
          </div>

          <div className="form-group">
            <label>Source/Destination</label>
            <input
              type="text"
              value={sourceDestination}
              onChange={(e) => setSourceDestination(e.target.value)}
              className="form-input"
              placeholder={getDefaultSourceDestination()}
            />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder={getDefaultRemarks()}
            />
          </div>

          {transactionType === 'OUT' && item.current_stock < parseFloat(quantity || '0') && (
            <div className="warning-message">
              ⚠️ Warning: This transaction will result in negative stock ({(item.current_stock - parseFloat(quantity || '0')).toFixed(2)} {item.unit})
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Create ${transactionType} Transaction`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CafeTransactionModal;