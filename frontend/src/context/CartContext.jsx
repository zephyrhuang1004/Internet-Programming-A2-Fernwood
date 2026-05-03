import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]); // [{product_id, qty}]
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const cart = await cartService.getCart();
      setItems(cart?.items || []);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  const add = useCallback(async (productId, qty = 1) => {
    const cart = await cartService.addItem(productId, qty);
    setItems(cart?.items || []);
  }, []);

  const update = useCallback(async (productId, qty) => {
    const cart = await cartService.updateQty(productId, qty);
    setItems(cart?.items || []);
  }, []);

  const remove = useCallback(async (productId) => {
    const cart = await cartService.removeItem(productId);
    setItems(cart?.items || []);
  }, []);

  const clear = useCallback(async () => {
    await cartService.clearCart();
    setItems([]);
  }, []);

  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartCtx.Provider value={{ items, count, loading, reload, add, update, remove, clear }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
