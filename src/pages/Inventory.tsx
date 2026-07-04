import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import logoUrl from '../assets/Being logo.png';
import AdminLogin from '../components/admin/AdminLogin';
import CafeInventoryView from '../components/cafe/CafeInventoryView';
import CafeItemForm from '../components/cafe/CafeItemForm';
import TransactionHistory from '../components/TransactionHistory';
import { importCafeStocksData } from '../utils/cafeDataImporter';
import * as XLSX from 'xlsx';
import './Inventory.css';
import '../components/cafe/CafeInventory.css';
import '../components/TransactionHistory.css';

// Application state
const app = {
  currentUser: null as any,
  currentPage: 'login'
};

// Unit options for forms
const unitOptions = ['kg', 'pcs', 'L', 'pack', 'bottle', 'can'];

// Three-level category structure
const CATEGORY_STRUCTURE: Record<string, {
  icon: string;
  name: string;
  subcategories: Record<string, string>;
}> = {
  'Pantry': {
    icon: '📦',
    name: 'Pantry Items',
    subcategories: {
      'Baking': 'Baking & Dry Goods',
      'Canned': 'Canned Goods',
      'Condiments': 'Condiments & Sauces',
      'Spices': 'Spices & Seasonings',
      'Dairy': 'Dairy Products',
      'Pasta': 'Pasta & Noodles',
      'Coffee': 'Coffee & Beverages',
      'Beans': 'Beans & Legumes',
      'Specialty': 'Specialty Ingredients',
      'Others': 'Others'
    }
  },
  'Frozen': {
    icon: '❄️',
    name: 'Frozen Food',
    subcategories: {
      'Beef': 'Beef Products',
      'Pork': 'Pork Products',
      'Chicken': 'Chicken Products',
      'Seafood': 'Seafood',
      'Cheese': 'Cheese & Dairy',
      'Breads': 'Breads & Baked Goods',
      'Fries': 'Fries & Sides',
      'Others': 'Others'
    }
  },
  'Drinks': {
    icon: '🥤',
    name: 'Drinks',
    subcategories: {
      'Softdrinks': 'Soft Drinks',
      'Juices': 'Juices',
      'Alcohol': 'Alcoholic Beverages',
      'Water': 'Water'
    }
  }
};

// Navigation state for three-level browsing
const navigationState = {
  currentView: 'main-categories' as string,
  selectedMainCategory: null as string | null,
  selectedSubcategory: null as string | null
};

// Global variables to store data
let allItemsData: any[] = [];
let lowStockItems: any[] = [];
let lowStockPage = 1;
let lowStockPerPage = 10;
let itemsPage = 1;
let allCategories: string[] = [];

