export interface GoogleFormsData {
  pedidoId: string;
  nombreProducto: string;
  sku: string;
  precio: string;
  cotizacionDolar: string;
  nombreVendedor: string;
}

export interface GoogleFormsResult {
  enviado: boolean;
  error?: string;
}

/**
 * Envía los datos del pedido a un Google Form configurado por variables de entorno.
 *
 * Variables de entorno necesarias:
 *   GOOGLE_FORM_URL              → URL de formResponse (obligatoria para que funcione)
 *   GOOGLE_FORM_ENTRY_PEDIDO     → entry ID del campo pedidoId
 *   GOOGLE_FORM_ENTRY_PRODUCTO   → entry ID del campo nombreProducto
 *   GOOGLE_FORM_ENTRY_SKU        → entry ID del campo sku
 *   GOOGLE_FORM_ENTRY_PRECIO     → entry ID del campo precio
 *   GOOGLE_FORM_ENTRY_COTIZACION → entry ID del campo cotizacionDolar
 *   GOOGLE_FORM_ENTRY_VENDEDOR   → entry ID del campo nombreVendedor
 */
export async function enviarAGoogleForms(data: GoogleFormsData): Promise<GoogleFormsResult> {
  const formUrl = process.env.GOOGLE_FORM_URL;

  if (!formUrl) {
    return { enviado: false, error: 'GOOGLE_FORM_URL no configurada' };
  }

  const entries: Record<string, string> = {};

  const campos: [string | undefined, string][] = [
    [process.env.GOOGLE_FORM_ENTRY_PEDIDO, data.pedidoId],
    [process.env.GOOGLE_FORM_ENTRY_PRODUCTO, data.nombreProducto],
    [process.env.GOOGLE_FORM_ENTRY_SKU, data.sku],
    [process.env.GOOGLE_FORM_ENTRY_PRECIO, data.precio],
    [process.env.GOOGLE_FORM_ENTRY_COTIZACION, data.cotizacionDolar],
    [process.env.GOOGLE_FORM_ENTRY_VENDEDOR, data.nombreVendedor],
  ];

  for (const [entryId, valor] of campos) {
    if (entryId) entries[entryId] = valor;
  }

  try {
    await fetch(formUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(entries).toString(),
      redirect: 'follow',
    });
    return { enviado: true };
  } catch (err) {
    return {
      enviado: false,
      error: err instanceof Error ? err.message : 'Error desconocido al enviar el formulario',
    };
  }
}
