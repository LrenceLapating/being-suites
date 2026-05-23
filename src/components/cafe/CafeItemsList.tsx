import React from 'react';
import InlineEditCell from '../inventory/InlineEditCell';
import { updateCafeItem } from '../../services/inventoryService';
import { useToast } from '../../hooks/useToast';

interface CafeItemsListProps {
  items: any[];
  onTransaction: (item: any) => void;
  onRefresh: () => void;
}

const CafeItemsList: React.FC<CafeItemsListProps> = ({ items, onTransaction, onRefresh }) => {
  const { success, error } = useToast();

  const handleEdit = async (itemId: string, field: string, newValue: any) => {
    try {
      await updateCafeItem(itemId, { [field]: newValue });
      success('Cafe item updated successfully');
      onRefresh();
    } catch (err) {
      console.error('Failed to update cafe item:', err);
      error('Failed to update cafe item');
    }
  };

  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    if (currentStock <= 0) return 'out-of-stock';
    if (currentStock <= reorderLevel) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusText = (currentStock: number, reorderLevel: number) => {
    if (currentStock <= 0) return 'Out of Stock';
    if (currentStock <= reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">☕</div>
        <h3>No Cafe Items Found</h3>
        <p>Start by adding cafe items to manage your cafe inventory.</p>
      </div>
    );
  }

  return (
    <div className="items-table-container">
      <table className="items-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Prev Balance</th>
            <th>Current Stock</th>
            <th>Reorder Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const stockStatus = getStockStatus(item.current_stock, item.reorder_level);
            
            return (
              <tr key={item.id} className={`item-row ${stockStatus}`}>
                <td className="item-name">
                  <InlineEditCell
                    value={item.item_name}
                    onSave={(newValue) => handleEdit(item.id, 'item_name', newValue)}
                    type="text"
                  />
                </td>
                <td>
                  <InlineEditCell
                    value={item.category || ''}
                    onSave={(newValue) => handleEdit(item.id, 'category', newValue)}
                    type="text"
                  />
                </td>
                <td>
                  <InlineEditCell
                    value={item.unit}
                    onSave={(newValue) => handleEdit(item.id, 'unit', newValue)}
                    type="text"
                  />
                </td>
                <td className="balance-cell">
                  {item.prev_balance?.toFixed(2) || '0.00'}
                </td>
                <td className={`stock-cell ${stockStatus}`}>
                  <strong>{item.current_stock?.toFixed(2) || '0.00'}</strong>
                </td>
                <td>
                  <InlineEditCell
                    value={item.reorder_level}
                    onSave={(newValue) => handleEdit(item.id, 'reorder_level', parseInt(newValue))}
                    type="number"
                  />
                </td>
                <td>
                  <span className={`status-badge ${stockStatus}`}>
                    {getStockStatusText(item.current_stock, item.reorder_level)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CafeItemsList;