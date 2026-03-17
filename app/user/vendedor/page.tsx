"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export default function Page() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerDocument, setCustomerDocument] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"Domicilio" | "Retiro_tienda">("Domicilio");
  const [paymentType, setPaymentType] = useState("");
  const [customerUserId, setCustomerUserId] = useState<number | null>(null);
  const [documentLookupLoading, setDocumentLookupLoading] = useState(false);
  const [documentLookupError, setDocumentLookupError] = useState("");
  const [documentLookupMessage, setDocumentLookupMessage] = useState("");
  const [customerHasDocument, setCustomerHasDocument] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventorioProductos, setinventorioProductos] = useState<InventorioProducto[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [stockError, setStockError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [vendedorId, setVendedorId] = useState<number | null>(null);
  const [vendedorError, setVendedorError] = useState("");
  const productSearchRef = useRef<HTMLDivElement | null>(null);
  const productInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleDocumentModeChange = useCallback(
    (hasDocument: boolean) => {
      setCustomerHasDocument(hasDocument);
      if (!hasDocument) {
        setCustomerDocument("");
        setCustomerUserId(null);
        setCustomerCity("");
        setDocumentLookupError("");
        setDocumentLookupMessage("");
      }
    }, []);

  const formatProductLabel = useCallback((product: InventorioProducto) => {
    const price = product.price ?? 0;
    return `${product.name} - $${price.toLocaleString("es-CO")}`;
  }, []);

  const selectedProductLabel = useMemo(() => {
    return seleccionarProducto ? formatProductLabel(seleccionarProducto) : "";
  }, [seleccionarProducto, formatProductLabel]);

  const { productSearchResults, productSearchHasMore } = useMemo(() => {
    if (!inventorioProductos.length) {
      return { productSearchResults: [] as InventorioProducto[], productSearchHasMore: false };
    }
    const term = productSearchTerm.trim().toLowerCase();
    const filtered = term
      ? inventorioProductos.filter((product) => {
        const name = (product.name ?? "").toLowerCase();
        const description = (product.description ?? "").toLowerCase();
        return name.includes(term) || description.includes(term);
      }) : inventorioProductos;
    const limited = filtered.slice(0, 8);
    return {
      productSearchResults: limited,
      productSearchHasMore: filtered.length > limited.length,
    };
  }, [inventorioProductos, productSearchTerm]);

  const handleProductSelection = useCallback(
    (product: InventorioProducto) => {
      if (!product?.id) {
        return;
      }
      setSelectedProductId(product.id);
      setProductSearchTerm("");
      setShowProductSuggestions(false);
      setStockError("");
      setQuantity(null);
    }, []);

  const clearProductSelection = useCallback(() => {
    setSelectedProductId("");
    setProductSearchTerm("");
    setShowProductSuggestions(false);
    setStockError("");
    setQuantity(null);
  }, []);

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

  const ajustarStockProducto = useCallback(
    async (
      productoId: number,
      cantidad: number,
      operacion: "disminuir" | "incrementar" = "disminuir"
    ) => {
      const response = await fetch(`/api/productos/${productoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "ajustar_stock",
          cantidad,
          operacion,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error ?? "No fue posible actualizar el stock del producto."
        );
      }
      return data?.data;
    }, []);

  // Registrar venta
  const RegistrarVenta = async () => {
    if (!customerName || !customerPhone || !customerCity || !customerAddress || cartItems.length === 0) {
      setFeedback({
        type: "error",
        message: "Completa nombre, telefono, ciudad, direccion y agrega un producto.",
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
    const customerNameValue = customerName.trim();
    const customerPhoneValue = customerPhone.trim();
    const customerCityValue = customerCity.trim();
    const customerAddressValue = customerAddress.trim();
    const paymentTypeValue = paymentType.trim();
    const cliente = customerNameValue;
    const detallesRegistrados: Array<{ productId: number; quantity: number }> = [];

    try {
      const estadoPedido = paymentTypeValue === "efectivo" ? "Entregado" : "Pendiente";
      const paymentTypeLabelMap: Record<string, string> = {
        efectivo: "Efectivo",
        transferencia: "Transferencia",
        tarjeta: "Tarjeta",
        contraentrega: "Contraentrega",
      };
      const paymentTypeLabel = paymentTypeValue ? paymentTypeLabelMap[paymentTypeValue] ?? paymentTypeValue : null;

      const pedidoPayload: Record<string, unknown> = {
        subtotal: Number(totalVenta),
        costoEnvio: 0,
        tipoEntrega: deliveryType,
        estadoPedido,
      };

      if (Number.isInteger(customerUserId) && customerUserId !== null && customerUserId > 0) {
        pedidoPayload.idCliente = Number(customerUserId);
      }

      const pedidoRes = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoPayload),
      });
      const pedidoData = await pedidoRes.json().catch(() => ({}));
      if (!pedidoRes.ok || !pedidoData?.ok) {
        throw new Error(pedidoData?.error ?? "No fue posible crear el pedido.");
      }

      const pedidoId = Number(pedidoData?.data?.idPedido);
      if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
        throw new Error("La API de pedidos no devolvio un id_pedido valido.");
      }

      for (const item of cartItems) {
        const product = inventorioProductos.find((prod) => prod.id === item.productId);
        if (!product) {
          throw new Error("Un producto del pedido no existe en el inventario.");
        }
        const numericProductId = Number(product.id);
        if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
          throw new Error("El producto seleccionado no tiene un identificador valido.");
        }
        const cantidad = Number(item.quantity);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
          throw new Error("La cantidad del producto no es valida.");
        }
        const price = Number(product.price ?? 0);
        if (!Number.isFinite(price) || price < 0) {
          throw new Error("El producto seleccionado no tiene un precio valido.");
        }

        const detallePayload: Record<string, unknown> = {
          idPedido: Number(pedidoId),
          idProducto: Number(numericProductId),
          cantidad: Number(cantidad),
          precioUnitario: Number(price),
        };

        let stockReducido = false;
        try {
          await ajustarStockProducto(numericProductId, cantidad, "disminuir");
          stockReducido = true;
          const res = await fetch("/api/detalle_pedido", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(detallePayload),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            throw new Error(data?.error ?? "No fue posible registrar el detalle del pedido.");
          }
          detallesRegistrados.push({ productId: numericProductId, quantity: cantidad });
        } catch (detalleError) {
          if (stockReducido) {
            await ajustarStockProducto(numericProductId, cantidad, "incrementar").catch(
              (rollbackError) => {
                console.error(
                  "[Vendedor] No fue posible revertir el stock tras una falla al registrar detalle_pedido",
                  rollbackError
                );
              }
            );
          }
          throw detalleError instanceof Error
            ? detalleError
            : new Error("No fue posible completar el registro del detalle del pedido.");
        }
      }

      const entregaPayload: Record<string, unknown> = {
        idPedido: Number(pedidoId),
        ciudad: customerCityValue,
        direccionEntrega: customerAddressValue,
        telefonoContacto: customerPhoneValue,
        nombreRecibe: customerNameValue,
        costoEnvio: 0,
        estadoEntrega: "Pendiente",
        observacion: paymentTypeLabel,
      };

      const entregaRes = await fetch("/api/entrega", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entregaPayload),
      });
      const entregaData = await entregaRes.json().catch(() => ({}));
      if (!entregaRes.ok || !entregaData?.ok) {
        throw new Error(entregaData?.error ?? "No fue posible crear la entrega.");
      }

      setCartItems([]);
      setQuantity(null);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerCity("");
      setCustomerDocument("");
      setCustomerAddress("");
      setPaymentType("");
      setCustomerUserId(null);
      setDocumentLookupError("");
      setDocumentLookupMessage("");
      setFeedback({
        type: "success",
        message: `Pedido #${pedidoId} registrado para ${cliente}. Total: $${totalVenta.toLocaleString("es-CO")}`,
      });
      await fetchInventoryProducts();
    } catch (error) {
      for (const detalle of detallesRegistrados) {
        await ajustarStockProducto(detalle.productId, detalle.quantity, "incrementar").catch(
          (rollbackError) => {
            console.error(
              "[Vendedor] No fue posible revertir el stock tras un fallo posterior al registro",
              rollbackError
            );
          }
        );
      }
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Error inesperado al registrar la venta.",
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
        (error as Error).message || "Error cargando el inventario. Intenta de nuevo."
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inventoryLoading) {
      setShowProductSuggestions(false);
    }
  }, [inventoryLoading]);

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

  
  // Reset busqueda al abrir inventario
  useEffect(() => {
    if (showInventoryModal) {
      setInventorySearch("");
    }
  }, [showInventoryModal]);

  useEffect(() => {
    if (!selectedProductId) {
      return;
    }
    const exists = inventorioProductos.some((product) => product.id === selectedProductId);
    if (!exists) {
      setSelectedProductId("");
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
          ? `La cantidad excede el stock disponible. Solo puedes agregar ${remaining} unidad(es) mas.`
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
  
  const buscarClientePorDocumento = useCallback(async () => { if (!customerHasDocument) { return;}
  
    const documento = customerDocument.trim();
    if (!documento) {
      setCustomerUserId(null);
      setCustomerCity("");
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
              if (typeof detalle?.ciudad === "string" && detalle.ciudad.trim()) {
                setCustomerCity((prev) => (prev ? prev : detalle.ciudad.trim()));
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
  }, [customerDocument, customerHasDocument]);
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
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
                  <input
                    type="radio"
                    name="document-mode"
                    className="h-4 w-4 accent-emerald-600"
                    checked={customerHasDocument}
                    onChange={() => handleDocumentModeChange(true)}
                  />
                  Con documento
                </label>
                <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
                  <input
                    type="radio"
                    name="document-mode"
                    className="h-4 w-4 accent-emerald-600"
                    checked={!customerHasDocument}
                    onChange={() => handleDocumentModeChange(false)}
                  />
                  Venta rapida
                </label>
              </div>
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
                    if (customerHasDocument) {
                      void buscarClientePorDocumento();
                    }
                  }}
                  placeholder={
                    customerHasDocument ? "Documento" : "Documento no requerido"
                  }
                  disabled={!customerHasDocument}
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                {customerHasDocument ? (
                  <>
                    {documentLookupLoading && (
                      <span className="mt-1 text-xs text-slate-500">Buscando documento...</span>
                    )}
                    {documentLookupError && (
                      <span className="mt-1 text-xs text-rose-600">{documentLookupError}</span>
                    )}
                    {!documentLookupError && documentLookupMessage && (
                      <span className="mt-1 text-xs text-emerald-600">
                        {documentLookupMessage}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="mt-1 text-xs text-slate-500">
                    Registraremos esta venta
                  </span>
                )}
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Nombre completo
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Nombre"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Telefono
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="#######"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Ciudad
                <input
                  type="text"
                  value={customerCity}
                  onChange={(event) => setCustomerCity(event.target.value)}
                  placeholder="Ciudad"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-600">
                Dirección
                <textarea
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  placeholder="Direccion"
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Agregar productos</h2>
            <div className="space-y-4">
              <label className="flex flex-col text-sm font-medium text-slate-600">
                Busca y selecciona un producto
                <div ref={productSearchRef} className="relative mt-1">
                  <input
                    type="text"
                    ref={productInputRef}
                    value={productSearchTerm}
                    onChange={(event) => {
                      const value = event.target.value;
                      setProductSearchTerm(value);
                      setShowProductSuggestions(true);
                      if (selectedProductId) {
                        setSelectedProductId("");
                      }
                    }}
                    onFocus={() => {
                      if (!inventoryLoading && inventorioProductos.length > 0) {
                        setShowProductSuggestions(true);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && productSearchResults.length > 0) {
                        event.preventDefault();
                        handleProductSelection(productSearchResults[0]);
                      }
                      if (event.key === "Escape") {
                        setShowProductSuggestions(false);
                      }
                    }}
                    placeholder={
                      inventoryLoading
                        ? "Cargando inventario..."
                        : inventorioProductos.length === 0
                          ? "Sin productos disponibles"
                          : ""
                    }
                    disabled={inventoryLoading || inventorioProductos.length === 0}
                    className="w-full rounded-lg border border-slate-200 px-3 pr-10 py-2 text-base text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                  {!productSearchTerm && (
                    <span className="pointer-events-none absolute inset-y-0 left-3 right-10 flex items-center truncate text-sm text-slate-500">
                      {selectedProductId && selectedProductLabel
                        ? selectedProductLabel
                        : "Buscar"}
                    </span>
                  )}

                  {(productSearchTerm || selectedProductId) && (
                    <button
                      type="button"
                      aria-label="Limpiar selección o búsqueda"
                      onClick={() => {
                        clearProductSelection();
                        if (!inventoryLoading && inventorioProductos.length > 0) {
                          setShowProductSuggestions(true);
                        }
                        productInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-500 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    >
                      x
                    </button>
                  )}

                  {showProductSuggestions && inventorioProductos.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      {inventoryLoading ? (
                        <p className="px-4 py-3 text-sm text-slate-500">Cargando inventario...</p>
                      ) : productSearchResults.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-slate-500">
                          No se encontraron productos para esa búsqueda.
                        </p>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {productSearchResults.map((product) => {
                            const isActive = product.id === selectedProductId;
                            return (
                              <li key={product.id ?? product.name}>
                                <button
                                  type="button"
                                  onClick={() => handleProductSelection(product)}
                                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition ${isActive ? "bg-slate-50" : "hover:bg-slate-50"
                                    }`}
                                >
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-800">
                                      {product.name}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                      Disponible: {product.stock ?? 0} - {" "}
                                      {product.description?.trim() || "Sin descripción"}
                                    </p>
                                  </div>
                                  <span className="text-sm font-bold text-slate-900">
                                    {"$" + (product.price ?? 0).toLocaleString("es-CO")}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                          {productSearchHasMore && (
                            <li className="px-4 py-2 text-center text-[11px] uppercase tracking-wide text-slate-400">
                              Resultados limitados
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {inventoryError && inventorioProductos.length === 0 ? (
                  <span className="mt-1 text-xs text-rose-600">{inventoryError}</span>
                ) : inventorioProductos.length > 0 ? (
                  <span className="mt-1 text-xs text-slate-500">
                    Seguir escribiendo para cambiar el producto seleccionado.
                  </span>
                ) : null}
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
                    className={`mt-1 text-xs ${stockError ? "text-rose-600" : "text-slate-500"
                      }`}
                  >
                    {stockError
                      ? stockError
                      : `Disponible: ${(seleccionarProducto.stock ?? 0) - seleccionarProductoCart
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-400">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.9fr]">
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div> <h3 className="mt-1 text-base font-semibold text-slate-800"> Despacho del pedido  </h3></div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="group cursor-pointer rounded-2xl border border-sky-200 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:bg-sky-100/70">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="tipoEntregaPreview"
                          checked={deliveryType === "Domicilio"}
                          onChange={() => setDeliveryType("Domicilio")}
                          className="mt-1 h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <div>
                          <p className="font-semibold text-sky-900">Domicilio</p>
                        
                        </div>
                      </div>
                    </label>

                    <label className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/60">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="tipoEntregaPreview"
                          checked={deliveryType === "Retiro_tienda"}
                          onChange={() => setDeliveryType("Retiro_tienda")}
                          className="mt-1 h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">Retiro en tienda</p>
                        
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col text-sm font-medium text-slate-600">
                    Domiciliario
                    <select
                      defaultValue=""
                      className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="" disabled>
                        Selecciona un domiciliario
                      </option>
                      <option value="dom-1">Domiciliario 1</option>
                      <option value="dom-2">Domiciliario 2</option>
                    </select>

                  </label>

                    <label className="flex flex-col text-sm font-medium text-slate-600">
                      Tipo de pago
                      <select
                        value={paymentType}
                        onChange={(event) => setPaymentType(event.target.value)}
                        className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      >
                      <option value="" disabled>
                        Selecciona un tipo de pago
                      </option>
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="contraentrega">Contraentrega</option>
                      <option value="otro">PSE</option>
                    </select>

                  </label>
                </div>
              </div>

              <div className="flex h-full flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Confirmación de compra
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-slate-500">Subtotal productos</span>
                      <span className="font-semibold text-slate-800">
                        ${totalAmount.toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 px-4 py-3 text-slate-400">
                      <span>Costo envio</span>
                    
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <div>
                    <p className="font-semibold text-slate-700">Total</p>
                    <p className="text-3xl font-bold tracking-tight text-slate-950">
                      ${totalAmount.toLocaleString("es-CO")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={RegistrarVenta}
                    disabled={registering}
                    className="mt-4 w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {registering ? "Registrando..." : "Registrar venta"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {vendedorError && (
            <p className="mt-3 text-sm text-rose-600">{vendedorError}</p>
          )}

          {feedback && (
            <p
              className={`mt-3 rounded-lg border px-4 py-3 text-sm ${feedback.type === "success"
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
                X
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
      
    </section>
  );
}
