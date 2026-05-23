import React, { useState, useEffect } from 'react';
import { getAllItems, getAllCafeItems, transferTocafe } from '../../services/inventoryService';
import { useToast } from '../../hooks/useToast';

interface CafeStockTransferProps {
  onClose: () => void;
  onComplete: () => void;
}

const CafeStockTransfer: React.FC<CafeStockTransferProps> = ({ onClose, onComplete }) => {
  const [mainItems, setMainItems] = useState<any[]>([]);
  const [cafeItems, setCafeItems] = useState<any[]>([]);
  const [selectedMainItem, setSelectedMainItem] = useState('');
  const [selectedCafeItem, setSelectedCafeItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const [mainItemsData, cafeItemsData] = await Promise.all([
        getAllItems(),
        getAllCafeItems()
      ]);
      
      setMainItems(mainItemsData);
      setCafeItems(cafeItemsData);
    } catch (err) {
      console.error('Failed to load items:', err);
      error('Failed to load inventory items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMainItem || !selectedCafeItem || !quantity) {
      error('Please fill in all required fields');
      return;
    }

    const transferQuantity = parseFloat(quantity);
    if (transferQuantity <= 0) {
      error('Please enter a valid quantity');
      return;
    }

    const mainItem = mainItems.find(item => item.id === selectedMainItem);
    if (mainItem && mainItem.current_balance < transferQuantity) {
      error(`Insufficient stock in main inventory. Available: ${mainItem.current_balance} ${mainItem.unit}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await transferTocafe({
        sourceItemId: selectedMainItem,
        cafeItemId: selectedCafeItem,
        quantity: transferQuantity,
        remarks: remarks || 'Stock transfer to cafe'
      });
      
      success('Stock transferred successfully');
      onComplete();
    } catch (err) {
      console.error('Failed to transfer stock:', err);
      error('Failed to transfer stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedMainItem = () => {
    return mainItems.find(item => item.id === selectedMainItem);
  };

  const getSelectedCafeItem = () => {
    return cafeItems.find(item => item.id === selectedCafeItem);
  };

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔄 Transfer Stock to Cafe</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="transfer-info">
            <p>Transfer stock from main inventory to cafe inventory. This will create OUT transaction in main inventory and IN transaction in cafe inventory.</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From Main Inventory *</label>
              <select
                value={selectedMainItem}
                onChange={(e) => setSelectedMainItem(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select main inventory item</option>
                {mainItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.item_name} - {item.current_balance || 0} {item.unit}
                  </option>
                ))}
              </select>
              {selectedMainItem && (
                <div className="item-details">
                  <small>Available: {getSelectedMainItem()?.current_balance || 0} {getSelectedMainItem()?.unit}</small>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>To Cafe Inventory *</label>
              <select
                value={selectedCafeItem}
                onChange={(e) => setSelectedCafeItem(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select cafe item</option>
                {cafeItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.item_name} - {item.current_balance || 0} {item.unit}
                  </option>
                ))}
              </select>
              {selectedCafeItem && (
                <div className="item-details">
                  <small>Current: {getSelectedCafeItem()?.current_balance || 0} {getSelectedCafeItem()?.unit}</small>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              min="0.01"
              step="0.01"
              required
              placeholder="Enter quantity to transfer"
            />
            {selectedMainItem && quantity && parseFloat(quantity) > (getSelectedMainItem()?.current_balance || 0) && (
              <div className="warning-message">
                ⚠️ Warning: Quantity exceeds available stock in main inventory
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Optional remarks for this transfer"
            />
          </div>

          {selectedMainItem && selectedCafeItem && quantity && (
            <div className="transfer-preview">
              <h4>Transfer Preview:</h4>
              <div className="preview-row">
                <span>From:</span>
                <span>{getSelectedMainItem()?.item_name} ({getSelectedMainItem()?.current_balance} → {(getSelectedMainItem()?.current_balance || 0) - parseFloat(quantity)} {getSelectedMainItem()?.unit})</span>
              </div>
              <div className="preview-row">
                <span>To:</span>
                <span>{getSelectedCafeItem()?.item_name} ({getSelectedCafeItem()?.current_balance} → {(getSelectedCafeItem()?.current_balance || 0) + parseFloat(quantity)} {getSelectedCafeItem()?.unit})</span>
              </div>
              <div className="preview-row">
                <span>Quantity:</span>
                <span>{quantity} {getSelectedMainItem()?.unit}</span>
              </div>
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
              {isSubmitting ? 'Transferring...' : 'Transfer Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CafeStockTransfer;