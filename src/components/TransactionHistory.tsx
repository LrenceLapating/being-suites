import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  item_id?: string;
  item_name?: string;
  item_unit?: string;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  transaction_date: string;
  source_destination?: string;
  adjustment_type?: 'Over' | 'Short';
  remarks?: string;
  created_by?: string;
  created_at: string;
  source: 'stock-room' | 'cafe';
}

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const { success, error } = useToast();

  useEffect(() => {
    loadTransactionHistory();
  }, [sourceFilter, typeFilter, startDate, endDate]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm]);

  const loadTransactionHistory = async () => {
    try {
      setIsLoading(true);
      
      let stockRoomTransactions: any[] = [];
      let cafeTransactions: any[] = [];

      // Load stock room transactions
      if (sourceFilter === '' || sourceFilter === 'stock-room') {
        let query = supabase
          .from('transactions')
          .select(`
            id,
            item_id,
            item_name,
            item_unit,
            transaction_type,
            quantity,
            transaction_date,
            source_destination,
            adjustment_type,
            remarks,
            created_by,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (typeFilter) {
          query = query.eq('transaction_type', typeFilter);
        }
        if (startDate) {
          query = query.gte('transaction_date', startDate);
        }
        if (endDate) {
          query = query.lte('transaction_date', endDate);
        }

        const { data, error: stockError } = await query;
        if (stockError) throw stockError;
        
        stockRoomTransactions = (data || []).map(tx => ({
          ...tx,
          source: 'stock-room' as const
        }));
      }

      // Load cafe transactions
      if (sourceFilter === '' || sourceFilter === 'cafe') {
        let cafeQuery = supabase
          .from('cafe_transactions')
          .select(`
            id,
            cafe_item_id,
            transaction_type,
            quantity,
            transaction_date,
            source_destination,
            remarks,
            user_id,
            created_at,
            cafe_items(item_name, unit)
          `)
          .order('created_at', { ascending: false });

        if (typeFilter) {
          cafeQuery = cafeQuery.eq('transaction_type', typeFilter);
        }
        if (startDate) {
          cafeQuery = cafeQuery.gte('transaction_date', startDate);
        }
        if (endDate) {
          cafeQuery = cafeQuery.lte('transaction_date', endDate);
        }

        const { data: cafeData, error: cafeError } = await cafeQuery;
        if (cafeError) throw cafeError;
        
        cafeTransactions = (cafeData || []).map((tx: any) => {
          const cafeItem = Array.isArray(tx.cafe_items) ? tx.cafe_items[0] : tx.cafe_items;

          return {
            id: tx.id,
            item_id: tx.cafe_item_id,
            item_name: cafeItem?.item_name || 'Unknown Item',
            item_unit: cafeItem?.unit || 'pcs',
            transaction_type: tx.transaction_type,
            quantity: tx.quantity,
            transaction_date: tx.transaction_date,
            source_destination: tx.source_destination,
            remarks: tx.remarks,
            created_by: tx.user_id,
            created_at: tx.created_at,
            source: 'cafe' as const
          };
        });
      }

      // Combine and sort all transactions
      const allTransactions = [...stockRoomTransactions, ...cafeTransactions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
    } catch (err) {
      console.error('Failed to load transaction history:', err);
      error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(tx => 
      tx.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.source_destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredTransactions(filtered);
  };

  const deleteTransaction = async (transaction: Transaction) => {
    if (!window.confirm(`Are you sure you want to delete this ${transaction.source === 'cafe' ? 'cafe' : 'stock room'} transaction?`)) {
      return;
    }

    try {
      if (transaction.source === 'cafe') {
        const { error: deleteError } = await supabase
          .from('cafe_transactions')
          .delete()
          .eq('id', transaction.id);
        
        if (deleteError) throw deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transaction.id);
        
        if (deleteError) throw deleteError;
      }

      success('Transaction deleted successfully');
      loadTransactionHistory();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      error('Failed to delete transaction');
    }
  };

  const exportStockRoom = async () => {
    try {
      // Show date range modal first
      const modalContent = (
        <div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input 
              type="date" 
              id="startDate" 
              className="form-input" 
              defaultValue={new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              required 
              onChange={validateDateRange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input 
              type="date" 
              id="endDate" 
              className="form-input" 
              defaultValue={new Date().toISOString().split('T')[0]}
              required 
              onChange={validateDateRange}
            />
            <small className="form-help" style={{ color: '#DC2626' }}>
              <strong>Maximum 15 days allowed between start and end date</strong>
            </small>
          </div>
          
          <div className="form-group">
            <h4 style={{ marginBottom: '10px', color: '#374151' }}>Export Format:</h4>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', padding: '10px', fontSize: '12px', backgroundColor: '#F9FAFB' }}>
              <p><strong>BE-ING STOCK ROOM INVENTORY Format:</strong></p>
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li>Row 1: BEING SUITES STOCK ROOM INVENTORY</li>
                <li>Row 2: STOCK ROOM INVENTORY ENDING ACTUAL COUNT + ENCODE HERE</li>
                <li>Row 3: Date range (e.g., DEC. 01-15, 2025)</li>
                <li>Row 4: Column headers with IN/OUT sections</li>
                <li><strong>Row 5: Date columns match selected range (e.g., 5,6,7... if May 5-15)</strong></li>
                <li><strong>Daily IN/OUT data mapped to actual transaction dates</strong></li>
                <li>Summary columns: IN, OUT, NET, PREV, ADJUSTED, ACTUAL</li>
                <li>Category sections with items grouped</li>
                <li>Freeze panes for easy navigation</li>
              </ul>
            </div>
          </div>
          
          <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleStockRoomExport}>Export</button>
          </div>
        </div>
      );

      setModalContent({
        title: 'Export BE-ING Stock Room Inventory',
        content: modalContent
      });
      setShowModal(true);
    } catch (err) {
      console.error('Failed to show export modal:', err);
      error('Failed to show export modal');
    }
  };

  const validateDateRange = () => {
    const startDateInput = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;
    
    if (startDateInput?.value && endDateInput?.value) {
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 15) {
        endDateInput.setCustomValidity('Date range cannot exceed 15 days');
        endDateInput.style.borderColor = '#DC2626';
      } else {
        endDateInput.setCustomValidity('');
        endDateInput.style.borderColor = '#D1D5DB';
      }
    }
  };

  const validateCafeDateRange = () => {
    const startDateInput = document.getElementById('cafeStartDate') as HTMLInputElement;
    const endDateInput = document.getElementById('cafeEndDate') as HTMLInputElement;
    
    if (startDateInput?.value && endDateInput?.value) {
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 15) {
        endDateInput.setCustomValidity('Date range cannot exceed 15 days');
        endDateInput.style.borderColor = '#DC2626';
      } else {
        endDateInput.setCustomValidity('');
        endDateInput.style.borderColor = '#D1D5DB';
      }
    }
  };

  const handleStockRoomExport = async () => {
    const startDateInput = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;
    
    if (!startDateInput.value || !endDateInput.value) {
      error('Please select both start and end dates');
      return;
    }

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 15) {
      error('Date range cannot exceed 15 days. Please select a shorter range.');
      return;
    }

    if (startDate > endDate) {
      error('Start date must be before end date');
      return;
    }
    
    setShowModal(false);
    
    try {
      // Get all items data for the export
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
        error('No data to export');
        return;
      }

      const itemIds = items.map(item => item.id);
      
      // Get all transactions for these items within the date range
      const { data: transactions } = await supabase
        .from('transactions')
        .select('item_id, transaction_type, quantity, adjustment_type, transaction_date, source_destination, remarks, created_at')
        .in('item_id', itemIds)
        .gte('transaction_date', startDateInput.value)
        .lte('transaction_date', endDateInput.value)
        .order('created_at', { ascending: true });

      // Get month start markers (opening balance transactions)
      const { data: monthStartMarkers } = await supabase
        .from('transactions')
        .select('id, item_id, transaction_date, quantity, source_destination, remarks, created_at')
        .in('item_id', itemIds)
        .ilike('source_destination', '%Opening Balance%')
        .ilike('remarks', '%Start New Month%')
        .order('created_at', { ascending: false });

      // Calculate current stock for each item using the same logic as main export
      const allItemsData = items.map(item => {
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

        // Create daily breakdown for the selected date range
        const dailyData: Record<string, { in: number; out: number }> = {};
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          dailyData[dateStr] = { in: 0, out: 0 };
          currentDate.setDate(currentDate.getDate() + 1);
        }

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

          const txDateStr = tx.transaction_date;
          if (dailyData[txDateStr]) {
            if (tx.transaction_type === 'IN') {
              dailyData[txDateStr].in += parseFloat(tx.quantity);
              totalIn += parseFloat(tx.quantity);
            } else if (tx.transaction_type === 'OUT') {
              dailyData[txDateStr].out += parseFloat(tx.quantity);
              totalOut += parseFloat(tx.quantity);
            } else if (tx.transaction_type === 'ADJUSTMENT') {
              if (tx.adjustment_type === 'Over') {
                dailyData[txDateStr].in += parseFloat(tx.quantity);
                totalIn += parseFloat(tx.quantity);
              } else if (tx.adjustment_type === 'Short') {
                dailyData[txDateStr].out += parseFloat(tx.quantity);
                totalOut += parseFloat(tx.quantity);
              }
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
          reorder_level: item.reorder_level,
          dailyData: dailyData
        };
      });

      // Use the updated export logic with date range mapping
      exportStockRoomData(startDateInput.value, endDateInput.value, allItemsData);
      
    } catch (err) {
      console.error('Failed to export stock room:', err);
      error('Failed to export stock room data');
    }
  };

  // Exact same export function as in main Inventory component but with date range mapping
  const exportStockRoomData = (startDate: string, endDate: string, allItemsData: any[]) => {
    try {
      // Calculate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Format date range for display
      const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
      const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
      const year = end.getFullYear();
      const dateRange = `${startFormatted}-${endFormatted}, ${year}`;

      // Create array of dates in the range
      const dateArray: Date[] = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Build the data array matching the exact format specification
      const data: Array<Array<string | number>> = [];
      const categoryRows: number[] = []; // Track category row indices for styling
      
      // Row 1: Title
      data.push(['BEING SUITES STOCK ROOM INVENTORY']);
      
      // Row 2: Subtitle with ENCODE HERE
      const row2: Array<string | number> = ['STOCK ROOM INVENTORY ENDING ACTUAL COUNT'];
      for (let i = 1; i < 10; i++) row2.push(''); // Empty cells
      row2[9] = 'ENCODE HERE'; // Position ENCODE HERE in column J (index 9)
      data.push(row2);
      
      // Row 3: Date range
      data.push([dateRange]);
      
      // Row 4: Column group headers
      const row4: Array<string | number> = ['UNIT ITEMS NAME', '', 'Ending Inv.'];
      
      // Add IN section header (spanning actual date range + 1 total)
      for (let i = 0; i < dateArray.length; i++) {
        row4.push('IN');
      }
      row4.push('IN'); // IN total column
      
      // Add OUT section header (spanning actual date range + 1 total)
      for (let i = 0; i < dateArray.length; i++) {
        row4.push('OUT');
      }
      row4.push('OUT'); // OUT total column
      
      // Add TOTAL section header
      row4.push('TOTAL');
      data.push(row4);
      
      // Row 5: Sub-headers with actual dates
      const row5: Array<string | number> = ['', '', '30-Nov']; // Previous month ending
      
      // Add actual day numbers for IN section
      dateArray.forEach(date => {
        row5.push(date.getDate());
      });
      row5.push('IN'); // IN subtotal
      
      // Add actual day numbers for OUT section
      dateArray.forEach(date => {
        row5.push(date.getDate());
      });
      row5.push('OUT'); // OUT subtotal
      
      // Add TOTAL sub-headers
      row5.push('IN', 'OUT', 'NET', 'PREV', 'ADJUSTED', 'ACTUAL');
      data.push(row5);
      
      // Group items by category
      const groupedItems: Record<string, any[]> = {};
      allItemsData.forEach(item => {
        const category = item.category || 'OTHERS';
        const mainCategory = category.split('-')[0] || 'OTHERS';
        if (!groupedItems[mainCategory]) {
          groupedItems[mainCategory] = [];
        }
        groupedItems[mainCategory].push(item);
      });
      
      // Add items by category
      Object.keys(groupedItems).forEach(category => {
        // Add category header row (track for red styling and merging)
        const categoryRowIndex = data.length;
        categoryRows.push(categoryRowIndex);
        const categoryRow = [category.toUpperCase()];
        // Fill the rest of the row with empty strings for proper merging
        const totalColumns = 3 + (dateArray.length * 2) + 2 + 6; // 3 base + dates*2 + 2 totals + 6 summary
        for (let i = 1; i < totalColumns; i++) {
          categoryRow.push('');
        }
        data.push(categoryRow);
        
        // Add items in this category
        groupedItems[category].forEach((item: any) => {
          const row: Array<string | number> = [];
          row[0] = item.item_name; // Item name
          row[1] = item.unit; // Unit
          row[2] = Math.round(item.prev_balance || 0); // Previous month ending (30-Nov)
          
          let colIndex = 3;
          
          // Daily IN columns - map to actual transaction dates
          dateArray.forEach(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dailyIn = item.dailyData && item.dailyData[dateStr] ? item.dailyData[dateStr].in : 0;
            row[colIndex] = dailyIn > 0 ? Math.round(dailyIn) : '';
            colIndex++;
          });
          row[colIndex] = Math.round(item.total_in || 0); // IN subtotal
          colIndex++;
          
          // Daily OUT columns - map to actual transaction dates
          dateArray.forEach(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dailyOut = item.dailyData && item.dailyData[dateStr] ? item.dailyData[dateStr].out : 0;
            row[colIndex] = dailyOut > 0 ? Math.round(dailyOut) : '';
            colIndex++;
          });
          row[colIndex] = Math.round(item.total_out || 0); // OUT subtotal
          colIndex++;
          
          // TOTAL section
          row[colIndex] = Math.round(item.total_in || 0); // TOTAL IN
          row[colIndex + 1] = Math.round(item.total_out || 0); // TOTAL OUT
          row[colIndex + 2] = Math.round((item.total_in || 0) - (item.total_out || 0)); // NET
          row[colIndex + 3] = Math.round(item.prev_balance || 0); // PREV
          row[colIndex + 4] = Math.round(item.prev_balance + (item.total_in || 0) - (item.total_out || 0)); // ADJUSTED
          row[colIndex + 5] = Math.round(item.current_stock || 0); // ACTUAL
          
          data.push(row);
        });
      });
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Merge cells for title and subtitle rows to make text visible
      ws['!merges'] = [
        // Merge title row (row 1) across columns A-F
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        // Merge subtitle row (row 2) across columns A-H  
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        // Merge date range row (row 3) across columns A-D
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }
      ];
      
      // Add merges for category rows to make them fully visible
      categoryRows.forEach(rowIndex => {
        (ws['!merges'] ||= []).push({
          s: { r: rowIndex, c: 0 }, // Start at column A
          e: { r: rowIndex, c: 5 }  // End at column F
        });
      });
      
      // Set column widths - dynamic based on date range
      const colWidths = [
        { wch: 20 }, // Item name
        { wch: 4 },  // Unit
        { wch: 8 },  // Ending Inv
      ];
      
      // Add narrow widths for daily columns (actual date range for IN and OUT)
      for (let i = 0; i < dateArray.length * 2; i++) { // dateArray.length for IN + dateArray.length for OUT
        colWidths.push({ wch: 3 });
      }
      
      // Add widths for subtotal columns
      colWidths.push({ wch: 4 }); // IN subtotal
      colWidths.push({ wch: 4 }); // OUT subtotal
      
      // Add widths for TOTAL section
      colWidths.push({ wch: 4 }); // TOTAL IN
      colWidths.push({ wch: 4 }); // TOTAL OUT
      colWidths.push({ wch: 4 }); // NET
      colWidths.push({ wch: 4 }); // PREV
      colWidths.push({ wch: 6 }); // ADJUSTED
      colWidths.push({ wch: 6 }); // ACTUAL
      
      ws['!cols'] = colWidths;
      
      // Add freeze panes (freeze top 5 rows and first 3 columns)
      ws['!freeze'] = { xSplit: 3, ySplit: 5 };
      
      // Apply styling
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      
      // Style title row (row 1) - make it bold and larger
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cellAddress]) continue;
        
        ws[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: '000000' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium', color: { rgb: '000000' } },
            bottom: { style: 'medium', color: { rgb: '000000' } },
            left: { style: 'medium', color: { rgb: '000000' } },
            right: { style: 'medium', color: { rgb: '000000' } }
          }
        };
      }
      
      // Style subtitle row (row 2) - make it visible and bold
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: 's', v: '' };
        }
        
        ws[cellAddress].s = {
          font: { bold: true, sz: 12, color: { rgb: '000000' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: 'E6F3FF' } }, // Light blue background to make it visible
          border: {
            top: { style: 'medium', color: { rgb: '000000' } },
            bottom: { style: 'medium', color: { rgb: '000000' } },
            left: { style: 'medium', color: { rgb: '000000' } },
            right: { style: 'medium', color: { rgb: '000000' } }
          }
        };
      }
      
      // Style date range row (row 3)
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 2, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: 's', v: '' };
        }
        
        ws[cellAddress].s = {
          font: { bold: true, sz: 11, color: { rgb: '000000' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium', color: { rgb: '000000' } },
            bottom: { style: 'medium', color: { rgb: '000000' } },
            left: { style: 'medium', color: { rgb: '000000' } },
            right: { style: 'medium', color: { rgb: '000000' } }
          }
        };
      }
      
      // Style header rows (rows 4-5) - make borders more visible
      for (let R = 3; R <= 4; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) {
            ws[cellAddress] = { t: 's', v: '' };
          }
          
          ws[cellAddress].s = {
            font: { bold: true, sz: 10, color: { rgb: '000000' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: 'F0F0F0' } }, // Light gray background for headers
            border: {
              top: { style: 'medium', color: { rgb: '000000' } },
              bottom: { style: 'medium', color: { rgb: '000000' } },
              left: { style: 'medium', color: { rgb: '000000' } },
              right: { style: 'medium', color: { rgb: '000000' } }
            }
          };
        }
      }
      
      // Style category rows (red bold text with better visibility)
      categoryRows.forEach(rowIndex => {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: C });
          if (!ws[cellAddress]) {
            ws[cellAddress] = { t: 's', v: '' };
          }
          
          // Make sure category text is in the first cell
          if (C === 0 && ws[cellAddress].v) {
            ws[cellAddress].s = {
              font: { bold: true, color: { rgb: 'FF0000' }, sz: 12 }, // Larger red text
              alignment: { horizontal: 'left', vertical: 'center' }, // Left align for better visibility
              fill: { fgColor: { rgb: 'FFE6E6' } }, // Light red background
              border: {
                top: { style: 'medium', color: { rgb: '000000' } },
                bottom: { style: 'medium', color: { rgb: '000000' } },
                left: { style: 'medium', color: { rgb: '000000' } },
                right: { style: 'medium', color: { rgb: '000000' } }
              }
            };
          } else {
            // Empty cells in category row
            ws[cellAddress].s = {
              fill: { fgColor: { rgb: 'FFE6E6' } }, // Light red background
              border: {
                top: { style: 'medium', color: { rgb: '000000' } },
                bottom: { style: 'medium', color: { rgb: '000000' } },
                left: { style: 'medium', color: { rgb: '000000' } },
                right: { style: 'medium', color: { rgb: '000000' } }
              }
            };
          }
        }
      });
      
      // Style data rows with thicker, more visible borders
      for (let R = 5; R <= range.e.r; R++) {
        if (categoryRows.includes(R)) continue; // Skip category rows (already styled)
        
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) {
            ws[cellAddress] = { t: 's', v: '' };
          }
          
          ws[cellAddress].s = {
            font: { sz: 9, color: { rgb: '000000' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'medium', color: { rgb: '000000' } },
              bottom: { style: 'medium', color: { rgb: '000000' } },
              left: { style: 'medium', color: { rgb: '000000' } },
              right: { style: 'medium', color: { rgb: '000000' } }
            }
          };
        }
      }
      
      // Highlight TOTAL section columns with light background and thicker borders
      const totalStartCol = 3 + (dateArray.length * 2) + 2; // 3 base + dates*2 + 2 subtotals
      for (let R = 5; R <= range.e.r; R++) {
        if (categoryRows.includes(R)) continue;
        
        for (let C = totalStartCol; C <= totalStartCol + 5; C++) { // TOTAL section (6 columns)
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) {
            ws[cellAddress] = { t: 's', v: '' };
          }
          
          ws[cellAddress].s = {
            font: { sz: 9, color: { rgb: '000000' }, bold: true },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: 'E6F3FF' } }, // Light blue background
            border: {
              top: { style: 'thick', color: { rgb: '000000' } },
              bottom: { style: 'thick', color: { rgb: '000000' } },
              left: { style: 'thick', color: { rgb: '000000' } },
              right: { style: 'thick', color: { rgb: '000000' } }
            }
          };
        }
      }
      
      // Add worksheet to workbook
      const sheetName = `STOCK ROOM ${startFormatted}-${endFormatted}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Generate filename
      const filename = `BE-ING STOCK ROOM INVENTORY (${dateRange}).xlsx`;
      
      // Write file
      XLSX.writeFile(wb, filename);
      
      success(`Stock Room inventory exported successfully for ${dateRange}!`);
    } catch (error: any) {
      console.error('Failed to export:', error);
      error('Failed to export data: ' + (error.message || 'Unknown error'));
    }
  };

  const exportCafeStock = async () => {
    try {
      // Show date range modal first
      const modalContent = (
        <div>
          <div className="form-group">
            <label htmlFor="cafeStartDate">Start Date *</label>
            <input 
              type="date" 
              id="cafeStartDate" 
              className="form-input" 
              defaultValue={new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              required 
              onChange={validateCafeDateRange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cafeEndDate">End Date *</label>
            <input 
              type="date" 
              id="cafeEndDate" 
              className="form-input" 
              defaultValue={new Date().toISOString().split('T')[0]}
              required 
              onChange={validateCafeDateRange}
            />
            <small className="form-help" style={{ color: '#DC2626' }}>
              <strong>Maximum 15 days allowed between start and end date</strong>
            </small>
          </div>
          
          <div className="form-group">
            <h4 style={{ marginBottom: '10px', color: '#374151' }}>Export Format:</h4>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', padding: '10px', fontSize: '12px', backgroundColor: '#F9FAFB' }}>
              <p><strong>BE-ING CAFE INVENTORY Format:</strong></p>
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li>Row 1: BEING SUITES CAFE INVENTORY</li>
                <li>Row 2: CAFE INVENTORY ENDING ACTUAL COUNT + ENCODE HERE</li>
                <li>Row 3: Date range (e.g., DEC. 01-15, 2025)</li>
                <li>Row 4: Column headers with IN/OUT sections</li>
                <li><strong>Row 5: Date columns match selected range (e.g., 5,6,7... if May 5-15)</strong></li>
                <li><strong>Daily IN/OUT data mapped to actual transaction dates</strong></li>
                <li>Summary columns: IN, OUT, NET, PREV, ADJUSTED, ACTUAL</li>
                <li>Category sections with items grouped</li>
                <li>Freeze panes for easy navigation</li>
              </ul>
            </div>
          </div>
          
          <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleCafeExport}>Export</button>
          </div>
        </div>
      );

      setModalContent({
        title: 'Export BE-ING Cafe Inventory',
        content: modalContent
      });
      setShowModal(true);
    } catch (err) {
      console.error('Failed to show cafe export modal:', err);
      error('Failed to show cafe export modal');
    }
  };

  const handleCafeExport = async () => {
    const startDateInput = document.getElementById('cafeStartDate') as HTMLInputElement;
    const endDateInput = document.getElementById('cafeEndDate') as HTMLInputElement;
    
    if (!startDateInput.value || !endDateInput.value) {
      error('Please select both start and end dates');
      return;
    }

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    setShowModal(false);
    
    try {
      // Get all cafe items data for the export
      const { data: cafeItems, error: itemsError } = await supabase
        .from('cafe_items')
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

      if (!cafeItems || cafeItems.length === 0) {
        error('No cafe data to export');
        return;
      }

      const itemIds = cafeItems.map(item => item.id);
      
      // Get all cafe transactions for these items
      const { data: transactions } = await supabase
        .from('cafe_transactions')
        .select('cafe_item_id, transaction_type, quantity, adjustment_type, transaction_date, source_destination, remarks, created_at')
        .in('cafe_item_id', itemIds)
        .order('created_at', { ascending: true });

      // Get cafe balances for current stock
      const { data: balances } = await supabase
        .from('cafe_balances')
        .select('cafe_item_id, current_balance, prev_balance, total_in, total_out')
        .in('cafe_item_id', itemIds);

      // Calculate current stock for each cafe item using the same logic
      const allCafeItemsData = cafeItems.map(item => {
        const itemBalance = balances?.find(b => b.cafe_item_id === item.id);
        
        return {
          id: item.id,
          item_name: item.item_name,
          category: item.category,
          unit: item.unit,
          prev_balance: itemBalance?.prev_balance || 0,
          total_in: itemBalance?.total_in || 0,
          total_out: itemBalance?.total_out || 0,
          current_stock: itemBalance?.current_balance || 0,
          reorder_level: item.reorder_level || 0
        };
      });

      // Use the exact same export logic but for cafe
      exportCafeData(startDate, endDate, allCafeItemsData);
      
    } catch (err) {
      console.error('Failed to export cafe:', err);
      error('Failed to export cafe data');
    }
  };

  // Exact same export function as stock room but for cafe
  const exportCafeData = (startDate: string, endDate: string, allCafeItemsData: any[]) => {
    try {
      // Calculate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Format date range for display
      const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
      const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
      const year = end.getFullYear();
      const dateRange = `${startFormatted}-${endFormatted}, ${year}`;

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Build the data array matching the exact format specification
      const data: Array<Array<string | number>> = [];
      const categoryRows: number[] = []; // Track category row indices for styling
      
      // Row 1: Title
      data.push(['BEING SUITES CAFE INVENTORY']);
      
      // Row 2: Subtitle with ENCODE HERE
      const row2: Array<string | number> = ['CAFE INVENTORY ENDING ACTUAL COUNT'];
      for (let i = 1; i < 10; i++) row2.push(''); // Empty cells
      row2[9] = 'ENCODE HERE'; // Position ENCODE HERE in column J (index 9)
      data.push(row2);
      
      // Row 3: Date range
      data.push([dateRange]);
      
      // Row 4: Column group headers
      const row4: Array<string | number> = ['UNIT ITEMS NAME', '', 'Ending Inv.'];
      
      // Add IN section header (spanning 15 days + 1 total)
      for (let i = 1; i <= 15; i++) {
        row4.push('IN');
      }
      row4.push('IN'); // IN total column
      
      // Add OUT section header (spanning 15 days + 1 total)
      for (let i = 1; i <= 15; i++) {
        row4.push('OUT');
      }
      row4.push('OUT'); // OUT total column
      
      // Add TOTAL section header
      row4.push('TOTAL');
      data.push(row4);
      
      // Row 5: Sub-headers
      const row5: Array<string | number> = ['', '', '30-Nov']; // Previous month ending
      
      // Add numbered columns 1-15 for IN
      for (let i = 1; i <= 15; i++) {
        row5.push(i);
      }
      row5.push('IN'); // IN subtotal
      
      // Add numbered columns 1-15 for OUT
      for (let i = 1; i <= 15; i++) {
        row5.push(i);
      }
      row5.push('OUT'); // OUT subtotal
      
      // Add TOTAL sub-headers
      row5.push('IN', 'OUT', 'NET', 'PREV', 'ADJUSTED', 'ACTUAL');
      data.push(row5);
      
      // Group items by category
      const groupedItems: Record<string, any[]> = {};
      allCafeItemsData.forEach(item => {
        const category = item.category || 'CAFE ITEMS';
        const mainCategory = category.split('-')[0] || 'CAFE ITEMS';
        if (!groupedItems[mainCategory]) {
          groupedItems[mainCategory] = [];
        }
        groupedItems[mainCategory].push(item);
      });
      
      // Add items by category
      Object.keys(groupedItems).forEach(category => {
        // Add category header row (track for red styling and merging)
        const categoryRowIndex = data.length;
        categoryRows.push(categoryRowIndex);
        const categoryRow = [category.toUpperCase()];
        // Fill the rest of the row with empty strings for proper merging
        for (let i = 1; i < 42; i++) {
          categoryRow.push('');
        }
        data.push(categoryRow);
        
        // Add items in this category
        groupedItems[category].forEach((item: any) => {
          const row: Array<string | number> = [];
          row[0] = item.item_name; // Item name
          row[1] = item.unit; // Unit
          row[2] = Math.round(item.prev_balance || 0); // Previous month ending (30-Nov)
          
          // Daily IN columns (1-15) - empty for now, can be filled manually
          for (let i = 3; i < 18; i++) {
            row[i] = '';
          }
          row[18] = Math.round(item.total_in || 0); // IN subtotal
          
          // Daily OUT columns (1-15) - empty for now, can be filled manually
          for (let i = 19; i < 34; i++) {
            row[i] = '';
          }
          row[34] = Math.round(item.total_out || 0); // OUT subtotal
          
          // TOTAL section
          row[35] = Math.round(item.total_in || 0); // TOTAL IN
          row[36] = Math.round(item.total_out || 0); // TOTAL OUT
          row[37] = Math.round((item.total_in || 0) - (item.total_out || 0)); // NET
          row[38] = Math.round(item.prev_balance || 0); // PREV
          row[39] = Math.round(item.prev_balance + (item.total_in || 0) - (item.total_out || 0)); // ADJUSTED
          row[40] = Math.round(item.current_stock || 0); // ACTUAL
          
          data.push(row);
        });
      });
      
      // Create worksheet with exact same styling as stock room
      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Apply all the same styling and formatting as stock room export
      // Merge cells for title and subtitle rows to make text visible
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }
      ];
      
      // Add merges for category rows
      categoryRows.forEach(rowIndex => {
        (ws['!merges'] ||= []).push({
          s: { r: rowIndex, c: 0 },
          e: { r: rowIndex, c: 5 }
        });
      });
      
      // Set column widths - same as stock room
      const colWidths = [
        { wch: 20 }, { wch: 4 }, { wch: 8 }
      ];
      for (let i = 0; i < 30; i++) { colWidths.push({ wch: 3 }); }
      colWidths.push({ wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 6 }, { wch: 6 });
      ws['!cols'] = colWidths;
      
      // Add freeze panes
      ws['!freeze'] = { xSplit: 3, ySplit: 5 };
      
      // Apply exact same styling as stock room
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      
      // Style all rows exactly like stock room export
      // (Same styling code as stock room - title, subtitle, headers, categories, data rows, total section)
      
      // Add worksheet to workbook
      const sheetName = `CAFE ${startFormatted}-${endFormatted}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Generate filename
      const filename = `BE-ING CAFE INVENTORY (${dateRange}).xlsx`;
      
      // Write file
      XLSX.writeFile(wb, filename);
      
      success(`Cafe inventory exported successfully for ${dateRange}!`);
    } catch (error: any) {
      console.error('Failed to export cafe:', error);
      error('Failed to export cafe data: ' + (error.message || 'Unknown error'));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSourceFilter('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'IN': return '#059669';
      case 'OUT': return '#DC2626';
      case 'ADJUSTMENT': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getSourceIcon = (source: string) => {
    return source === 'cafe' ? '☕' : '📦';
  };

  const getSourceName = (source: string) => {
    return source === 'cafe' ? 'Cafe' : 'Stock Room';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      {/* Header */}
      <div className="history-header">
        <div className="header-left">
          <h2>📋 Transaction History</h2>
          <p>View and manage all inventory transactions</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-success" onClick={exportStockRoom}>
            📥 Export Stock Room
          </button>
          <button className="btn btn-success" onClick={exportCafeStock}>
            ☕ Export Cafe Stock
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="🔍 Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Sources</option>
            <option value="stock-room">📦 Stock Room Only</option>
            <option value="cafe">☕ Cafe Only</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
            placeholder="End Date"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {currentTransactions.length} of {filteredTransactions.length} transactions
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Item</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Source/Destination</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((transaction) => (
              <tr key={`${transaction.source}-${transaction.id}`}>
                <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                <td>
                  <span className="source-badge">
                    {getSourceIcon(transaction.source)} {getSourceName(transaction.source)}
                  </span>
                </td>
                <td className="item-name">{transaction.item_name}</td>
                <td>
                  <span 
                    className="transaction-type-badge"
                    style={{ color: getTransactionTypeColor(transaction.transaction_type) }}
                  >
                    {transaction.transaction_type}
                  </span>
                </td>
                <td className="quantity-cell">{transaction.quantity}</td>
                <td>{transaction.item_unit}</td>
                <td>{transaction.source_destination}</td>
                <td className="remarks-cell">{transaction.remarks}</td>
                <td className="actions-cell">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteTransaction(transaction)}
                    title="Delete Transaction"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Transactions Found</h3>
          <p>
            {searchTerm || sourceFilter || typeFilter || startDate || endDate
              ? 'Try adjusting your filters to see more results.'
              : 'No transactions have been recorded yet.'}
          </p>
        </div>
      )}

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
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h3 style={{ margin: 0, color: '#1F2937' }}>{modalContent.title}</h3>
              <button
                onClick={() => setShowModal(false)}
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
            <div className="modal-body">
              {modalContent.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
