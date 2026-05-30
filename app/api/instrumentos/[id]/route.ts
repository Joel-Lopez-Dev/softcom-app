import { query } from "@/lib/db";

type Instrumento = {
  id_instrumento: number;
  tipo: string;
  ticker: string;
  valor_nominal: number;
  rendimiento_esperado: number;
  vencimiento: string;
  created_at: string;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query<Instrumento>(
      `SELECT * FROM instrumento WHERE id_instrumento = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, error: "Instrumento no encontrado" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("Error obteniendo instrumento:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tipo, ticker, valor_nominal, rendimiento_esperado, vencimiento } = body;

    // Validaciones
    if (tipo && !["cete", "bono_m", "udibono", "accion", "derivado"].includes(tipo)) {
      return Response.json(
        { success: false, error: "Tipo de instrumento inválido" },
        { status: 400 }
      );
    }

    if (valor_nominal !== undefined && valor_nominal <= 0) {
      return Response.json(
        { success: false, error: "Valor nominal debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (rendimiento_esperado !== undefined && rendimiento_esperado < 0) {
      return Response.json(
        { success: false, error: "Rendimiento no puede ser negativo" },
        { status: 400 }
      );
    }

    // Construir query dinámico
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (tipo) {
      updates.push(`tipo = $${paramCount++}`);
      values.push(tipo);
    }
    if (ticker) {
      updates.push(`ticker = $${paramCount++}`);
      values.push(ticker);
    }
    if (valor_nominal !== undefined) {
      updates.push(`valor_nominal = $${paramCount++}`);
      values.push(valor_nominal);
    }
    if (rendimiento_esperado !== undefined) {
      updates.push(`rendimiento_esperado = $${paramCount++}`);
      values.push(rendimiento_esperado);
    }
    if (vencimiento) {
      updates.push(`vencimiento = $${paramCount++}`);
      values.push(new Date(vencimiento).toISOString());
    }

    if (updates.length === 0) {
      return Response.json(
        { success: false, error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    values.push(id);
    const sql = `UPDATE instrumento SET ${updates.join(", ")} WHERE id_instrumento = $${paramCount} RETURNING *`;

    const result = await query<Instrumento>(sql, values);

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, error: "Instrumento no encontrado" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("Error actualizando instrumento:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query<Instrumento>(
      `DELETE FROM instrumento WHERE id_instrumento = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, error: "Instrumento no encontrado" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("Error eliminando instrumento:", err);

    if (err.code === "23503") {
      return Response.json(
        {
          success: false,
          error: "No se puede eliminar: el instrumento tiene asociaciones",
        },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
