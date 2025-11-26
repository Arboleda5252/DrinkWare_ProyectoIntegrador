"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CartItem = {
  productId: string;
  quantity: number;
};

type InventoryProduct = {
  id?: string;
  name: string;
  price?: number;
  description?: string;
  stock?: number;
};

export default function Page() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [stockError, setStockError] = useState("");

  const selectedProduct = useMemo(() => {
    return inventoryProducts.find((product) => product.id === selectedProductId);
  }, [inventoryProducts, selectedProductId]);

  const selectedProductCartQuantity = useMemo(() => {
    return cartItems.find((item) => item.productId === selectedProductId)?.quantity ?? 0;
  }, [cartItems, selectedProductId]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const product = inventoryProducts.find((prod) => prod.id === item.productId);
      if (!product) return acc;
      return acc + (product.price ?? 0) * item.quantity;
    }, 0);
  }, [cartItems, inventoryProducts]);

  const detailedItems = useMemo(() => {
    return cartItems.map((item) => {
      const product = inventoryProducts.find((prod) => prod.id === item.productId);
      return {
        ...item,
        name: product?.name ?? "Producto",
        price: product?.price ?? 0,
        subtotal: (product?.price ?? 0) * item.quantity,
      };
    });
  }, [cartItems, inventoryProducts]);

  const filteredInventoryProducts = useMemo(() => {
    const term = inventorySearch.trim().toLowerCase();
    if (!term) {
      return inventoryProducts;
    }
    return inventoryProducts.filter((product) => {
      const name = (product.name ?? "").toLowerCase();
      const description = (product.description ?? "").toLowerCase();
      return name.includes(term) || description.includes(term);
    });
  }, [inventoryProducts, inventorySearch]);

  const handleAddProduct = () => {
    if (!selectedProduct || !selectedProductId || quantity < 1 || stockError) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === selectedProductId);
      if (existing) {
        return prev.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: selectedProductId, quantity }];
    });

    setQuantity(1);
    setConfirmationMessage("");
  };

  const handleRegisterSale = () => {
    if (!customerName || !customerPhone || !customerAddress || cartItems.length === 0) {
      setConfirmationMessage("Completa los datos del cliente y agrega al menos un producto.");
      return;
    }

    setConfirmationMessage(
      `Venta registrada para ${customerName}. Total: $${totalAmount.toLocaleString("es-CO")}`
    );
  };

  const fetchInventoryProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      setInventoryLoading(true);
      setInventoryError("");

      const response = await fetch("/api/productos", { signal });
      if (!response.ok) {
        throw new Error("No fue posible cargar el inventario.");
      }

      const payload = await response.json();
      const rawProducts: any[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.productos)
        ? payload.productos
        : Array.isArray(payload)
        ? payload
        : [];

      const parsed: InventoryProduct[] = rawProducts
        .filter((product) => (product?.estados ?? "Disponible") === "Disponible")
        .map((product) => ({
          id: product?.id?.toString() ?? product?.idproducto?.toString() ?? product?.nombre,
          name: product?.name ?? product?.nombre ?? "Producto sin nombre",
          price: typeof product?.precio === "number" ? product.precio : Number(product?.precio) || 0,
          description: product?.description ?? product?.descripcion ?? "",
          stock: typeof product?.stock === "number" ? product.stock : Number(product?.stock) || 0,
        }));

      setInventoryProducts(parsed);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setInventoryError(
        (error as Error).message || "Ocurrió un error cargando el inventario. Intenta de nuevo."
      );
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchInventoryProducts(controller.signal);
    return () => controller.abort();
  }, [fetchInventoryProducts]);

  useEffect(() => {
    if (showInventoryModal) {
      setInventorySearch("");
    }
  }, [showInventoryModal]);

  useEffect(() => {
    if (!selectedProductId && inventoryProducts.length > 0) {
      setSelectedProductId(inventoryProducts[0].id ?? "");
    }
  }, [inventoryProducts, selectedProductId]);

  useEffect(() => {
    if (!selectedProduct) {
      setStockError("");
      return;
    }
    const availableStock = selectedProduct.stock ?? 0;
    const alreadyAdded = selectedProductCartQuantity;
    if (availableStock <= 0) {
      setStockError("Este producto no tiene stock disponible.");
      return;
    }
    if (quantity + alreadyAdded > availableStock) {
      const remaining = Math.max(availableStock - alreadyAdded, 0);
      setStockError(
        remaining > 0
          ? `La cantidad excede el stock disponible. Solo puedes agregar ${remaining} unidad(es) más.`
          : "Ya has utilizado todo el stock disponible en este pedido."
      );
      return;
    }
    setStockError("");
  }, [selectedProduct, quantity, selectedProductCartQuantity]);

  const handleInventoryButtonClick = () => {
    setShowInventoryModal(true);
    if (!inventoryProducts.length && !inventoryLoading) {
      fetchInventoryProducts();
    }
  };

  return (
    <section className="w-full bg-slate-50 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-2xl bg-white p-8 shadow-lg">
        <header className="space-y-4 border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Registrar nueva venta</h1>
            </div>
            <button
              type="button"
              onClick={handleInventoryButtonClick}
              className="inline-flex items-center justify-center rounded-full border border-blue-700 px-5 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Ver inventario
            </button>
          </div>
          <p className="text-sm text-slate-500">
            Completa los datos del cliente y confirma el pedido.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Datos del cliente</h2>
            <div className="space-y-4">
              <label className="flex flex-col text-sm font-medium text-slate-600">
                Nombre completo
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Nombre del cliente"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Teléfono
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="#######"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Dirección
                <textarea
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  placeholder="Ciudad y dirección completa"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Agregar productos</h2>
            <div className="space-y-4">
              <label className="flex flex-col text-sm font-medium text-slate-600">
                Selecciona un producto
                <select
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  disabled={inventoryLoading || inventoryProducts.length === 0}
                >
                  {inventoryProducts.length === 0 ? (
                    <option value="">
                      {inventoryLoading ? "Cargando inventario..." : "Sin productos disponibles"}
                    </option>
                  ) : (
                    inventoryProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - $
                        {product.price?.toLocaleString("es-CO") ?? "0"} (Stock:{" "}
                        {product.stock ?? 0})
                      </option>
                    ))
                  )}
                </select>
                {inventoryError && inventoryProducts.length === 0 && (
                  <span className="mt-1 text-xs text-rose-600">{inventoryError}</span>
                )}
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Cantidad
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(parseInt(event.target.value, 10) || 1)}
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                {selectedProduct && (
                  <span
                    className={`mt-1 text-xs ${
                      stockError ? "text-rose-600" : "text-slate-500"
                    }`}
                  >
                    {stockError
                      ? stockError
                      : `Disponible: ${
                          (selectedProduct.stock ?? 0) - selectedProductCartQuantity
                        } unidad(es) libres.`}
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedProductId || !!stockError || inventoryProducts.length === 0}
                className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Añadir al pedido
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">Productos seleccionados</h2>
            
          </div>

          {cartItems.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Aún no has agregado productos. Selecciona uno y pulsa “Añadir al pedido”.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="text-xs uppercase text-slate-400">
                    <th className="py-2">Producto</th>
                    <th className="py-2">Cantidad</th>
                    <th className="py-2">Precio unidad</th>
                    <th className="py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedItems.map((item) => (
                    <tr key={item.productId} className="border-t text-sm">
                      <td className="py-3 font-medium text-slate-700">{item.name}</td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">${item.price.toLocaleString("es-CO")}</td>
                      <td className="py-3 font-semibold text-slate-900">
                        ${item.subtotal.toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-700">Total a pagar</p>
              <p className="text-2xl font-bold text-slate-900">${totalAmount.toLocaleString("es-CO")}</p>
            </div>
            <button
              type="button"
              onClick={handleRegisterSale}
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              Registrar venta
            </button>
          </div>

          {confirmationMessage && (
            <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {confirmationMessage}
            </p>
          )}
        </div>
      </div>

      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8 text-slate-700">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Listado de productos</h3>
                <p className="text-sm text-slate-500">
                  Consulta el stock actual. Solo lectura para el vendedor.
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar inventario"
                onClick={() => setShowInventoryModal(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="w-full text-left text-sm font-medium text-slate-600">
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(event) => setInventorySearch(event.target.value)}
                  placeholder="Buscar en el inventario"
                  disabled={inventoryLoading || inventoryProducts.length === 0}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </label>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto text-center">
              {inventoryLoading ? (
                <p className="text-center text-sm text-slate-500">Cargando inventario...</p>
              ) : inventoryError ? (
                <div className="mx-auto max-w-md rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <p>{inventoryError}</p>
                  <button
                    type="button"
                    onClick={() => fetchInventoryProducts()}
                    className="mt-2 text-xs font-semibold text-rose-700 underline"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : inventoryProducts.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  No hay productos disponibles en el inventario.
                </p>
              ) : filteredInventoryProducts.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  No se encontraron productos para esa busqueda.
                </p>
              ) : (
                <div className="flex justify-center">
                  <table className="w-full max-w-2xl table-auto text-center text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-slate-400">
                        <th className="py-2">Nombre</th>
                        <th className="py-2">Descripción</th>
                        <th className="py-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventoryProducts.map((product) => (
                        <tr key={product.id ?? product.name} className="border-t border-slate-100">
                          <td className="py-3 font-semibold text-slate-800">{product.name}</td>
                          <td className="py-3 text-slate-500">
                            {product.description ?? "Sin descripción"}
                          </td>
                          <td className="py-3 font-bold text-slate-900">
                            {product.stock ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
