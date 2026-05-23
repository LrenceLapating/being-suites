import { supabase } from '../lib/supabase';

// Types for inventory system
export interface InventoryItem {
  id: string;
  item_name: string;
  unit: string;
  category: string;
  reorder_level: number;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
  created_by?: string;
  current_balance?: number;
}

export interface CafeItem {
  id: string;
  item_name: string;
  unit: string;
  category?: string;
  reorder_level: number;
  status: 'Active' | 'Inactive';
  source_item_id?: string;
  created_at: string;
  updated_at: string;
  current_balance?: number;
}

export interface Transaction {
  id: string;
  item_id?: string;
  item_name?: string;
  item_unit?: string;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  transaction_date: string;
  quantity: number;
  source_destination?: string;
  adjustment_type?: 'Over' | 'Short';
  remarks?: string;
  created_by?: string;
  created_at: string;
}

export interface CafeTransaction {
  id: string;
  cafe_item_id?: string;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  transaction_date: string;
  source_destination?: string;
  remarks?: string;
  user_id?: string;
  created_at: string;
}

export interface Balance {
  id: string;
  item_id?: string;
  balance_date: string;
  current_balance: number;
  previous_balance: number;
  stock_in: number;
  stock_out: number;
  adjustment: number;
  created_at: string;
}

export interface CafeBalance {
  id: string;
  cafe_item_id?: string;
  current_balance: number;
  balance_date?: string;
  updated_at: string;
}

