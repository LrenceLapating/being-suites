import React, { useState, useEffect } from 'react';
import { createCafeItem, getAllItems } from '../../services/inventoryService';
import { useToast } from '../../hooks/useToast';

interface CafeItemFormProps {
  onClose: () => void;
  onComplete: () => void;
}

// Unit options matching main inventory
const unitOptions = ['kg', 'pcs', 'L', 'pack', 'bottle', 'can'];

// Cafe-specific categories based on the workflow
const CAFE_CATEGORIES = [
  'FREE BREAKFAST MENU',
  'BREAKFAST',
  'CHICKEN',
  'PORK',
  'BEEF',
  'SEAFOODS',
  'VEGETABLES & NOODLES',
  'PIZZA',
  'PASTA',
  'SALAD',
  'SNACKS',
  'SMOOTHIE',
  'BEERS',
  'SOFTDRINKS',
  'JUICES',
  'PORTION CHICKEN',
  'PORTION PORK',
  'PORTION SHRIMP/SQUID',
  'PORTION FISH',
  'OTHERS'
];

const CafeItemForm: React.FC<CafeItemFormProps> = ({ onClose, onComplete }) => {
  const [mainItems, setMainItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    loadMainItems();
  }, []);

  const loadMainItems = async () => {
    try {
      const items = await getAllItems();
      setMainItems(items);
    } catch (err) {
      console.error('Failed to load main items:', err);
      error('Failed to load main inventory items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      // Get form values directly from form elements
      const itemName = (form.elements.namedItem('itemName') as HTMLInputElement)?.value;
      const unit = (form.elements.namedItem('unit') as HTMLSelectElement)?.value;
      const category = (form.elements.namedItem('category') as HTMLSelectElement)?.value;
      const reorderLevel = parseInt((form.elements.namedItem('reorderLevel') as HTMLInputElement)?.value || '10');
      const sourceItemId = (form.elements.namedItem('sourceItemId') as HTMLSelectElement)?.value;

      // Validate required fields
      if (!itemName || !unit || !category) {
        error('Please fill in all required fields');
        return;
      }

      await createCafeItem({
        item_name: itemName,
        unit: unit,
        category: category,
        reorder_level: reorderLevel,
        source_item_id: sourceItemId || undefined,
        status: 'Active'
      });
      
      success('Cafe item added successfully!');
      onComplete();
    } catch (err: any) {
      console.error('Failed to add cafe item:', err);
      error('Failed to add cafe item: ' + (err.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleAddItem}>
      <div className="form-group">
        <label htmlFor="itemName">Item Name *</label>
        <input type="text" id="itemName" name="itemName" className="form-input" required />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="unit">Unit *</label>
          <select id="unit" name="unit" className="form-select" required>
            <option value="">Select Unit</option>
            {unitOptions.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select id="category" name="category" className="form-select" required>
            <option value="">Select Category</option>
            {CAFE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="reorderLevel">Reorder Level *</label>
        <input type="number" id="reorderLevel" name="reorderLevel" className="form-input" min="0" step="1" defaultValue="10" required />
        <small className="form-help">Minimum stock level before reorder alert</small>
      </div>

      <div className="form-group">
        <label htmlFor="sourceItemId">Link to Main Inventory Item (Optional)</label>
        <select id="sourceItemId" name="sourceItemId" className="form-select">
          <option value="">No link to main inventory</option>
          {mainItems.map(item => (
            <option key={item.id} value={item.id}>
              {item.item_name} ({item.unit})
            </option>
          ))}
        </select>
        <small className="form-help">Link this cafe item to a main inventory item for easy stock transfers</small>
      </div>
      
      <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">Add Item</button>
      </div>
    </form>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Cafe Item</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {formContent}
        </div>
      </div>
    </div>
  );
};

export default CafeItemForm;