const Inventory: React.FC = () => {
  const { toasts, removeToast, success, error } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [importProgress, setImportProgress] = useState({ 
    current: 0, 
    total: 0, 
    isImporting: false, 
    currentItem: '' 
  });

  // Auto-update import modal when progress changes
  useEffect(() => {
    if (importProgress.isImporting && showModal) {
      const modalContent = (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <h3 style={{ color: '#374151', marginBottom: '15px' }}>Importing Excel Data...</h3>
          
          {/* Progress Bar */}
          <div style={{ 
            width: '100%', 
            height: '24px', 
            backgroundColor: '#E5E7EB', 
            borderRadius: '12px', 
            overflow: 'hidden',
            marginBottom: '20px',
            border: '2px solid #D1D5DB'
          }}>
            <div style={{
              width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%`,
              height: '100%',
              backgroundColor: '#10B981',
              transition: 'width 0.3s ease',
              borderRadius: '10px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                {importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%
              </div>
            </div>
          </div>
          
          {/* Current Progress Text */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ 
              color: '#374151', 
              fontSize: '18px', 
              fontWeight: 'bold',
              margin: '0 0 8px 0' 
            }}>
              Processing items: {importProgress.current} / {importProgress.total}
            </p>
            {importProgress.currentItem && (
              <p style={{ 
                color: '#6B7280', 
                fontSize: '14px', 
                margin: 0,
                fontStyle: 'italic'
              }}>
                Current: {importProgress.currentItem}
              </p>
            )}
          </div>
          
          {/* Status Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px',
            color: '#10B981'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #10B981',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {importProgress.current === importProgress.total && importProgress.total > 0 
                ? 'Finalizing...' 
                : 'Processing...'}
            </span>
          </div>
        </div>
      );

      setModalContent({
        title: 'Importing Data...',
        content: modalContent
      });
    }
  }, [importProgress, showModal]);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.app_metadata?.role === 'admin') {
      app.currentUser = {
        username: session.user.email,
        full_name: session.user.user_metadata?.full_name || session.user.email,
        role: 'Admin'
      };
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      loadDashboardStats();
    } else {
      setCurrentView('login');
    }
  };

  const handleLogin = async () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    loadDashboardStats();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    app.currentUser = null;
    setIsAuthenticated(false);
    setCurrentView('login');
    success('Logged out successfully');
  };

  // Load dashboard statistics
  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats(30);
      lowStockItems = data.lowStock?.lowStockItems || [];
      lowStockPage = 1;
      lowStockPerPage = 10;
      setDashboardStats(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setIsLoading(false);
    }
  };

  // Get dashboard stats from Supabase
  const getDashboardStats = async (days: number = 30) => {
    try {
      // Get total items
      const { count: totalItems } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      // Get all items to calculate current stock and low stock
      const { data: items } = await supabase
        .from('items')
        .select('id, item_name, category, unit, reorder_level')
        .eq('status', 'Active');

      if (!items || items.length === 0) {
        return {
          totalItems: totalItems || 0,
          lowStock: { count: 0, lowStockItems: [] },
          recentTransactions: 0,
          topItems: []
        };
      }

      const itemIds = items.map(item => item.id);

      // Get all transactions for these items
      const { data: transactions } = await supabase
        .from('transactions')
        .select('item_id, transaction_type, quantity, adjustment_type, transaction_date, source_destination, remarks, created_at')
        .in('item_id', itemIds)
        .order('created_at', { ascending: true });

      // Get month start markers
      const { data: monthStartMarkers } = await supabase
        .from('transactions')
        .select('id, item_id, transaction_date, quantity, source_destination, remarks, created_at')
        .in('item_id', itemIds)
        .ilike('source_destination', '%Opening Balance%')
        .ilike('remarks', '%Start New Month%')
        .order('created_at', { ascending: false });

      // Calculate current stock for each item and identify low stock items
      const lowStockItemsList = [];

      for (const item of items) {
        const itemTransactions = transactions?.filter(t => t.item_id === item.id) || [];
        const itemMonthStart = monthStartMarkers?.find(m => m.item_id === item.id);
        
        let totalIn = 0;
        let totalOut = 0;
        let prevBalance = 0;

        // Set previous balance from month start marker
        if (itemMonthStart) {
          prevBalance = parseFloat(itemMonthStart.quantity || '0') || 0;
        }

        // Calculate totals from transactions (excluding opening balance entries)
        const monthStartDate = itemMonthStart ? new Date(itemMonthStart.transaction_date) : null;
        const monthStartCreatedAt = itemMonthStart ? new Date(itemMonthStart.created_at) : null;

        itemTransactions.forEach(tx => {
          // Skip opening balance entries
          const isOpeningBalance = (tx.source_destination && tx.source_destination.toLowerCase().includes('opening balance'))
            || (tx.remarks && tx.remarks.toLowerCase().includes('previous balance'));
          if (isOpeningBalance) return;

          // Skip transactions before month start
          if (itemMonthStart) {
            const txDate = new Date(tx.transaction_date);
            if (txDate < monthStartDate!) return;
            if (txDate.getTime() === monthStartDate!.getTime()) {
              const txCreatedAt = new Date(tx.created_at);
              if (txCreatedAt <= monthStartCreatedAt!) return;
            }
          }

          if (tx.transaction_type === 'IN') {
            totalIn += parseFloat(tx.quantity);
          } else if (tx.transaction_type === 'OUT') {
            totalOut += parseFloat(tx.quantity);
          } else if (tx.transaction_type === 'ADJUSTMENT') {
            if (tx.adjustment_type === 'Over') {
              totalIn += parseFloat(tx.quantity);
            } else if (tx.adjustment_type === 'Short') {
              totalOut += parseFloat(tx.quantity);
            }
          }
        });

        const currentStock = prevBalance + totalIn - totalOut;

        // Check if item is low stock
        if (currentStock <= item.reorder_level) {
          lowStockItemsList.push({
            ...item,
            balances: [{ current_balance: currentStock }]
          });
        }
      }

      // Get recent transactions count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      return {
        totalItems: totalItems || 0,
        lowStock: {
          count: lowStockItemsList.length,
          lowStockItems: lowStockItemsList
        },
        recentTransactions: recentTransactions || 0,
        topItems: []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalItems: 0,
        lowStock: { count: 0, lowStockItems: [] },
        recentTransactions: 0,
        topItems: []
      };
    }
  };

  // Load all items data for instant search
  const loadAllItemsData = async () => {
    try {
      const response = await getItemsWithData({
        category: 'All',
        days: 30,
        page: 1,
        limit: 1000
      });

      if (response && response.items) {
        allItemsData = response.items;
      }
    } catch (error) {
      console.error('Failed to load items data:', error);
      allItemsData = [];
    }
  };

  // Get items with data from Supabase
  const getItemsWithData = async (params: any) => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select(`
          id,
          item_name,
          category,
          unit,
          reorder_level
        `)
        .eq('status', 'Active')
        .order('item_name');

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        return { items: [], total: 0 };
      }

      const itemIds = items.map(item => item.id);
      
      // Get all transactions for these items
      const { data: transactions } = await supabase
        .from('transactions')
        .select('item_id, transaction_type, quantity, adjustment_type, transaction_date, source_destination, remarks, created_at')
        .in('item_id', itemIds)
        .order('created_at', { ascending: true });

      // Get month start markers (opening balance transactions)
      const { data: monthStartMarkers } = await supabase
        .from('transactions')
        .select('id, item_id, transaction_date, quantity, source_destination, remarks, created_at')
        .in('item_id', itemIds)
        .ilike('source_destination', '%Opening Balance%')
        .ilike('remarks', '%Start New Month%')
        .order('created_at', { ascending: false });

      const transformedItems = items.map(item => {
        const itemTransactions = transactions?.filter(t => t.item_id === item.id) || [];
        const itemMonthStart = monthStartMarkers?.find(m => m.item_id === item.id);
        
        let totalIn = 0;
        let totalOut = 0;
        let prevBalance = 0;

        // Set previous balance from month start marker
        if (itemMonthStart) {
          prevBalance = parseFloat(itemMonthStart.quantity || '0') || 0;
        }

        // Calculate totals from transactions (excluding opening balance entries)
        const monthStartDate = itemMonthStart ? new Date(itemMonthStart.transaction_date) : null;
        const monthStartCreatedAt = itemMonthStart ? new Date(itemMonthStart.created_at) : null;

        itemTransactions.forEach(tx => {
          // Skip opening balance entries
          const isOpeningBalance = (tx.source_destination && tx.source_destination.toLowerCase().includes('opening balance'))
            || (tx.remarks && tx.remarks.toLowerCase().includes('previous balance'));
          if (isOpeningBalance) return;

          // Skip transactions before month start
          if (itemMonthStart) {
            const txDate = new Date(tx.transaction_date);
            if (txDate < monthStartDate!) return;
            if (txDate.getTime() === monthStartDate!.getTime()) {
              const txCreatedAt = new Date(tx.created_at);
              if (txCreatedAt <= monthStartCreatedAt!) return;
            }
          }

          if (tx.transaction_type === 'IN') {
            totalIn += parseFloat(tx.quantity);
          } else if (tx.transaction_type === 'OUT') {
            totalOut += parseFloat(tx.quantity);
          } else if (tx.transaction_type === 'ADJUSTMENT') {
            if (tx.adjustment_type === 'Over') {
              totalIn += parseFloat(tx.quantity);
            } else if (tx.adjustment_type === 'Short') {
              totalOut += parseFloat(tx.quantity);
            }
          }
        });

        // Calculate current stock: Previous Balance + Total IN - Total OUT
        const calculatedCurrentStock = prevBalance + totalIn - totalOut;
        
        return {
          id: item.id,
          item_name: item.item_name,
          category: item.category,
          unit: item.unit,
          prev_balance: prevBalance,
          total_in: totalIn,
          total_out: totalOut,
          current_stock: calculatedCurrentStock,
          reorder_level: item.reorder_level
        };
      });

      return {
        items: transformedItems,
        total: transformedItems.length
      };
    } catch (error) {
      console.error('Error fetching items with data:', error);
      return { items: [], total: 0 };
    }
  };

  // Get item categories from Supabase
  const getItemCategories = async () => {
    try {
      const { data } = await supabase
        .from('items')
        .select('category')
        .eq('status', 'Active');
      
      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      return { categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { categories: [] };
    }
  };

  // Save item edit to Supabase
  const saveItemEdit = async (itemId: string, field: string, newValue: any) => {
    try {
      const currentItem = allItemsData.find(item => item.id === itemId);
      if (!currentItem) return;

      // Total IN and Total OUT are calculated values - they cannot be edited directly
      // Instead, we need to create transactions to achieve the desired total
      if (field === 'total_in' || field === 'total_out') {
        const oldValue = field === 'total_in' ? currentItem.total_in : currentItem.total_out;
        const newTotal = parseFloat(newValue) || 0;
        const difference = newTotal - oldValue;
        
        if (difference !== 0) {
          // Create transaction record for the difference
          const transactionType = field === 'total_in' ? 'IN' : 'OUT';
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              item_id: itemId,
              item_name: currentItem.item_name,
              item_unit: currentItem.unit,
              transaction_type: transactionType,
              quantity: Math.abs(difference),
              transaction_date: new Date().toISOString().split('T')[0],
              source_destination: transactionType === 'IN' ? 'Direct Edit - Stock In' : 'Direct Edit - Stock Out',
              remarks: `Direct edit: ${field} changed from ${oldValue} to ${newTotal} (difference: ${difference > 0 ? '+' : ''}${difference})`
            });

          if (transactionError) {
            console.error('Transaction creation error:', transactionError);
            throw transactionError;
          }

          // Refresh data to show updated values
          await loadAllItemsData();
          success(`${transactionType} transaction created successfully`);
          return;
        } else {
          // No change needed
          return;
        }
      }

      // For other fields, update directly in database
      const { error } = await supabase
        .from('items')
        .update({ [field]: newValue })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      const updatedItems = allItemsData.map(item => 
        item.id === itemId ? { ...item, [field]: newValue } : item
      );
      allItemsData = updatedItems;

      success('Item updated successfully');
    } catch (err: any) {
      console.error('Failed to update item:', err);
      error('Failed to update item: ' + (err.message || 'Unknown error'));
      throw err;
    }
  };

  // Modal and form handlers
  const showAddItemForm = () => {
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
              {Object.keys(CATEGORY_STRUCTURE).map(key => {
                const cat = CATEGORY_STRUCTURE[key];
                return (
                  <optgroup key={key} label={`${cat.icon} ${cat.name}`}>
                    {Object.keys(cat.subcategories).map(subKey => (
                      <option key={`${key}-${subKey}`} value={`${key}-${subKey}`}>
                        {cat.subcategories[subKey]}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reorderLevel">Reorder Level *</label>
          <input type="number" id="reorderLevel" name="reorderLevel" className="form-input" min="0" step="1" required />
          <small className="form-help">Minimum stock level before reorder alert</small>
        </div>
        
        <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Add Item</button>
        </div>
      </form>
    );

    setModalContent({
      title: 'Add New Item',
      content: formContent
    });
    setShowModal(true);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      // Get form values directly from form elements
      const itemName = (form.elements.namedItem('itemName') as HTMLInputElement)?.value;
      const unit = (form.elements.namedItem('unit') as HTMLSelectElement)?.value;
      const category = (form.elements.namedItem('category') as HTMLSelectElement)?.value;
      const reorderLevel = parseInt((form.elements.namedItem('reorderLevel') as HTMLInputElement)?.value || '0');

      // Validate required fields
      if (!itemName || !unit || !category || !reorderLevel) {
        error('Please fill in all required fields');
        return;
      }

      const { error: insertError } = await supabase
        .from('items')
        .insert({
          item_name: itemName,
          unit: unit,
          category: category,
          reorder_level: reorderLevel,
          status: 'Active'
        });

      if (insertError) throw insertError;

      success('Item added successfully!');
      setShowModal(false);
      await loadAllItemsData();
      if (currentView === 'items') {
        setCurrentView('items'); // Trigger re-render
      }
    } catch (err: any) {
      console.error('Failed to add item:', err);
      error('Failed to add item: ' + (err.message || 'Unknown error'));
    }
  };

  const showImportExcelModal = () => {
    const modalContent = (
      <div>
        <div className="form-group">
          <label htmlFor="excelFile">Select Excel File *</label>
          <input 
            type="file" 
            id="excelFile" 
            className="form-input" 
            accept=".xlsx,.xls" 
            required 
          />
          <small className="form-help">
            Upload an Excel file in the BE-ING INVENTORY format:
            <br />• Must match the exact format of exported files
            <br />• Item names in column A, Units in column B, Ending Inventory in column C
            <br />• Total IN and OUT values in the summary columns
            <br />• Categories are detected from section headers
          </small>
        </div>
        
        <div className="form-group">
          <label>
            <input type="checkbox" id="updateExisting" style={{ marginRight: '8px' }} defaultChecked />
            Update existing items if found (based on Item Name)
          </label>
          <small className="form-help" style={{ display: 'block', marginTop: '5px' }}>
            When checked: Updates existing items with new stock values by creating appropriate transactions.
            <br />When unchecked: Only creates new items, skips existing ones.
          </small>
        </div>
        
        <div className="form-group">
          <h4 style={{ marginBottom: '10px', color: '#374151' }}>BE-ING Format Structure:</h4>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', padding: '10px', fontSize: '12px', backgroundColor: '#F9FAFB' }}>
            <p><strong>Expected Format:</strong></p>
            <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
              <li>Row 1: "BEING SUITES STOCK ROOM INVENTORY"</li>
              <li>Row 4: Headers (UNIT ITEMS NAME, Ending Inv., IN, OUT, TOTAL)</li>
              <li>Row 5+: Category sections with items</li>
              <li>Column A: Item Names (no row numbers)</li>
              <li>Column B: Units</li>
              <li>Column C: Ending Inventory (Current Stock)</li>
              <li>Summary columns: Total IN, Total OUT, NET, PREV, etc.</li>
            </ul>
            <p style={{ marginTop: '10px', color: '#6B7280' }}>
              <em>This matches the format of exported BE-ING INVENTORY files.</em>
            </p>
          </div>
        </div>
        
        <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={handleImportCancel}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleImportExcel}>Import</button>
        </div>
      </div>
    );

    setModalContent({
      title: 'Import BE-ING Excel File',
      content: modalContent
    });
    setShowModal(true);
  };

  const handleImportCancel = () => {
    // Reset import progress and close modal
    setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
    setShowModal(false);
  };

  const handleImportExcel = async () => {
    const fileInput = document.getElementById('excelFile') as HTMLInputElement;
    const updateExisting = (document.getElementById('updateExisting') as HTMLInputElement).checked;
    
    if (!fileInput.files || fileInput.files.length === 0) {
      error('Please select an Excel file');
      return;
    }

    const file = fileInput.files[0];
    
    try {
      // Start import process
      setImportProgress({ current: 0, total: 0, isImporting: true, currentItem: 'Reading Excel file...' });
      
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 5) {
        setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
        error('Excel file must be in BE-ING format with proper headers');
        return;
      }
      
      // Validate BE-ING format
      const titleRow = jsonData[0] as string[];
      if (!titleRow[0] || !titleRow[0].toString().toLowerCase().includes('being')) {
        setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
        error('This does not appear to be a BE-ING INVENTORY format file. Expected "BEING SUITES CAFE INVENTORY" in first row.');
        return;
      }
      
      // Find the header row (should contain "UNIT ITEMS NAME")
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        const row = jsonData[i] as any[];
        if (row && row[0] && row[0].toString().includes('UNIT ITEMS NAME')) {
          headerRowIndex = i;
          break;
        }
      }
      
      if (headerRowIndex === -1) {
        setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
        error('Could not find header row with "UNIT ITEMS NAME". Please ensure this is a valid BE-ING format file.');
        return;
      }
      
      // Parse items starting after header row
      const items = [];
      const errors = [];
      let currentCategory = 'OTHERS';
      
      setImportProgress({ current: 0, total: 0, isImporting: true, currentItem: 'Parsing Excel data...' });
      
      for (let i = headerRowIndex + 2; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        
        if (!row || row.length === 0) continue;
        
        // Check if this is a category header (single item in first column, no unit)
        if (row[0] && typeof row[0] === 'string' && (!row[1] || row[1] === '')) {
          const categoryName = row[0].toString().trim().toUpperCase();
          if (categoryName.length > 0 && !categoryName.includes('TOTAL')) {
            currentCategory = categoryName;
            continue;
          }
        }
        
        // Skip if no item name
        if (!row[0] || row[0].toString().trim() === '') continue;
        
        const itemName = row[0].toString().trim();
        const unit = row[1] ? row[1].toString().trim() : 'pcs';
        const endingInventory = parseFloat(row[2]?.toString()) || 0;
        
        // Try to find Total IN and Total OUT from summary columns
        // Based on the updated format: columns 35=IN, 36=OUT, 38=PREV
        const totalIn = parseFloat(row[35]?.toString()) || 0;
        const totalOut = parseFloat(row[36]?.toString()) || 0;
        const prevBalance = parseFloat(row[38]?.toString()) || 0;
        
        // Skip items with no meaningful data
        if (itemName.length === 0) continue;
        
        // Map category to our format
        let mappedCategory = 'Pantry-Others'; // Default
        const categoryUpper = currentCategory.toUpperCase();
        
        if (categoryUpper.includes('BREAKFAST') || categoryUpper.includes('MEAT')) {
          mappedCategory = 'Frozen-Others';
        } else if (categoryUpper.includes('CHICKEN')) {
          mappedCategory = 'Frozen-Chicken';
        } else if (categoryUpper.includes('DRINK') || categoryUpper.includes('BEVERAGE')) {
          mappedCategory = 'Drinks-Others';
        } else if (categoryUpper.includes('PANTRY') || categoryUpper.includes('INGREDIENT')) {
          mappedCategory = 'Pantry-Others';
        }
        
        // Validate unit
        let validUnit = unit;
        if (!unitOptions.includes(unit.toLowerCase())) {
          // Try to map common units
          const unitLower = unit.toLowerCase();
          if (unitLower.includes('set') || unitLower.includes('serve')) {
            validUnit = 'pcs';
          } else if (unitLower.includes('kg') || unitLower.includes('kilo')) {
            validUnit = 'kg';
          } else if (unitLower.includes('liter') || unitLower.includes('l')) {
            validUnit = 'L';
          } else {
            validUnit = 'pcs'; // Default fallback
          }
        }
        
        items.push({
          item_name: itemName,
          unit: validUnit,
          category: mappedCategory,
          reorder_level: 10, // Default reorder level
          prev_balance: prevBalance,
          total_in: totalIn,
          total_out: totalOut,
          current_stock: endingInventory,
          status: 'Active'
        });
      }
      
      if (items.length === 0) {
        setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
        error('No valid items found in the Excel file. Please check the format.');
        return;
      }
      
      // Set total items for progress tracking BEFORE starting import
      setImportProgress({ current: 0, total: items.length, isImporting: true, currentItem: 'Starting import...' });
      
      // Add small delay to show initial state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Prepare all operations first (validate everything before making any changes)
      const operations: Array<{
        item: any;
        itemId: any;
        isUpdate: boolean;
        transactions: any[];
      }> = [];
      let successCount = 0;
      let updateCount = 0;
      let transactionCount = 0;
      const importDate = new Date().toISOString().split('T')[0];
      
      // First pass: validate all items and prepare operations
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        
        // Update progress with current item being validated
        setImportProgress({ 
          current: index + 1, 
          total: items.length, 
          isImporting: true, 
          currentItem: `Validating: ${item.item_name}` 
        });
        
        // Add small delay to make progress visible
        await new Promise(resolve => setTimeout(resolve, 50));
        
        try {
          let itemId = null;
          let isUpdate = false;
          
          if (updateExisting) {
            // Check if item exists
            const { data: existingItems } = await supabase
              .from('items')
              .select('id')
              .eq('item_name', item.item_name)
              .eq('status', 'Active');
            
            if (existingItems && existingItems.length > 0) {
              itemId = existingItems[0].id;
              isUpdate = true;
            }
          }
          
          // Prepare the operation
          const operation = {
            item,
            itemId,
            isUpdate,
            transactions: [] as any[]
          };
          
          // Prepare transactions
          if (item.prev_balance > 0) {
            operation.transactions.push({
              item_id: itemId, // Will be set after item creation if needed
              item_name: item.item_name,
              item_unit: item.unit,
              transaction_type: 'IN',
              quantity: item.prev_balance,
              transaction_date: importDate,
              source_destination: 'Opening Balance',
              remarks: 'BE-ING Import - Previous Balance'
            });
          }
          
          if (item.total_in > 0) {
            operation.transactions.push({
              item_id: itemId, // Will be set after item creation if needed
              item_name: item.item_name,
              item_unit: item.unit,
              transaction_type: 'IN',
              quantity: item.total_in,
              transaction_date: importDate,
              source_destination: 'BE-ING Import',
              remarks: 'BE-ING Import - Total IN'
            });
          }
          
          if (item.total_out > 0) {
            operation.transactions.push({
              item_id: itemId, // Will be set after item creation if needed
              item_name: item.item_name,
              item_unit: item.unit,
              transaction_type: 'OUT',
              quantity: item.total_out,
              transaction_date: importDate,
              source_destination: 'BE-ING Import',
              remarks: 'BE-ING Import - Total OUT'
            });
          }
          
          operations.push(operation);
          
        } catch (validationError) {
          console.error(`Validation failed for item ${item.item_name}:`, validationError);
          // If validation fails, stop the entire import
          setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
          error(`Validation failed for item "${item.item_name}". Import cancelled.`);
          return;
        }
      }
      
      // Second pass: execute all operations (now that we know they're all valid)
      const createdItems: any[] = [];
      const createdTransactions: any[] = [];
      
      try {
        for (let index = 0; index < operations.length; index++) {
          const operation = operations[index];
          const { item, itemId, isUpdate, transactions } = operation;
          
          // Update progress with current item being processed
          setImportProgress({ 
            current: index + 1, 
            total: operations.length, 
            isImporting: true, 
            currentItem: `Processing: ${item.item_name}` 
          });
          
          // Add small delay to make progress visible
          await new Promise(resolve => setTimeout(resolve, 100));
          
          let finalItemId = itemId;
          
          if (isUpdate && itemId) {
            // Update existing item
            const { error: updateError } = await supabase
              .from('items')
              .update({
                unit: item.unit,
                category: item.category,
                reorder_level: item.reorder_level
              })
              .eq('id', itemId);
            
            if (updateError) {
              throw new Error(`Failed to update item ${item.item_name}: ${updateError.message}`);
            }
            
            updateCount++;
          } else {
            // Create new item
            const { data: newItem, error: insertError } = await supabase
              .from('items')
              .insert({
                item_name: item.item_name,
                unit: item.unit,
                category: item.category,
                reorder_level: item.reorder_level,
                status: 'Active'
              })
              .select('id')
              .single();
            
            if (insertError) {
              throw new Error(`Failed to create item ${item.item_name}: ${insertError.message}`);
            }
            
            finalItemId = newItem.id;
            createdItems.push(newItem.id);
            successCount++;
          }
          
          // Create transactions for this item
          if (transactions.length > 0) {
            const transactionsWithItemId = transactions.map(tx => ({
              ...tx,
              item_id: finalItemId
            }));
            
            const { data: newTransactions, error: transactionError } = await supabase
              .from('transactions')
              .insert(transactionsWithItemId)
              .select('id');
            
            if (transactionError) {
              throw new Error(`Failed to create transactions for ${item.item_name}: ${transactionError.message}`);
            }
            
            if (newTransactions) {
              createdTransactions.push(...newTransactions.map(t => t.id));
              transactionCount += newTransactions.length;
            }
          }
        }
        
        // If we get here, everything succeeded
        
      } catch (executionError: any) {
        console.error('Import execution failed:', executionError);
        
        // Rollback: Delete any items and transactions that were created
        try {
          if (createdTransactions.length > 0) {
            await supabase
              .from('transactions')
              .delete()
              .in('id', createdTransactions);
          }
          
          if (createdItems.length > 0) {
            await supabase
              .from('items')
              .delete()
              .in('id', createdItems);
          }
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        
        setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
        error(`Import failed: ${executionError.message}. All changes have been rolled back.`);
        return;
      }
      
      // Show completion state
      setImportProgress({ 
        current: operations.length, 
        total: operations.length, 
        isImporting: false, // Set to false to stop loading indicator
        currentItem: 'Import completed successfully!' 
      });
      
      // Wait a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      let message = `BE-ING Import completed! `;
      if (successCount > 0) message += `${successCount} items created`;
      if (updateCount > 0) message += `${successCount > 0 ? ', ' : ''}${updateCount} items updated`;
      if (transactionCount > 0) message += `, ${transactionCount} transactions created`;
      
      // Reset progress and close modal
      setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
      success(message);
      setShowModal(false);
      
      // Refresh data
      await loadAllItemsData();
      if (currentView === 'items') {
        setCurrentView('items'); // Trigger re-render
      }
      
    } catch (error: any) {
      setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
      console.error('Failed to import Excel:', error);
      error('Failed to import BE-ING Excel file: ' + (error.message || 'Unknown error'));
    }
  };

  // Transaction form functions
  const showTransactionForm = (type: 'IN' | 'OUT' | 'ADJUSTMENT') => {
    const titles = {
      'IN': 'Stock In',
      'OUT': 'Stock Out',
      'ADJUSTMENT': 'Stock Adjustment'
    };

    const modalContent = (
      <form onSubmit={(e) => handleTransactionSubmit(e, type)}>
        <div className="form-group">
          <label htmlFor="txMainCategory">Main Category *</label>
          <select id="txMainCategory" className="form-select" required onChange={handleTxMainCategoryChange}>
            <option value="">Select main category...</option>
            {Object.keys(CATEGORY_STRUCTURE).map(key => {
              const cat = CATEGORY_STRUCTURE[key];
              return <option key={key} value={key}>{cat.icon} {cat.name}</option>;
            })}
          </select>
        </div>
        
        <div className="form-group" id="txSubCategoryGroup" style={{ display: 'none' }}>
          <label htmlFor="txSubCategory">Subcategory *</label>
          <select id="txSubCategory" className="form-select" required onChange={handleTxSubCategoryChange}>
            <option value="">Select subcategory...</option>
          </select>
        </div>
        
        <div className="form-group" id="txItemGroup" style={{ display: 'none' }}>
          <label htmlFor="txItem">Select Item *</label>
          <select id="txItem" className="form-select" required>
            <option value="">Select item...</option>
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="txQuantity">Quantity *</label>
            <input type="number" id="txQuantity" className="form-input" min="0.01" step="0.01" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="txDate">Date *</label>
            <input 
              type="date" 
              id="txDate" 
              className="form-input" 
              required 
              defaultValue={new Date().toISOString().split('T')[0]} 
            />
          </div>
        </div>

        {type === 'ADJUSTMENT' && (
          <div className="form-group">
            <label htmlFor="adjustmentType">Adjustment Type *</label>
            <select id="adjustmentType" className="form-select" required>
              <option value="">Select adjustment type...</option>
              <option value="Over">Over (Add Stock)</option>
              <option value="Short">Short (Reduce Stock)</option>
            </select>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="txSource">
            {type === 'IN' ? 'Source' : type === 'OUT' ? 'Destination' : 'Reason'} *
          </label>
          <input 
            type="text" 
            id="txSource" 
            className="form-input" 
            required 
            defaultValue={type === 'IN' ? 'Ms Che' : type === 'OUT' ? 'Cafe' : ''}
            placeholder={type === 'IN' ? 'e.g., Supplier, Purchase' : type === 'OUT' ? 'e.g., Kitchen, Sale' : 'e.g., Damaged, Expired'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="txRemarks">Remarks</label>
          <textarea id="txRemarks" className="form-input" rows={2} placeholder="Optional notes..." />
        </div>
        
        <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Record Transaction</button>
        </div>
      </form>
    );

    setModalContent({
      title: titles[type],
      content: modalContent
    });
    setShowModal(true);
  };

  const handleTxMainCategoryChange = () => {
    const mainCategorySelect = document.getElementById('txMainCategory') as HTMLSelectElement;
    const subCategoryGroup = document.getElementById('txSubCategoryGroup') as HTMLElement;
    const subCategorySelect = document.getElementById('txSubCategory') as HTMLSelectElement;
    const itemGroup = document.getElementById('txItemGroup') as HTMLElement;
    const itemSelect = document.getElementById('txItem') as HTMLSelectElement;
    
    const mainCategory = mainCategorySelect.value;
    
    if (!mainCategory) {
      subCategoryGroup.style.display = 'none';
      itemGroup.style.display = 'none';
      return;
    }
    
    // Show subcategory dropdown
    subCategoryGroup.style.display = 'block';
    itemGroup.style.display = 'none';
    
    // Populate subcategories
    const cat = CATEGORY_STRUCTURE[mainCategory];
    subCategorySelect.innerHTML = '<option value="">Select subcategory...</option>';
    
    Object.keys(cat.subcategories).forEach(subKey => {
      const option = document.createElement('option');
      option.value = subKey;
      option.textContent = cat.subcategories[subKey];
      subCategorySelect.appendChild(option);
    });
    
    // Reset item selection
    itemSelect.innerHTML = '<option value="">Select item...</option>';
  };

  const handleTxSubCategoryChange = () => {
    const mainCategorySelect = document.getElementById('txMainCategory') as HTMLSelectElement;
    const subCategorySelect = document.getElementById('txSubCategory') as HTMLSelectElement;
    const itemGroup = document.getElementById('txItemGroup') as HTMLElement;
    const itemSelect = document.getElementById('txItem') as HTMLSelectElement;
    
    const mainCategory = mainCategorySelect.value;
    const subcategory = subCategorySelect.value;
    
    if (!subcategory) {
      itemGroup.style.display = 'none';
      return;
    }
    
    // Show item dropdown
    itemGroup.style.display = 'block';
    
    // Filter items by category
    const filteredItems = allItemsData.filter(item => {
      const itemCat = item.category || '';
      return itemCat.includes(mainCategory) && itemCat.includes(subcategory);
    });
    
    // Populate items
    itemSelect.innerHTML = '<option value="">Select item...</option>';
    
    filteredItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.item_name} (${item.unit})`;
      itemSelect.appendChild(option);
    });
    
    if (filteredItems.length === 0) {
      itemSelect.innerHTML = '<option value="">No items in this category</option>';
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent, type: 'IN' | 'OUT' | 'ADJUSTMENT') => {
    e.preventDefault();
    
    const itemId = (document.getElementById('txItem') as HTMLSelectElement).value;
    const quantity = parseFloat((document.getElementById('txQuantity') as HTMLInputElement).value);
    const date = (document.getElementById('txDate') as HTMLInputElement).value;
    const source = (document.getElementById('txSource') as HTMLInputElement).value;
    const remarks = (document.getElementById('txRemarks') as HTMLTextAreaElement).value;
    const adjustmentType = (document.getElementById('adjustmentType') as HTMLSelectElement)?.value;

    try {
      const transactionData = {
        item_id: itemId,
        item_name: allItemsData.find(item => item.id === itemId)?.item_name,
        item_unit: allItemsData.find(item => item.id === itemId)?.unit,
        transaction_type: type,
        quantity: quantity,
        transaction_date: date,
        source_destination: source,
        remarks: remarks
      };

      if (type === 'ADJUSTMENT' && adjustmentType) {
        (transactionData as any).adjustment_type = adjustmentType;
      }

      const { error } = await supabase
        .from('transactions')
        .insert(transactionData);

      if (error) throw error;

      success(`${type === 'IN' ? 'Stock in' : type === 'OUT' ? 'Stock out' : 'Adjustment'} recorded successfully!`);
      setShowModal(false);
      
      // Refresh data
      await loadAllItemsData();
      if (currentView === 'items') {
        setCurrentView('items'); // Trigger re-render
      }
    } catch (error: any) {
      console.error('Failed to record transaction:', error);
      error('Failed to record transaction: ' + (error.message || 'Unknown error'));
    }
  };

  // Inline editing functionality
  const handleInlineEdit = (e: React.MouseEvent, itemId: string, field: string, currentValue: any) => {
    const cell = e.target as HTMLElement;
    
    // Don't edit if already editing
    if (cell.querySelector('input') || cell.querySelector('select')) return;
    
    const originalContent = cell.innerHTML;
    
    let inputElement: HTMLElement;
    
    if (field === 'unit') {
      // Create select for unit
      const select = document.createElement('select');
      select.className = 'inline-edit-input';
      select.style.cssText = 'width: 100%; padding: 4px; border: 1px solid #3B82F6; border-radius: 4px;';
      select.innerHTML = `
        <option value="">Select Unit</option>
        ${unitOptions.map(unit => 
          `<option value="${unit}" ${currentValue === unit ? 'selected' : ''}>${unit}</option>`
        ).join('')}
      `;
      inputElement = select;
    } else if (field === 'category') {
      // Create select for category
      const select = document.createElement('select');
      select.className = 'inline-edit-input';
      select.style.cssText = 'width: 100%; padding: 4px; border: 1px solid #3B82F6; border-radius: 4px;';
      select.innerHTML = `
        <option value="">Select Category</option>
        ${Object.keys(CATEGORY_STRUCTURE).map(key => {
          const cat = CATEGORY_STRUCTURE[key];
          let options = `<option value="${key}" ${currentValue === key ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`;
          Object.keys(cat.subcategories).forEach(subKey => {
            const subName = cat.subcategories[subKey];
            const fullKey = `${key}-${subKey}`;
            options += `<option value="${fullKey}" ${currentValue === fullKey ? 'selected' : ''}>  ↳ ${subName}</option>`;
          });
          return options;
        }).join('')}
      `;
      inputElement = select;
    } else {
      // Create input for other fields
      const input = document.createElement('input');
      input.type = ['total_in', 'total_out', 'reorder_level'].includes(field) ? 'number' : 'text';
      input.className = 'inline-edit-input';
      input.style.cssText = 'width: 100%; padding: 4px; border: 1px solid #3B82F6; border-radius: 4px;';
      input.value = currentValue?.toString() || '';
      if (input.type === 'number') {
        input.min = '0';
        input.step = '1';
      }
      inputElement = input;
    }
    
    // Replace cell content with input
    cell.innerHTML = '';
    cell.appendChild(inputElement);
    cell.classList.add('editing');
    
    // Focus and select
    if (inputElement instanceof HTMLInputElement) {
      inputElement.focus();
      inputElement.select();
    } else if (inputElement instanceof HTMLSelectElement) {
      inputElement.focus();
    }
    
    // Handle save/cancel
    const saveEdit = async () => {
      const newValue = (inputElement as any).value;
      
      if (newValue !== currentValue?.toString()) {
        try {
          await saveItemEdit(itemId, field, newValue);
          // Update display
          if (field === 'category') {
            cell.innerHTML = `<span class="badge" style="background-color: #E0E7FF; color: #4338CA; font-size: 11px;">${newValue || 'N/A'}</span>`;
          } else {
            cell.textContent = newValue;
          }
        } catch (error) {
          // Restore original content on error
          cell.innerHTML = originalContent;
          console.error('Failed to save edit:', error);
        }
      } else {
        // Restore original content if no change
        cell.innerHTML = originalContent;
      }
      
      cell.classList.remove('editing');
    };
    
    const cancelEdit = () => {
      cell.innerHTML = originalContent;
      cell.classList.remove('editing');
    };
    
    // Save on Enter, cancel on Escape
    inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });
    
    // Save on blur
    inputElement.addEventListener('blur', saveEdit);
  };

  // Navigation functions for three-level browsing
  const navigateToMainCategories = () => {
    navigationState.currentView = 'main-categories';
    navigationState.selectedMainCategory = null;
    navigationState.selectedSubcategory = null;
    renderMainCategories();
  };

  const navigateToSubcategories = (mainCategory: string) => {
    navigationState.currentView = 'subcategories';
    navigationState.selectedMainCategory = mainCategory;
    navigationState.selectedSubcategory = null;
    renderSubcategories(mainCategory);
  };

  const navigateToProducts = (mainCategory: string, subcategory: string) => {
    navigationState.currentView = 'products';
    navigationState.selectedMainCategory = mainCategory;
    navigationState.selectedSubcategory = subcategory;
    renderProducts(mainCategory, subcategory);
  };

  const renderMainCategories = () => {
    // This would render the main category grid view
    // Implementation would go here
  };

  const renderSubcategories = (mainCategory: string) => {
    // This would render the subcategory grid view
    // Implementation would go here
  };

  const renderProducts = (mainCategory: string, subcategory: string) => {
    // This would render the filtered products view
    // Implementation would go here
  };

  // Missing functions that are referenced in the UI
  const confirmStartNewMonth = () => {
    const modalContent = (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#F59E0B', marginBottom: '10px' }}>⚠️ Warning</h4>
          <p>Starting a new month will perform the following actions:</p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li><strong>Calculate current stock</strong> for all items (Previous Balance + Total IN - Total OUT)</li>
            <li><strong>Create opening balance transactions</strong> for the new month using current stock values</li>
            <li><strong>Archive current month data</strong> in month-end snapshots for historical records</li>
            <li><strong>Reset the cycle</strong> - new transactions will start fresh for the new month</li>
            <li><strong>This action cannot be undone</strong> - please ensure all current month data is correct</li>
          </ul>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#FEF3C7', borderRadius: '4px', border: '1px solid #F59E0B' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400E' }}>
              <strong>Note:</strong> This will create opening balance transactions dated today. 
              Make sure to complete all current month transactions before proceeding.
            </p>
          </div>
        </div>
        
        <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button 
            type="button" 
            className="btn" 
            style={{ backgroundColor: '#F59E0B', color: 'white' }} 
            onClick={handleStartNewMonth}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Start New Month'}
          </button>
        </div>
      </div>
    );

    setModalContent({
      title: '🗓️ Start New Month',
      content: modalContent
    });
    setShowModal(true);
  };

  const handleStartNewMonth = async () => {
    try {
      // Show loading state
      setIsLoading(true);
      
      // Get current date for the new month
      const currentDate = new Date();
      const monthYear = currentDate.toISOString().slice(0, 7); // YYYY-MM format
      const newMonthDate = currentDate.toISOString().split('T')[0]; // Use today's date
      
      // Get all active items with their current calculated stock
      const response = await getItemsWithData({
        category: 'All',
        days: 30,
        page: 1,
        limit: 1000
      });

      if (!response || !response.items || response.items.length === 0) {
        error('No active items found to process');
        setIsLoading(false);
        return;
      }

      const items = response.items;
      
      // Create opening balance transactions for items with current stock > 0
      const openingBalanceTransactions = items
        .filter(item => item.current_stock > 0)
        .map(item => ({
          item_id: item.id,
          item_name: item.item_name,
          item_unit: item.unit,
          transaction_type: 'IN',
          quantity: item.current_stock,
          transaction_date: newMonthDate,
          source_destination: 'Opening Balance',
          remarks: `Start New Month - Previous: ${item.prev_balance}, IN: ${item.total_in}, OUT: ${item.total_out}, Stock: ${item.current_stock}`
        }));

      // Insert opening balance transactions
      if (openingBalanceTransactions.length > 0) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(openingBalanceTransactions);

        if (transactionError) throw transactionError;
      }

      // Create month-end snapshot with summary
      const monthEndSnapshot = {
        snapshot_date: new Date().toISOString().split('T')[0],
        month_year: monthYear,
        total_items: items.length,
        total_items_with_stock: openingBalanceTransactions.length,
        snapshot_summary: {
          process_date: new Date().toISOString(),
          items_processed: items.length,
          opening_transactions_created: openingBalanceTransactions.length,
          categories: [...new Set(items.map(item => item.category?.split('-')[0] || 'OTHERS'))],
          total_stock_value: items.reduce((sum, item) => sum + (item.current_stock || 0), 0)
        }
      };

      await supabase.from('month_end_snapshots').insert(monthEndSnapshot);

      setIsLoading(false);
      setShowModal(false);
      
      // Show simple success message with clear explanation
      success(`✅ New Month Started Successfully! Date: ${newMonthDate} | Items: ${items.length} | Opening Transactions: ${openingBalanceTransactions.length} | IMPORTANT: Previous stock is now in "Prev" column, Total IN/OUT are reset to 0 and ready for new transactions.`);
      
      // Refresh data to show the new month's starting balances
      await loadAllItemsData();
      await loadDashboardStats();
      
      if (currentView === 'items') {
        setCurrentView('items'); // Trigger re-render
      }
      
    } catch (error: any) {
      console.error('Failed to start new month:', error);
      setIsLoading(false);
      error('Failed to start new month: ' + (error.message || 'Unknown error'));
    }
  };

  const editItem = (item: any) => {
    const formContent = (
      <form onSubmit={(e) => handleEditItem(e, item)}>
        <div className="form-group">
          <label htmlFor="editItemName">Item Name *</label>
          <input 
            type="text" 
            id="editItemName" 
            name="editItemName"
            className="form-input" 
            required 
            defaultValue={item.item_name}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="editUnit">Unit *</label>
            <select id="editUnit" name="editUnit" className="form-select" required defaultValue={item.unit}>
              <option value="">Select Unit</option>
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="editCategory">Category *</label>
            <select id="editCategory" name="editCategory" className="form-select" required defaultValue={item.category}>
              <option value="">Select Category</option>
              {Object.keys(CATEGORY_STRUCTURE).map(key => {
                const cat = CATEGORY_STRUCTURE[key];
                return (
                  <optgroup key={key} label={`${cat.icon} ${cat.name}`}>
                    {Object.keys(cat.subcategories).map(subKey => (
                      <option key={`${key}-${subKey}`} value={`${key}-${subKey}`}>
                        {cat.subcategories[subKey]}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="editReorderLevel">Reorder Level *</label>
          <input 
            type="number" 
            id="editReorderLevel" 
            name="editReorderLevel"
            className="form-input" 
            min="0" 
            step="1" 
            required 
            defaultValue={item.reorder_level}
          />
          <small className="form-help">Minimum stock level before reorder alert</small>
        </div>
        
        <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Update Item</button>
        </div>
      </form>
    );

    setModalContent({
      title: 'Edit Item',
      content: formContent
    });
    setShowModal(true);
  };

  const handleEditItem = async (e: React.FormEvent, item: any) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      // Get form values directly from form elements
      const itemName = (form.elements.namedItem('editItemName') as HTMLInputElement)?.value;
      const unit = (form.elements.namedItem('editUnit') as HTMLSelectElement)?.value;
      const category = (form.elements.namedItem('editCategory') as HTMLSelectElement)?.value;
      const reorderLevel = parseInt((form.elements.namedItem('editReorderLevel') as HTMLInputElement)?.value || '0');

      // Validate required fields
      if (!itemName || !unit || !category || !reorderLevel) {
        error('Please fill in all required fields');
        return;
      }

      const { error: updateError } = await supabase
        .from('items')
        .update({
          item_name: itemName,
          unit: unit,
          category: category,
          reorder_level: reorderLevel
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      success('Item updated successfully!');
      setShowModal(false);
      await loadAllItemsData();
      if (currentView === 'items') {
        setCurrentView('items'); // Trigger re-render
      }
    } catch (err: any) {
      console.error('Failed to update item:', err);
      error('Failed to update item: ' + (err.message || 'Unknown error'));
    }
  };

  // Navigation handlers
  const showDashboard = () => {
    setCurrentView('dashboard');
    setIsLoading(true);
    loadDashboardStats();
  };

  const showItems = async () => {
    setCurrentView('items');
    setIsLoading(true);
    navigationState.currentView = 'main-categories';
    navigationState.selectedMainCategory = null;
    navigationState.selectedSubcategory = null;

    try {
      if (!allItemsData || allItemsData.length === 0) {
        await loadAllItemsData();
      }
      
      const cats = await getItemCategories();
      allCategories = cats.categories || [];
      setIsLoading(false);
    } catch (e) {
      allCategories = [];
      setIsLoading(false);
    }
  };

  const [showCafeItemForm, setShowCafeItemForm] = useState(false);

  const showCafeStock = () => {
    setCurrentView('cafe');
  };

  const handleAddCafeItem = () => {
    setShowCafeItemForm(true);
  };

  const handleCafeItemComplete = () => {
    setShowCafeItemForm(false);
  };

  const handleCafeImportData = () => {
    const modalContent = (
      <div>
        <div className="import-options">
          <h4>Import Cafe Data Options:</h4>
          
          <div className="option-card" style={{ marginBottom: '20px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#374151' }}>📋 Import Predefined Cafe Menu</h5>
            <p style={{ margin: '0 0 12px 0', color: '#6B7280', fontSize: '14px' }}>
              Import the complete Being Suites cafe menu with all categories and items from the workflow.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={handleImportCafeMenu}
              style={{ width: '100%' }}
            >
              Import Cafe Menu (150+ Items)
            </button>
          </div>

          <div className="option-card" style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#374151' }}>📊 Import Excel File</h5>
            <p style={{ margin: '0 0 12px 0', color: '#6B7280', fontSize: '14px' }}>
              Import cafe items from a custom Excel file in BE-ING format.
            </p>
            <button 
              className="btn btn-secondary" 
              onClick={() => { setShowModal(false); showImportExcelModal(); }}
              style={{ width: '100%' }}
            >
              Import from Excel
            </button>
          </div>
        </div>
      </div>
    );

    setModalContent({
      title: 'Import Cafe Data',
      content: modalContent
    });
    setShowModal(true);
  };

  const handleImportCafeMenu = async () => {
    try {
      setImportProgress({ current: 0, total: 0, isImporting: true, currentItem: 'Starting import...' });
      
      const result = await importCafeStocksData((current, total, item) => {
        setImportProgress({ current, total, isImporting: true, currentItem: item });
      });

      setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
      setShowModal(false);
      
      success(`Successfully imported ${result.importedItems} cafe items across ${result.categories.length} categories!`);
      
      // Refresh the view if we're on cafe page
      if (currentView === 'cafe') {
        setCurrentView('cafe'); // Trigger re-render
      }
    } catch (err) {
      console.error('Failed to import cafe menu:', err);
      setImportProgress({ current: 0, total: 0, isImporting: false, currentItem: '' });
      error('Failed to import cafe menu');
    }
  };

  const showHistory = () => {
    setCurrentView('history');
  };

  // Render login page
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Render dashboard
  const renderDashboard = () => {
    if (isLoading) {
      return (
        <div className="content-area">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (!dashboardStats) {
      return (
        <div className="content-area">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#EF4444' }}>Failed to load dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="content-area">
        <div style={{ marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: '500' }}>Time Period:</label>
          <select 
            className="form-select" 
            style={{ width: '150px' }} 
            onChange={(e) => {
              const days = parseInt(e.target.value);
              setIsLoading(true);
              getDashboardStats(days).then(data => {
                setDashboardStats(data);
                setIsLoading(false);
              });
            }}
            defaultValue="30"
          >
            <option value="15">Last 15 Days</option>
            <option value="30">1 Month</option>
          </select>
        </div>
        
        <div className="stats-grid">
          <div 
            className="stat-card" 
            onClick={() => showItems()} 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          >
            <div className="stat-icon" style={{ backgroundColor: '#DBEAFE' }}>📦</div>
            <div className="stat-content">
              <div className="stat-label">Total Items</div>
              <div className="stat-value">{dashboardStats.totalItems || 0}</div>
            </div>
          </div>
          
          <div 
            className="stat-card" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          >
            <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>⚠️</div>
            <div className="stat-content">
              <div className="stat-label">Low Stock Items</div>
              <div className="stat-value">{dashboardStats.lowStock?.count || 0}</div>
            </div>
          </div>

          <div 
            className="stat-card" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          >
            <div className="stat-icon" style={{ backgroundColor: '#D1FAE5' }}>📋</div>
            <div className="stat-content">
              <div className="stat-label">Recent Transactions</div>
              <div className="stat-value">{dashboardStats.recentTransactions || 0}</div>
            </div>
          </div>
        </div>

        {dashboardStats.lowStock?.lowStockItems?.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ color: '#374151', marginBottom: '16px' }}>Low Stock Alert</h3>
            <div className="card">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Reorder Level</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats.lowStock.lowStockItems.slice(0, 10).map((item: any) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '500' }}>{item.item_name}</td>
                        <td>
                          <span className="badge" style={{ backgroundColor: '#E0E7FF', color: '#4338CA', fontSize: '11px' }}>
                            {item.category || 'N/A'}
                          </span>
                        </td>
                        <td style={{ color: '#EF4444', fontWeight: '500' }}>
                          {item.balances?.[0]?.current_balance || 0}
                        </td>
                        <td>{item.reorder_level}</td>
                        <td>{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render items page
  const renderItems = () => {
    if (isLoading) {
      return (
        <div className="content-area">
          <div className="card">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner"></div>
              <p>Loading items...</p>
            </div>
          </div>
        </div>
      );
    }

    const items = allItemsData || [];
    
    // Apply search and category filters
    let filteredItems = items;
    
    if (selectedCategory) {
      if (selectedCategory.includes('-')) {
        // Subcategory filter
        const [mainCat, subCat] = selectedCategory.split('-');
        filteredItems = filteredItems.filter(item => {
          const itemCat = item.category || '';
          return itemCat.includes(mainCat) && itemCat.includes(subCat);
        });
      } else {
        // Main category filter
        filteredItems = filteredItems.filter(item => {
          const itemCat = item.category || '';
          return itemCat.includes(selectedCategory);
        });
      }
    }
    
    if (searchTerm) {
      filteredItems = filteredItems.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const itemsPerPage = 25;
    const currentPage = itemsPage || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return (
      <div className="content-area">
        <div className="card">
          <div className="sticky-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Inventory Items</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Admin', 'Staff'].includes(app.currentUser?.role) && (
                  <>
                    <button onClick={showAddItemForm} className="btn btn-primary">➕ Add New Item</button>
                  </>
                )}
                {app.currentUser?.role === 'Admin' && (
                  <>
                    <button onClick={showImportExcelModal} className="btn" style={{ backgroundColor: '#10B981', color: 'white' }}>📂 Import Excel File</button>
                    <button onClick={confirmStartNewMonth} className="btn" style={{ backgroundColor: '#F59E0B', color: 'white' }}>🗓️ Start New Month</button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="🔍 Search items across all categories..." 
                style={{ flex: 1 }} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                style={{ 
                  minWidth: '250px', 
                  padding: '12px 16px', 
                  fontSize: '14px', 
                  border: '2px solid #E5E7EB', 
                  borderRadius: '8px', 
                  background: 'white', 
                  color: '#374151', 
                  cursor: 'pointer' 
                }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {Object.keys(CATEGORY_STRUCTURE).map(key => {
                  const cat = CATEGORY_STRUCTURE[key];
                  return (
                    <optgroup key={key} label={`${cat.icon} ${cat.name}`}>
                      <option value={key}>{cat.icon} {cat.name}</option>
                      {Object.keys(cat.subcategories).map(subKey => {
                        const subName = cat.subcategories[subKey];
                        return (
                          <option key={`${key}-${subKey}`} value={`${key}-${subKey}`}>
                            ↳ {subName}
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>
          
          <div className="data-table-container">
            {filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                <h3 style={{ color: '#6B7280', margin: 0 }}>No items found</h3>
                <p style={{ color: '#9CA3AF', marginTop: '10px' }}>
                  {searchTerm || selectedCategory ? 'Try adjusting your search or filter' : 'Add items to see them here'}
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#374151', margin: '0 0 5px 0' }}>
                    {searchTerm ? 'Search Results' : selectedCategory ? getCategoryDisplayName(selectedCategory) : 'All Items'}
                  </h3>
                  <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
                    {searchTerm ? `Found ${filteredItems.length} items matching "${searchTerm}"` : `${filteredItems.length} items`}
                  </p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead className="sticky-table-header">
                      <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Unit</th>
                        <th>Prev</th>
                        <th>Total IN</th>
                        <th>Total OUT</th>
                        <th>Current Stock</th>
                        <th>Reorder Level</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map(item => (
                        <tr key={item.id}>
                          <td 
                            style={{ fontWeight: '500', cursor: 'pointer' }}
                            className="editable-cell"
                            onClick={(e) => handleInlineEdit(e, item.id, 'item_name', item.item_name)}
                          >
                            {item.item_name}
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: '#E0E7FF', color: '#4338CA', fontSize: '11px' }}>
                              {item.category || 'N/A'}
                            </span>
                          </td>
                          <td 
                            className="editable-cell"
                            onClick={(e) => handleInlineEdit(e, item.id, 'unit', item.unit)}
                            style={{ cursor: 'pointer' }}
                          >
                            {item.unit}
                          </td>
                          <td>{Math.round(item.prev_balance || 0)}</td>
                          <td 
                            style={{ color: '#10B981', fontWeight: '500', cursor: 'pointer' }}
                            className="editable-cell"
                            onClick={(e) => handleInlineEdit(e, item.id, 'total_in', item.total_in)}
                          >
                            {Math.round(item.total_in || 0)}
                          </td>
                          <td 
                            style={{ color: '#EF4444', fontWeight: '500', cursor: 'pointer' }}
                            className="editable-cell"
                            onClick={(e) => handleInlineEdit(e, item.id, 'total_out', item.total_out)}
                          >
                            {Math.round(item.total_out || 0)}
                          </td>
                          <td style={{ fontWeight: '600', fontSize: '16px' }}>
                            {Math.round(item.current_stock || 0)}
                          </td>
                          <td 
                            style={{ fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}
                            className="editable-cell"
                            onClick={(e) => handleInlineEdit(e, item.id, 'reorder_level', item.reorder_level)}
                          >
                            {item.reorder_level}
                          </td>
                          <td>
                            <button 
                              onClick={() => editItem(item)} 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredItems.length > itemsPerPage && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: '16px', 
                    padding: '16px', 
                    background: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #E5E7EB' 
                  }}>
                    <div style={{ color: '#6B7280', fontSize: '14px' }}>
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {currentPage > 1 && (
                        <button 
                          onClick={() => { itemsPage = currentPage - 1; setCurrentView('items'); }}
                          className="btn btn-secondary" 
                          style={{ padding: '8px 12px' }}
                        >
                          ← Previous
                        </button>
                      )}
                      <span style={{ padding: '8px 16px', color: '#6B7280' }}>
                        Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
                      </span>
                      {currentPage < Math.ceil(filteredItems.length / itemsPerPage) && (
                        <button 
                          onClick={() => { itemsPage = currentPage + 1; setCurrentView('items'); }}
                          className="btn btn-secondary" 
                          style={{ padding: '8px 12px' }}
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to get category display name
  const getCategoryDisplayName = (categoryValue: string) => {
    if (categoryValue.includes('-')) {
      const [mainKey, subKey] = categoryValue.split('-');
      const cat = CATEGORY_STRUCTURE[mainKey];
      return `${cat.icon} ${cat.subcategories[subKey]}`;
    } else {
      const cat = CATEGORY_STRUCTURE[categoryValue];
      return `${cat.icon} ${cat.name}`;
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logoUrl} alt="Being Suites Logo" className="sidebar-logo" />
            <h2>Being Suites</h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Inventory System</p>
          </div>
          
          <nav className="sidebar-nav">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); showDashboard(); }} 
              className={currentView === 'dashboard' ? 'active' : ''}
            >
              <span>📊 Dashboard</span>
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); showItems(); }} 
              className={currentView === 'items' ? 'active' : ''}
            >
              <span>📦 Stock Room</span>
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); showCafeStock(); }} 
              className={currentView === 'cafe' ? 'active' : ''}
            >
              <span>☕ Cafe Stock</span>
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); showHistory(); }} 
              className={currentView === 'history' ? 'active' : ''}
            >
              <span>📋 Transaction History</span>
            </a>
          </nav>
          
          <div className="sidebar-footer">
            <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                {app.currentUser?.full_name || app.currentUser?.username}
              </p>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', padding: '8px' }}>
                Logout
              </button>
            </div>
          </div>
        </aside>
        
        <main className="main-content">
          <header className="page-header">
            <h1 id="page-title">
              {currentView === 'dashboard' && 'Dashboard'}
              {currentView === 'items' && 'Stock Room'}
              {currentView === 'cafe' && 'Cafe Stock'}
              {currentView === 'history' && 'Transaction History'}
            </h1>
          </header>
          
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'items' && renderItems()}
          {currentView === 'cafe' && (
            <CafeInventoryView
              onAddItem={handleAddCafeItem}
            />
          )}
          {currentView === 'history' && <TransactionHistory />}
        </main>
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Modal */}
      {showModal && modalContent && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '0',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div className="modal-header" style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: '#1F2937' }}>{modalContent.title}</h3>
              <button 
                onClick={() => {
                  if (importProgress.isImporting) {
                    handleImportCancel();
                  } else {
                    setShowModal(false);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {modalContent.content}
            </div>
          </div>
        </div>
      )}

      {/* Cafe Item Form Modal */}
      {showCafeItemForm && (
        <CafeItemForm
          onClose={() => setShowCafeItemForm(false)}
          onComplete={handleCafeItemComplete}
        />
      )}
    </div>
  );
};

export default Inventory;
