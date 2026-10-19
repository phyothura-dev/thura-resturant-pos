import { useState, useMemo, useEffect, useCallback } from 'react';
import { calculateTotals } from '../config/constants';

function getStorageKey(tableId) {
  return `pos_cart_${tableId}`;
}

function loadCartFromStorage(tableId) {
  try {
    const raw = localStorage.getItem(getStorageKey(tableId));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load cart from storage:', e);
  }
  return null;
}

function saveCartToStorage(tableId, cart) {
  try {
    if (cart.length > 0) {
      localStorage.setItem(getStorageKey(tableId), JSON.stringify(cart));
    } else {
      localStorage.removeItem(getStorageKey(tableId));
    }
  } catch (e) {
    console.error('Failed to save cart to storage:', e);
  }
}

export function useCart(pendingSale, tableId) {
  const [cart, setCart] = useState(() => {
    if (pendingSale) {
      return pendingSale.sale_items.map((si) => ({
        id: si.product_id,
        saleItemId: si.id,
        name: si.products?.name || 'Unknown',
        price: si.products?.price || 0,
        image_url: si.products?.image_url || '',
        quantity: si.quantity,
        notes: si.notes || '',
      }));
    }
    if (tableId) {
      const cached = loadCartFromStorage(tableId);
      if (cached && cached.length > 0) return cached;
    }
    return [];
  });

  const [pendingSaleId, setPendingSaleId] = useState(() => pendingSale?.id || null);
  const [prevSource, setPrevSource] = useState({ saleId: pendingSale?.id, tableId });

  // sync state
  if (prevSource.saleId !== pendingSale?.id || prevSource.tableId !== tableId) {
    setPrevSource({ saleId: pendingSale?.id, tableId });
    if (pendingSale) {
      setPendingSaleId(pendingSale.id);
      setCart(
        pendingSale.sale_items.map((si) => ({
          id: si.product_id,
          saleItemId: si.id,
          name: si.products?.name || 'Unknown',
          price: si.products?.price || 0,
          image_url: si.products?.image_url || '',
          quantity: si.quantity,
          notes: si.notes || '',
        })),
      );
    } else {
      setPendingSaleId(null);
      if (tableId) {
        const cached = loadCartFromStorage(tableId);
        setCart(cached && cached.length > 0 ? cached : []);
      } else {
        setCart([]);
      }
    }
  }

  // local cache
  useEffect(() => {
    if (!tableId) return;
    saveCartToStorage(tableId, cart);
  }, [cart, tableId]);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, notes: '' }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  }, []);

  const updateNotes = useCallback((productId, notes) => {
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, notes } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setPendingSaleId(null);
    if (tableId) localStorage.removeItem(getStorageKey(tableId));
  }, [tableId]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const { tax, total } = useMemo(() => calculateTotals(subtotal), [subtotal]);

  return {
    cart,
    pendingSaleId,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    subtotal,
    tax,
    total,
  };
}
