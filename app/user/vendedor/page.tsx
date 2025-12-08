"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CartItem = {
  productId: string;
  quantity: number;
};

type InventorioProducto = {
  id?: string;
  name: string;
  price?: number;
  description?: string;
  stock?: number;
};

type ventas = {
  id: number;
  productoId: number;
  cantidad: number;
  precioProducto: number;
  subtotal: number;
  fechaPago: string | null;
  estado: string | null;
  nombreCliente: string | null;
};

export default function Page() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDocument, setCustomerDocument] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerUserId, setCustomerUserId] = useState<number | null>(null);
  const [documentLookupLoading, setDocumentLookupLoading] = useState(false);
  const [documentLookupError, setDocumentLookupError] = useState("");
  const [documentLookupMessage, setDocumentLookupMessage] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [inventorioProductos, setinventorioProductos] = useState<InventorioProducto[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [ventasRecords, setventasRecords] = useState<ventas[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState("");
  const [stockError, setStockError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [vendedorId, setVendedorId] = useState<number | null>(null);
  const [vendedorError, setVendedorError] = useState("");

  // Producto seleccionado
  const seleccionarProducto = useMemo(() => {
    return inventorioProductos.find((product) => product.id === selectedProductId);
  }, [inventorioProductos, selectedProductId]);

  // Cantidad del producto seleccionado en el carrito
  const seleccionarProductoCart = useMemo(() => {
    return cartItems.find((item) => item.productId === selectedProductId)?.quantity ?? 0;
  }, [cartItems, selectedProductId]);

  // Total del carrito
  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const product = inventorioProductos.find((prod) => prod.id === item.productId);
      if (!product) return acc;
      return acc + (product.price ?? 0) * item.quantity;
    }, 0);
  }, [cartItems, inventorioProductos]);

  // Detalles en el carrito
  const detalleItems = useMemo(() => {
    return cartItems.map((item) => {
      const product = inventorioProductos.find((prod) => prod.id === item.productId);
      return {
        ...item,
        name: product?.name ?? "Producto",
        price: product?.price ?? 0,
        subtotal: (product?.price ?? 0) * item.quantity,
      };
    });
  }, [cartItems, inventorioProductos]);

  // Filtrado de inventario
  const filtradoInventarioProducts = useMemo(() => {
    const term = inventorySearch.trim().toLowerCase();
    if (!term) {
      return inventorioProductos;
    }
    return inventorioProductos.filter((product) => {
      const name = (product.name ?? "").toLowerCase();
      const description = (product.description ?? "").toLowerCase();
      return name.includes(term) || description.includes(term);
    });
  }, [inventorioProductos, inventorySearch]);

  // Obtener nombre de producto por ID
  const getProductName = useCallback(
    (id: number) => {
      const found = inventorioProductos.find((prod) => Number(prod.id) === id);
      return found?.name ?? `Producto #${id}`;
    },
    [inventorioProductos]
  );

  // Agregar producto al carrito
  const AddProduct = () => {
    if (
      !seleccionarProducto ||
      !selectedProductId ||
      quantity === null ||
      quantity < 1 ||
      stockError
    )
      return;

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

    setQuantity(null);
    setFeedback(null);
  };

  // Registrar venta
  const RegistrarVenta = async () => {
    if (!customerName || !customerPhone || !customerAddress || cartItems.length === 0) {
      setFeedback({
        type: "error",
        message: "Completa los datos del cliente y agrega un producto.",
      });
      return;
    }

    if (!vendedorId) {
      setFeedback({
        type: "error",
        message: vendedorError || "No se pudo identificar al vendedor activo.",
      });
      return;
    }

    setRegistering(true);
    setFeedback(null);
    const totalVenta = totalAmount;
    const cliente = customerName;
    const documentValue = customerDocument.trim();

    try {
      for (const item of cartItems) {
        const product = inventorioProductos.find((prod) => prod.id === item.productId);
        if (!product) {
          throw new Error("Un producto del pedido no existe en el inventario.");
        }
        const numericProductId = Number(product.id);
        if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
          throw new Error("El producto seleccionado no tiene un identificador válido.");
        }
        const price = Number(product.price ?? 0);
        if (!Number.isFinite(price) || price < 0) {
          throw new Error("El producto seleccionado no tiene un precio valido.");
        }

        const payload: Record<string, unknown> = {
          id_producto: numericProductId,
          cantidad: item.quantity,
          precioProducto: price,
          idVendedor: vendedorId,
          estado: "Confirmado",
          nombreCliente: customerName,
          direccionCliente: customerAddress,
          telefonoCliente: customerPhone,
        };
        if (documentValue) {
          payload.documento = documentValue;
        }
        if (customerUserId) {
          payload.idUsuario = customerUserId;
        }

        const res = await fetch("/api/Detallepedido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error ?? "No fue posible registrar la venta.");
        }
      }

      setCartItems([]);
      setQuantity(null);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerDocument("");
      setCustomerAddress("");
      setCustomerUserId(null);
      setDocumentLookupError("");
      setDocumentLookupMessage("");
      setFeedback({
        type: "success",
        message: `Venta registrada para ${cliente}. Total: $${totalVenta.toLocaleString("es-CO")}`,
      });
      await fetchInventoryProducts();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Ocurrió un error inesperado al registrar la venta.",
      });
    } finally {
      setRegistering(false);
    }
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

      const parsed: InventorioProducto[] = rawProducts
        .filter((product) => (product?.estados ?? "Disponible") === "Disponible")
        .map((product) => ({
          id: product?.id?.toString() ?? product?.idproducto?.toString() ?? product?.nombre,
          name: product?.name ?? product?.nombre ?? "Producto sin nombre",
          price: typeof product?.precio === "number" ? product.precio : Number(product?.precio) || 0,
          description: product?.description ?? product?.descripcion ?? "",
          stock: typeof product?.stock === "number" ? product.stock : Number(product?.stock) || 0,
        }));

      setinventorioProductos(parsed);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setInventoryError(
        (error as Error).message || "Ocurrió un error cargando el inventario. Intenta de nuevo."
      );
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  // Cargar inventario al iniciar
  useEffect(() => {
    const controller = new AbortController();
    fetchInventoryProducts(controller.signal);
    return () => controller.abort();
  }, [fetchInventoryProducts]);

  // Obtener ID de vendedor activo
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch("/api/usuarioEstado", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelado) return;
        if (res.ok && json?.user?.idusuario) {
          setVendedorId(Number(json.user.idusuario));
          setVendedorError("");
        } else {
          setVendedorError("No se pudo obtener la informacion del vendedor activo.");
        }
      } catch {
        if (!cancelado) {
          setVendedorError("No se pudo obtener la informacion del vendedor activo.");
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  // Obtener registros de ventas
  const fetchSalesRecords = useCallback(
    async (signal?: AbortSignal) => {
      if (!vendedorId) {
        setSalesError("Debes iniciar sesión como vendedor para ver tus ventas.");
        return;
      }
      try {
        setSalesLoading(true);
        setSalesError("");
        const res = await fetch("/api/Detallepedido", { signal, cache: "no-store" });
        if (!res.ok) {
          throw new Error("No fue posible obtener las ventas.");
        }
        const json = await res.json();
        const data: any[] = Array.isArray(json?.data) ? json.data : [];
        const records: ventas[] = data
          .filter((item) => Number(item.idVendedor ?? item.idvendedor) === vendedorId)
          .map((item) => ({
            id: Number(item.id),
            productoId: Number(item.productoId ?? item.id_producto ?? 0),
            cantidad: Number(item.cantidad ?? 0),
            precioProducto: Number(item.precioProducto ?? item.precioproducto ?? 0),
            subtotal: Number(item.subtotal ?? (item.cantidad ?? 0) * (item.precioProducto ?? 0)),
            fechaPago: typeof item.fechaPago === "string" ? item.fechaPago : null,
            estado: typeof item.estado === "string" ? item.estado : null,
            nombreCliente:
              typeof item.nombreCliente === "string"
                ? item.nombreCliente
                : typeof item.nombre_cliente === "string"
                ? item.nombre_cliente
                : null,
          }));
        setventasRecords(records);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setSalesError((error as Error).message ?? "Error al cargar las ventas.");
      } finally {
        setSalesLoading(false);
      }
    },
    [vendedorId]
  );

  // Reset busqueda al abrir inventario
  useEffect(() => {
    if (showInventoryModal) {
      setInventorySearch("");
    }
  }, [showInventoryModal]);

  useEffect(() => {
    if (!selectedProductId && inventorioProductos.length > 0) {
      setSelectedProductId(inventorioProductos[0].id ?? "");
    }
  }, [inventorioProductos, selectedProductId]);

  // Validar stock al cambiar producto y cantidad
  useEffect(() => {
    if (!seleccionarProducto) {
      setStockError("");
      return;
    }
    const availableStock = seleccionarProducto.stock ?? 0;
    const alreadyAdded = seleccionarProductoCart;
    if (availableStock <= 0) {
      setStockError("Este producto no tiene stock disponible.");
      return;
    }
    const desiredQuantity = quantity ?? 0;
    if (desiredQuantity + alreadyAdded > availableStock) {
      const remaining = Math.max(availableStock - alreadyAdded, 0);
      setStockError(
        remaining > 0
          ? `La cantidad excede el stock disponible. Solo puedes agregar ${remaining} unidad(es) más.`
          : "Ya has utilizado todo el stock disponible en este pedido."
      );
      return;
    }
    setStockError("");
  }, [seleccionarProducto, quantity, seleccionarProductoCart]);

  const handleInventoryButtonClick = () => {
    setShowInventoryModal(true);
    if (!inventorioProductos.length && !inventoryLoading) {
      fetchInventoryProducts();
    }
  };

  const handleSalesButtonClick = () => {
    setShowSalesModal(true);
    if (!ventasRecords.length && !salesLoading) {
      fetchSalesRecords();
    }
  };

  const buscarClientePorDocumento = useCallback(async () => {
    const documento = customerDocument.trim();
    if (!documento) {
      setCustomerUserId(null);
      setDocumentLookupError("");
      setDocumentLookupMessage("");
      return;
    }

    setDocumentLookupLoading(true);
    setDocumentLookupError("");
    setDocumentLookupMessage("");

    const normalize = (value: unknown) => (typeof value === "string" ? value.trim() : "");

    try {
      const usuariosRes = await fetch("/api/usuarios", { cache: "no-store" });
      if (!usuariosRes.ok) {
        throw new Error("No se pudo consultar los usuarios");
      }

      const usuariosJson = await usuariosRes.json().catch(() => ({}));
      const usuarios: any[] = Array.isArray(usuariosJson?.data) ? usuariosJson.data : [];
      const usuario = usuarios.find((item) => normalize(item.documento) === documento);
      if (usuario) {
        const usuarioId = Number(usuario.id ?? usuario.idusuario);
        setCustomerUserId(Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : null);

        const nombreCompleto = [normalize(usuario.nombre), normalize(usuario.apellido)]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (nombreCompleto) {
          setCustomerName((prev) => (prev ? prev : nombreCompleto));
        }

        let detallesCompletados = false;
        if (Number.isInteger(usuarioId) && usuarioId > 0) {
          try {
            const detalleRes = await fetch(`/api/usuarios/${usuarioId}`, { cache: "no-store" });
            if (detalleRes.ok) {
              const detalleJson = await detalleRes.json().catch(() => ({}));
              const detalle = detalleJson?.data;
              if (typeof detalle?.telefono === "string" && detalle.telefono.trim()) {
                setCustomerPhone((prev) => (prev ? prev : detalle.telefono.trim()));
                detallesCompletados = true;
              }
              if (typeof detalle?.direccion === "string" && detalle.direccion.trim()) {
                setCustomerAddress((prev) => (prev ? prev : detalle.direccion.trim()));
                detallesCompletados = true;
              }
            }
          } catch (detError) {
            console.warn("[Vendedor] No fue posible obtener detalles del usuario", detError);
          }
        }

        setDocumentLookupMessage(
          detallesCompletados
            ? "Usuario registrado encontrado."
            : "Cliente registrado encontrado."
        );
        return;
      }

      setCustomerUserId(null);

      try {
        const pedidosRes = await fetch("/api/Detallepedido", { cache: "no-store" });
        if (pedidosRes.ok) {
          const pedidosJson = await pedidosRes.json().catch(() => ({}));
          const pedidos: any[] = Array.isArray(pedidosJson?.data) ? pedidosJson.data : [];
          const pedido = pedidos.find((item) => normalize(item.documento) === documento);
          if (pedido) {
            const nombrePedido = normalize(pedido.nombreCliente ?? pedido.nombre_cliente);
            const telefonoPedido = normalize(pedido.telefonoCliente ?? pedido.telefono_cliente);
            const direccionPedido = normalize(pedido.direccionCliente ?? pedido.direccion_cliente);
            if (nombrePedido) {
              setCustomerName((prev) => (prev ? prev : nombrePedido));
            }
            if (telefonoPedido) {
              setCustomerPhone((prev) => (prev ? prev : telefonoPedido));
            }
            if (direccionPedido) {
              setCustomerAddress((prev) => (prev ? prev : direccionPedido));
            }
            setDocumentLookupMessage(
              "Cliente no registrado en el sistema. Datos recuperados de historial de compras"
            );
            return;
          }
        }
      } catch (pedidoError) {
        console.warn("[Vendedor] No fue posible consultar pedidos para autocompletar", pedidoError);
      }

      setDocumentLookupMessage("Documento no registrado");
    } catch (error) {
      console.error("[Vendedor] Error buscando documento", error);
      setCustomerUserId(null);
      setDocumentLookupError("No se pudo validar el documento. Intenta de nuevo.");
    } finally {
      setDocumentLookupLoading(false);
    }
  }, [customerDocument]);

  return (
    <section className="w-full bg-slate-50 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-2xl bg-white p-8 shadow-lg">
        <header className="space-y-4 border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Registrar nueva venta</h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleInventoryButtonClick}
                className="inline-flex items-center justify-center rounded-full border border-blue-700 px-5 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                Ver inventario
              </button>
              <button
                type="button"
                onClick={handleSalesButtonClick}
                className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                Ver ventas realizadas
              </button>
            </div>
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
                Documento
                <input
                  type="text"
                  value={customerDocument}
                  onChange={(event) => {
                    setCustomerDocument(event.target.value);
                    if (documentLookupError) {
                      setDocumentLookupError("");
                    }
                    if (documentLookupMessage) {
                      setDocumentLookupMessage("");
                    }
                    setCustomerUserId(null);
                  }}
                  onBlur={() => {
                    void buscarClientePorDocumento();
                  }}
                  placeholder="Documento del cliente"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                />
                {documentLookupLoading && (
                  <span className="mt-1 text-xs text-slate-500">Buscando documento…</span>
                )}
                {documentLookupError && (
                  <span className="mt-1 text-xs text-rose-600">{documentLookupError}</span>
                )}
                {!documentLookupError && documentLookupMessage && (
                  <span className="mt-1 text-xs text-emerald-600">
                    {documentLookupMessage}
                  </span>
                )}
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Nombre completo
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Nombre del cliente"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Teléfono
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="#######"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Dirección
                <textarea
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  placeholder="Ciudad y dirección completa"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
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
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                  disabled={inventoryLoading || inventorioProductos.length === 0}
                >
                  {inventorioProductos.length === 0 ? (
                    <option value="">
                      {inventoryLoading ? "Cargando inventario..." : "Sin productos disponibles"}
                    </option>
                  ) : (
                    inventorioProductos.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - $
                        {product.price?.toLocaleString("es-CO") ?? "0"}
                      </option>
                    ))
                  )}
                </select>
                {inventoryError && inventorioProductos.length === 0 && (
                  <span className="mt-1 text-xs text-rose-600">{inventoryError}</span>
                )}
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Cantidad
                <input
                  type="number"
                  min={0}
                  value={quantity ?? ""}
                  onChange={(event) => {
                    const rawValue = event.target.value;
                    if (rawValue === "") {
                      setQuantity(null);
                      return;
                    }
                    const parsed = parseInt(rawValue, 10);
                    setQuantity(Number.isNaN(parsed) ? null : Math.max(parsed, 0));
                  }}
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                />
                {seleccionarProducto && (
                  <span
                    className={`mt-1 text-xs ${
                      stockError ? "text-rose-600" : "text-slate-500"
                    }`}
                  >
                    {stockError
                      ? stockError
                      : `Disponible: ${
                          (seleccionarProducto.stock ?? 0) - seleccionarProductoCart
                        } unidad(es) libres.`}
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={AddProduct}
                disabled={!selectedProductId || !!stockError || inventorioProductos.length === 0}
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
              Aún no has agregado productos.
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
                  {detalleItems.map((item) => (
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
              <p className="font-semibold text-slate-700">Total</p>
              <p className="text-2xl font-bold text-slate-900">${totalAmount.toLocaleString("es-CO")}</p>
            </div>
            <button
              type="button"
              onClick={RegistrarVenta}
              disabled={registering}
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {registering ? "Registrando..." : "Registrar venta"}
            </button>
          </div>

          {vendedorError && (
            <p className="mt-3 text-sm text-rose-600">{vendedorError}</p>
          )}

          {feedback && (
            <p
              className={`mt-3 rounded-lg border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-rose-100 bg-rose-50 text-rose-700"
              }`}
            >
              {feedback.message}
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
                  Consulta el stock actual
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
                  disabled={inventoryLoading || inventorioProductos.length === 0}
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
              ) : inventorioProductos.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  No hay productos disponibles en el inventario.
                </p>
              ) : filtradoInventarioProducts.length === 0 ? (
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
                      {filtradoInventarioProducts.map((product) => (
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

      {showSalesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8 text-slate-700">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Ventas registradas</h3>
               </div>
              <button
                type="button"
                aria-label="Cerrar ventas"
                onClick={() => setShowSalesModal(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {salesLoading ? (
                <p className="text-center text-sm text-slate-500">Cargando ventas...</p>
              ) : salesError ? (
                <div className="mx-auto max-w-md rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <p>{salesError}</p>
                  <button
                    type="button"
                    onClick={() => fetchSalesRecords()}
                    className="mt-2 text-xs font-semibold text-rose-700 underline"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : !vendedorId ? (
                <p className="text-center text-sm text-slate-500">
                  No se pudo determinar el vendedor activo. Intenta nuevamente.
                </p>
              ) : ventasRecords.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  No hay ventas registradas para este vendedor.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-slate-400">
                        <th className="py-2">Producto</th>
                        <th className="py-2">Cliente</th>
                        <th className="py-2 text-right">Cantidad</th>
                        <th className="py-2 text-right">Total</th>
                        <th className="py-2 text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasRecords.map((venta) => {
                        const fecha = venta.fechaPago ? new Date(venta.fechaPago) : null;
                        const total =
                          Number.isFinite(venta.subtotal) && venta.subtotal > 0
                            ? venta.subtotal
                            : venta.cantidad * venta.precioProducto;
                        return (
                          <tr key={venta.id} className="border-t border-slate-100">
                            <td className="py-3 font-semibold text-slate-800">
                              {getProductName(venta.productoId)}
                            </td>
                            <td className="py-3 text-slate-600">{venta.nombreCliente ?? "Sin nombre"}</td>
                            <td className="py-3 text-right font-semibold text-slate-900">{venta.cantidad}</td>
                            <td className="py-3 text-right font-semibold text-slate-900">
                              ${total.toLocaleString("es-CO")}
                            </td>
                            <td className="py-3 text-right text-xs text-slate-500">
                              {fecha ? fecha.toLocaleString("es-CO") : "Sin fecha"}
                            </td>
                          </tr>
                        );
                      })}
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
