"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Shopping cart for the Pacific store.
 *
 * Lives in localStorage only, like favorites (ps_favorites_v1) — there
 * is no server-side notion of "this visitor's cart". Orders are not
 * paid online: placing one writes an orderRequest document to Sanity
 * and emails the team, who then contact the customer. So the cart
 * never needs to survive a device change or be reconciled with
 * inventory; it only needs to hold what someone picked while browsing.
 *
 * Pieces are sold by the unit here. Dimensions, basin count and finish
 * are held per line rather than per product, because the same vanity at
 * 48" polished and 60" leathered is two different things to quote — and
 * any dimension may be a value the customer typed.
 */

const STORAGE_KEY = "ps_cart_v1";

/** The fields a customer can change on a line after adding it. */
export type CartOption =
  | "colour"
  | "length"
  | "width"
  | "height"
  | "basins"
  | "finish";

export interface CartItem {
  /** Sanity _id — with thickness and finish, forms the line key. */
  id: string;
  name: string;
  slug: string;
  image: string | null;
  collection: string | null;
  /**
   * Options the customer picked. Dimensions are inches, and each may be a
   * preset or a value typed for a custom piece, so the order carries one
   * answer either way. `basins` is blank where the question does not apply.
   */
  /** The Pacific design the piece is made from. */
  colour: string;
  length: string;
  width: string;
  height: string;
  basins: string;
  finish: string;
  quantity: number;
}

/** Two lines merge only when product and every option match. */
export function lineKey(
  item: Pick<
    CartItem,
    "id" | "colour" | "length" | "width" | "height" | "basins" | "finish"
  >
): string {
  return [
    item.id,
    item.colour,
    item.length,
    item.width,
    item.height,
    item.basins,
    item.finish,
  ].join("::");
}

interface CartContextValue {
  items: CartItem[];
  /** Total pieces, for the header badge. */
  count: number;
  /** True once localStorage has been read, so the badge can't flash. */
  ready: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  setOption: (key: string, option: CartOption, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: a stored cart written by an older build (or hand-
    // edited) shouldn't be able to crash the header on every page.
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as CartItem).id === "string" &&
        typeof (i as CartItem).name === "string"
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Read after mount so server and first client render agree.
  useEffect(() => {
    setItems(readStored());
    setReady(true);
  }, []);

  // Persist on every change, but not before the initial read — that
  // would write an empty array over a real cart on first paint.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Private mode, quota, or storage disabled. The cart still works
      // for this page view; it just won't survive a reload.
    }
  }, [items, ready]);

  // Another tab added something — keep this one in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = lineKey(item);
        const existing = prev.find((i) => lineKey(i) === key);
        if (existing) {
          return prev.map((i) =>
            lineKey(i) === key
              ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => lineKey(i) !== key)
        : prev.map((i) =>
            lineKey(i) === key ? { ...i, quantity: Math.min(99, quantity) } : i
          )
    );
  }, []);

  const setOption = useCallback(
    (key: string, option: CartOption, value: string) => {
      setItems((prev) => {
        const target = prev.find((i) => lineKey(i) === key);
        if (!target) return prev;
        const updated = { ...target, [option]: value };
        const updatedKey = lineKey(updated);
        // Changing an option can collide with a line that already
        // exists — merge into it rather than leaving a duplicate.
        const collision = prev.find(
          (i) => lineKey(i) === updatedKey && lineKey(i) !== key
        );
        if (collision) {
          return prev
            .filter((i) => lineKey(i) !== key)
            .map((i) =>
              lineKey(i) === updatedKey
                ? {
                    ...i,
                    quantity: Math.min(99, i.quantity + target.quantity),
                  }
                : i
            );
        }
        return prev.map((i) => (lineKey(i) === key ? updated : i));
      });
    },
    []
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      ready,
      addItem,
      setQuantity,
      setOption,
      removeItem,
      clear,
    }),
    [items, ready, addItem, setQuantity, setOption, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
