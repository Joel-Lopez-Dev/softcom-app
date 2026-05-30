import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");

    let sql = `
      SELECT 
        i.id_instrumento, i.tipo, i.serie, i.valor_nominal,
        i.tasa, i.fecha_vencimiento, i.emisor, i.riesgo_credito,
        i.protegido_inflacion, i.created_at
      FROM instrumento i
    `;

    const values: any[] = [];

    if (tipo) {
      sql += ` WHERE i.tipo = $1`;
      values.push(tipo);
    }

    sql += ` ORDER BY i.fecha_vencimiento ASC`;

    const result = await query<any>(sql, values);

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        total: result.rowCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo instrumentos:", error);
    return NextResponse.json(
      { error: "Error obteniendo instrumentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      tipo,
      serie,
      valor_nominal,
      tasa,
      fecha_vencimiento,
      emisor,
      riesgo_credito,
      protegido_inflacion,
    } = await request.json();

    // Validaciones
    if (!["cete", "bono_m", "bono", "udibono", "derivado", "accion"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de instrumento inválido" },
        { status: 400 }
      );
    }

    if (!serie || serie.trim().length === 0) {
      return NextResponse.json(
        { error: "Serie es requerida" },
        { status: 400 }
      );
    }

    if (!valor_nominal || valor_nominal <= 0) {
      return NextResponse.json(
        { error: "Valor nominal debe ser positivo" },
        { status: 400 }
      );
    }

    if (!fecha_vencimiento) {
      return NextResponse.json(
        { error: "Fecha de vencimiento es requerida" },
        { status: 400 }
      );
    }

    if (!emisor || emisor.trim().length === 0) {
      return NextResponse.json(
        { error: "Emisor es requerido" },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `INSERT INTO instrumento 
       (tipo, serie, valor_nominal, tasa, fecha_vencimiento, emisor, riesgo_credito, protegido_inflacion, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
       RETURNING *`,
      [
        tipo,
        serie,
        valor_nominal,
        tasa || null,
        fecha_vencimiento,
        emisor,
        riesgo_credito || null,
        protegido_inflacion || false,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Error al crear instrumento" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Instrumento creado",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando instrumento:", error);
    return NextResponse.json(
      { error: "Error creando instrumento" },
      { status: 500 }
    );
  }
}