// Main Inventory Items
export const getAllItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      balances(current_balance)
    `)
    .eq('status', 'Active')
    .order('item_name');

  if (error) throw error;

  return data.map(item => ({
    ...item,
    current_balance: item.balances?.[0]?.current_balance || 0
  }));
};

export const createItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('items')
    .insert({
      ...item
    })
    .select()
    .single();

  if (error) throw error;

  // Create initial balance record
  await supabase
    .from('balances')
    .insert({
      item_id: data.id,
      balance_date: new Date().toISOString().split('T')[0],
      current_balance: 0,
      previous_balance: 0,
      stock_in: 0,
      stock_out: 0,
      adjustment: 0
    });

  return data;
};

export const updateItem = async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('items')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('items')
    .update({ status: 'Inactive' })
    .eq('id', id);

  if (error) throw error;
};

// Cafe Items
export const getAllCafeItems = async (): Promise<CafeItem[]> => {
  const { data, error } = await supabase
    .from('cafe_items')
    .select(`
      *,
      cafe_balances(current_balance)
    `)
    .eq('status', 'Active')
    .order('item_name');

  if (error) throw error;

  return data.map(item => ({
    ...item,
    current_balance: item.cafe_balances?.[0]?.current_balance || 0
  }));
};

export const createCafeItem = async (item: Omit<CafeItem, 'id' | 'created_at' | 'updated_at'>): Promise<CafeItem> => {
  const { data, error } = await supabase
    .from('cafe_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;

  // Create initial balance record
  await supabase
    .from('cafe_balances')
    .insert({
      cafe_item_id: data.id,
      current_balance: 0,
      balance_date: new Date().toISOString().split('T')[0]
    });

  return data;
};

// Transactions
export const getAllTransactions = async (limit = 100): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction
    })
    .select()
    .single();

  if (error) throw error;

  // Update balance
  await updateItemBalance(transaction.item_id!, transaction.transaction_type, transaction.quantity);

  return data;
};

// Cafe Transactions
export const getAllCafeTransactions = async (limit = 100): Promise<CafeTransaction[]> => {
  const { data, error } = await supabase
    .from('cafe_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const createCafeTransaction = async (transaction: Omit<CafeTransaction, 'id' | 'created_at'>): Promise<CafeTransaction> => {
  const { data, error } = await supabase
    .from('cafe_transactions')
    .insert({
      ...transaction
    })
    .select()
    .single();

  if (error) throw error;

  // Update cafe balance
  await updateCafeItemBalance(transaction.cafe_item_id!, transaction.transaction_type, transaction.quantity);

  return data;
};

// Balance Management
const updateItemBalance = async (itemId: string, transactionType: string, quantity: number): Promise<void> => {
  // Get current balance
  const { data: currentBalance } = await supabase
    .from('balances')
    .select('current_balance')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const current = currentBalance?.current_balance || 0;
  let newBalance = current;

  switch (transactionType) {
    case 'IN':
      newBalance = current + quantity;
      break;
    case 'OUT':
      newBalance = current - quantity;
      break;
    case 'ADJUSTMENT':
      newBalance = quantity; // Direct adjustment to specific amount
      break;
  }

  // Create new balance record
  await supabase
    .from('balances')
    .insert({
      item_id: itemId,
      balance_date: new Date().toISOString().split('T')[0],
      current_balance: newBalance,
      previous_balance: current,
      stock_in: transactionType === 'IN' ? quantity : 0,
      stock_out: transactionType === 'OUT' ? quantity : 0,
      adjustment: transactionType === 'ADJUSTMENT' ? (quantity - current) : 0
    });
};

const updateCafeItemBalance = async (cafeItemId: string, transactionType: string, quantity: number): Promise<void> => {
  // Get current balance
  const { data: currentBalance } = await supabase
    .from('cafe_balances')
    .select('current_balance')
    .eq('cafe_item_id', cafeItemId)
    .single();

  const current = currentBalance?.current_balance || 0;
  let newBalance = current;

  switch (transactionType) {
    case 'IN':
      newBalance = current + quantity;
      break;
    case 'OUT':
      newBalance = current - quantity;
      break;
    case 'ADJUSTMENT':
      newBalance = quantity;
      break;
  }

  // Update balance record
  await supabase
    .from('cafe_balances')
    .upsert({
      cafe_item_id: cafeItemId,
      current_balance: newBalance,
      balance_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    });
};

// Physical Count Management
export const createPhysicalCount = async (counts: any[]): Promise<void> => {
  // Create physical count records
  const physicalCounts = counts.map(count => ({
    item_id: count.item_id,
    system_count: count.system_count,
    actual_count: count.actual_count,
    variance: count.variance,
    variance_status: count.variance_status,
    count_date: count.count_date
  }));

  const { error: countError } = await supabase
    .from('physical_counts')
    .insert(physicalCounts);

  if (countError) throw countError;

  // Create adjustment transactions for variances
  for (const count of counts) {
    if (count.variance !== 0) {
      await createTransaction({
        item_id: count.item_id,
        transaction_type: 'ADJUSTMENT',
        quantity: count.actual_count,
        transaction_date: count.count_date,
        source_destination: 'Physical Count',
        adjustment_type: count.variance_status === 'Over' ? 'Over' : 'Short',
        remarks: `Physical count adjustment. Variance: ${count.variance}`
      });
    }
  }
};

// Enhanced Transaction Functions
export const getRecentTransactions = async (days = 7): Promise<Transaction[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      items(item_name, unit)
    `)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getTransactionsByItem = async (itemId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Enhanced Item Management
export const updateItemInline = async (id: string, field: string, value: any): Promise<void> => {
  const updateData: any = {};
  updateData[field] = value;
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('items')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

// Cafe Item Management Functions
export const updateCafeItem = async (id: string, updates: Partial<CafeItem>): Promise<CafeItem> => {
  const { data, error } = await supabase
    .from('cafe_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCafeItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cafe_items')
    .update({ status: 'Inactive' })
    .eq('id', id);

  if (error) throw error;
};

export const getCafeItemsWithData = async (params: {
  category?: string;
  days?: number;
  page?: number;
  limit?: number;
}): Promise<{ items: any[]; total: number }> => {
  try {
    // Get cafe items with their current balances
    const { data: items, error: itemsError } = await supabase
      .from('cafe_items')
      .select(`
        id,
        item_name,
        category,
        unit,
        reorder_level,
        source_item_id,
        cafe_balances(current_balance)
      `)
      .eq('status', 'Active')
      .order('item_name');

    if (itemsError) throw itemsError;

    if (!items || items.length === 0) {
      return { items: [], total: 0 };
    }

    const itemIds = items.map(item => item.id);
    
    // Get all cafe transactions for these items to calculate totals
    let transactionsQuery = supabase
      .from('cafe_transactions')
      .select('cafe_item_id, transaction_type, quantity, adjustment_type, transaction_date, source_destination, remarks, created_at');
    
    if (itemIds.length === 1) {
      transactionsQuery = transactionsQuery.eq('cafe_item_id', itemIds[0]);
    } else if (itemIds.length > 1) {
      transactionsQuery = transactionsQuery.in('cafe_item_id', itemIds);
    }
    
    const { data: transactions } = await transactionsQuery.order('created_at', { ascending: true });

    // Get month start markers (opening balance transactions)
    let markersQuery = supabase
      .from('cafe_transactions')
      .select('id, cafe_item_id, transaction_date, quantity, source_destination, remarks, created_at');
    
    if (itemIds.length === 1) {
      markersQuery = markersQuery.eq('cafe_item_id', itemIds[0]);
    } else if (itemIds.length > 1) {
      markersQuery = markersQuery.in('cafe_item_id', itemIds);
    }
    
    const { data: monthStartMarkers } = await markersQuery
      .ilike('source_destination', '%Opening Balance%')
      .ilike('remarks', '%Start New Month%')
      .order('created_at', { ascending: false });

    const transformedItems = items.map(item => {
      const itemTransactions = transactions?.filter(t => t.cafe_item_id === item.id) || [];
      const itemMonthStart = monthStartMarkers?.find(m => m.cafe_item_id === item.id);
      
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

      // Use the current balance from cafe_balances table (this is the accurate current stock)
      const currentStock = item.cafe_balances?.[0]?.current_balance || 0;
      
      return {
        id: item.id,
        item_name: item.item_name,
        category: item.category,
        unit: item.unit,
        prev_balance: prevBalance,
        total_in: totalIn,
        total_out: totalOut,
        current_stock: parseFloat(currentStock),
        reorder_level: item.reorder_level,
        source_item_id: item.source_item_id
      };
    });

    return {
      items: transformedItems,
      total: transformedItems.length
    };
  } catch (error) {
    console.error('Error fetching cafe items with data:', error);
    return { items: [], total: 0 };
  }
};

export const transferTocafe = async (params: {
  sourceItemId: string;
  cafeItemId: string;
  quantity: number;
  remarks?: string;
}): Promise<void> => {
  const { sourceItemId, cafeItemId, quantity, remarks } = params;
  const today = new Date().toISOString().split('T')[0];

  // Create OUT transaction for main inventory
  await createTransaction({
    item_id: sourceItemId,
    transaction_type: 'OUT',
    quantity: quantity,
    transaction_date: today,
    source_destination: 'Transfer to Cafe',
    remarks: remarks || 'Stock transfer to cafe inventory'
  });

  // Create IN transaction for cafe inventory
  await createCafeTransaction({
    cafe_item_id: cafeItemId,
    transaction_type: 'IN',
    quantity: quantity,
    transaction_date: today,
    source_destination: 'Transfer from Main Inventory',
    remarks: remarks || 'Stock transfer from main inventory'
  });
};

export const getCafeCategories = async (): Promise<string[]> => {
  try {
    const { data } = await supabase
      .from('cafe_items')
      .select('category')
      .eq('status', 'Active');
    
    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
    return categories;
  } catch (error) {
    console.error('Error fetching cafe categories:', error);
    return [];
  }
};

export const getItemsByCategory = async (category: string): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      balances(current_balance)
    `)
    .eq('status', 'Active')
    .ilike('category', `%${category}%`)
    .order('item_name');

  if (error) throw error;

  return data.map(item => ({
    ...item,
    current_balance: item.balances?.[0]?.current_balance || 0
  }));
};

// Dashboard Stats
export const getInventoryStats = async () => {
  // Get total items
  const { count: totalItems } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Active');

  // Get low stock items (below reorder level)
  const { data: lowStockItems } = await supabase
    .from('items')
    .select(`
      id,
      item_name,
      reorder_level,
      balances(current_balance)
    `)
    .eq('status', 'Active');

  const lowStock = lowStockItems?.filter(item => 
    (item.balances?.[0]?.current_balance || 0) <= item.reorder_level
  ).length || 0;

  // Get total cafe items
  const { count: totalCafeItems } = await supabase
    .from('cafe_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Active');

  // Get recent transactions count (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count: recentTransactions } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  return {
    totalItems: totalItems || 0,
    lowStock,
    totalCafeItems: totalCafeItems || 0,
    recentTransactions: recentTransactions || 0
  };
};