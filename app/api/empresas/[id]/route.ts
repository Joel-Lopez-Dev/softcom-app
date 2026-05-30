import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID de empresa inválido" },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `SELECT * FROM empresa WHERE id_empresa = $1`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo empresa:", error);
    return NextResponse.json(
      { error: "Error obteniendo empresa" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { nombre, rfc, direccion, telefono, correo } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID de empresa inválido" },
        { status: 400 }
      );
    }

    // Validaciones
    if (nombre !== undefined && nombre.trim().length < 3) {
      return NextResponse.json(
        { error: "Nombre debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (rfc !== undefined && rfc.length !== 13) {
      return NextResponse.json(
        { error: "RFC debe tener 13 caracteres" },
        { status: 400 }
      );
    }

    if (correo !== undefined && correo && !correo.includes("@")) {
      return NextResponse.json(
        { error: "Correo inválido" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [Number(id)];
    let paramIndex = 2;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramIndex}`);
      values.push(nombre);
      paramIndex++;
    }

    if (rfc !== undefined) {
      updates.push(`rfc = $${paramIndex}`);
      values.push(rfc || null);
      paramIndex++;
    }

    if (direccion !== undefined) {
      updates.push(`direccion = $${paramIndex}`);
      values.push(direccion || null);
      paramIndex++;
    }

    if (telefono !== undefined) {
      updates.push(`telefono = $${paramIndex}`);
      values.push(telefono || null);
      paramIndex++;
    }

    if (correo !== undefined) {
      updates.push(`correo = $${paramIndex}`);
      values.push(correo || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `UPDATE empresa SET ${updates.join(", ")} WHERE id_empresa = $1
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Empresa actualizada",
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error actualizando empresa:", error);
    return NextResponse.json(
      { error: "Error actualizando empresa" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID de empresa inválido" },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `DELETE FROM empresa WHERE id_empresa = $1
       RETURNING id_empresa, nombre, rfc`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Empresa eliminada",
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error eliminando empresa:", error);

    // Foreign key constraint
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "No se puede eliminar: la empresa tiene datos asociados" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error eliminando empresa" },
      { status: 500 }
    );
  }
}
