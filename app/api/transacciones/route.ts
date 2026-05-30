import { query } from "@/lib/db";

type Transaccion = {
  id_transaccion: number;
  id_portafolio: number;
  id_instrumento: number;
  tipo_operacion: string;
  cantidad: number;
  precio_sucio: number | null;
  monto_total: number;
  fecha: string;
  created_at: string;
  serie?: string;
  instrumento_tipo?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const portafolioId = searchParams.get("portafolio_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    let sql = `
      SELECT 
        t.id_transaccion,
        t.id_portafolio,
        t.id_instrumento,
        t.tipo_operacion,
        t.cantidad,
        t.precio_sucio,
        t.monto_total,
        t.fecha,
        t.created_at,
        i.serie,
        i.tipo as instrumento_tipo
      FROM transaccion t
      LEFT JOIN instrumento i ON t.id_instrumento = i.id_instrumento
    `;

    const values: any[] = [];

    if (portafolioId) {
      sql += ` WHERE t.id_portafolio = $1`;
      values.push(portafolioId);
    }

    sql += ` ORDER BY t.created_at DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const result = await query<any>(sql, values);

    return Response.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error("Error obteniendo transacciones:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id_portafolio,
      id_instrumento,
      tipo_operacion,
      cantidad,
      precio_sucio,
      monto_total,
    } = body;

    // Validaciones
    if (!id_portafolio || !id_instrumento || !tipo_operacion) {
      return Response.json(
        { success: false, error: "Campos requeridos faltantes" },
        { status: 400 }
      );
    }

    if (!["compra", "venta"].includes(tipo_operacion)) {
      return Response.json(
        { success: false, error: "Tipo de operación inválido" },
        { status: 400 }
      );
    }

    if (cantidad <= 0 || !monto_total || monto_total <= 0) {
      return Response.json(
        { success: false, error: "Cantidad y monto_total deben ser mayores a 0" },
        { status: 400 }
      );
    }

    const result = await query<Transaccion>(
      `INSERT INTO transaccion 
        (id_portafolio, id_instrumento, tipo_operacion, cantidad, precio_sucio, monto_total)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_portafolio, id_instrumento, tipo_operacion, cantidad, precio_sucio || null, monto_total]
    );

    return Response.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("Error creando transacción:", err);

    if (err.code === "23503") {
      return Response.json(
        { success: false, error: "Portafolio o instrumento no encontrado" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
