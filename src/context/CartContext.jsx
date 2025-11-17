import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../utils/supabase";
import { SessionContext } from "./SessionContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { session } = useContext(SessionContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("product_1v").select();
      if (!error) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Load cart when session is available
  useEffect(() => {
    async function fetchCart() {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("cart")
        .select("quantity, product_1v(*)")
        .eq("user_id", session.user.id);

      if (!error && data) {
        setCart(
          data.map((item) => ({
            ...item.product_1v,
            quantity: item.quantity,
          }))
        );
      }
    }
    fetchCart();
  }, [session]);

  async function addToCart(product) {
    if (!session?.user) return alert("Faça login para adicionar ao carrinho.");

    const existing = cart.find((item) => item.id === product.id);
    if (existing) return updateQtyCart(product.id, existing.quantity + 1);

    setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    await supabase.from("cart").insert({
      user_id: session.user.id,
      product_id: product.id,
      quantity: 1,
    });
  }

  async function updateQtyCart(productId, quantity) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );

    if (session?.user) {
      await supabase
        .from("cart")
        .update({ quantity })
        .eq("user_id", session.user.id)
        .eq("product_id", productId);
    }
  }

  async function clearCart() {
    setCart([]);
    if (session?.user) {
      await supabase.from("cart").delete().eq("user_id", session.user.id);
    }
  }

  return (
    <CartContext.Provider
      value={{ products, loading, cart, addToCart, updateQtyCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
