import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query<any>(
      `SELECT * FROM empresa ORDER BY created_at DESC`
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        total: result.rowCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo empresas:", error);
    return NextResponse.json(
      { error: "Error obteniendo empresas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre, rfc, direccion, telefono, correo } = await request.json();

    // Validaciones
    if (!nombre || nombre.trim().length < 3) {
      return NextResponse.json(
        { error: "Nombre debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (rfc && rfc.length !== 13) {
      return NextResponse.json(
        { error: "RFC debe tener 13 caracteres" },
        { status: 400 }
      );
    }

    if (correo && !correo.includes("@")) {
      return NextResponse.json(
        { error: "Correo inválido" },
        { status: 400 }
      );
    }

    // Crear empresa
    const result = await query<any>(
      `INSERT INTO empresa (nombre, rfc, direccion, telefono, correo, created_at)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING id_empresa, nombre, rfc, direccion, telefono, correo, created_at`,
      [nombre, rfc || null, direccion || null, telefono || null, correo || null]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Error al crear empresa" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Empresa creada exitosamente",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando empresa:", error);
    return NextResponse.json(
      { error: "Error creando empresa" },
      { status: 500 }
    );
  }
}
