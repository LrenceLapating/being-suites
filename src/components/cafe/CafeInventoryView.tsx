import React, { useState, useEffect } from 'react';
import { getCafeItemsWithData, getCafeCategories } from '../../services/inventoryService';
import { useToast } from '../../hooks/useToast';
import CafeItemsList from './CafeItemsList';
import CafeTransactionModal from './CafeTransactionModal';

interface CafeInventoryViewProps {
  onAddItem: () => void;
}

const CafeInventoryView: React.FC<CafeInventoryViewProps> = ({ onAddItem }) => {
  const [cafeItems, setCafeItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { error } = useToast();

  useEffect(() => {
    loadCafeData();
  }, []);

  const loadCafeData = async () => {
    try {
      setIsLoading(true);
      
      // Load cafe items and categories
      const [itemsResponse, categoriesResponse] = await Promise.all([
        getCafeItemsWithData({ category: 'All', days: 30 }),
        getCafeCategories()
      ]);

      setCafeItems(itemsResponse.items);
      setCategories(['All', ...categoriesResponse]);
    } catch (err) {
      console.error('Failed to load cafe data:', err);
      error('Failed to load cafe inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransaction = (item: any) => {
    setSelectedItem(item);
    setShowTransactionModal(true);
  };

  const handleTransactionComplete = () => {
    setShowTransactionModal(false);
    setSelectedItem(null);
    loadCafeData();
  };

  // Filter items based on search and category
  const filteredItems = cafeItems.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalItems = cafeItems.length;
  const lowStockItems = cafeItems.filter(item => item.current_stock <= item.reorder_level).length;
  const totalValue = cafeItems.reduce((sum, item) => sum + (item.current_stock || 0), 0);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading cafe inventory...</p>
      </div>
    );
  }

  return (
    <div className="cafe-inventory-view">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-left">
          <h2>☕ Cafe Inventory</h2>
          <p>Manage cafe-specific stock and operations</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onAddItem}>
            ➕ Add Cafe Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{totalItems}</h3>
            <p>Total Cafe Items</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{totalValue.toFixed(0)}</h3>
            <p>Total Stock Units</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="inventory-filters">
        <div className="filter-group">
          <label>Search Items:</label>
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items List */}
      <CafeItemsList
        items={filteredItems}
        onTransaction={handleTransaction}
        onRefresh={loadCafeData}
      />

      {/* Modals */}
      {showTransactionModal && selectedItem && (
        <CafeTransactionModal
          item={selectedItem}
          onClose={() => setShowTransactionModal(false)}
          onComplete={handleTransactionComplete}
        />
      )}
    </div>
  );
};

export default CafeInventoryView;