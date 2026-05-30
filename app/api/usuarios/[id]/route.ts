import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import * as bcrypt from "bcrypt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `SELECT 
        u.id_usuario, u.nombre, u.correo, u.id_rol, 
        r.nombre_rol, u.created_at, u.updated_at
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
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
    console.error("Error obteniendo usuario:", error);
    return NextResponse.json(
      { error: "Error obteniendo usuario" },
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
    const { nombre, correo, password, id_rol } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // Validaciones
    if (nombre !== undefined) {
      if (nombre.trim().length < 2) {
        return NextResponse.json(
          { error: "Nombre debe tener al menos 2 caracteres" },
          { status: 400 }
        );
      }
    }

    if (correo !== undefined) {
      if (!correo.includes("@")) {
        return NextResponse.json(
          { error: "Correo inválido" },
          { status: 400 }
        );
      }
    }

    if (id_rol !== undefined) {
      if (![1, 2, 3].includes(id_rol)) {
        return NextResponse.json(
          { error: "Rol inválido" },
          { status: 400 }
        );
      }
    }

    // Construir UPDATE dinámico
    const updates: string[] = [];
    const values: any[] = [Number(id)];
    let paramIndex = 2;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramIndex}`);
      values.push(nombre);
      paramIndex++;
    }

    if (correo !== undefined) {
      updates.push(`correo = $${paramIndex}`);
      values.push(correo);
      paramIndex++;
    }

    if (password !== undefined && password.length >= 6) {
      const passwordHash = await bcrypt.hash(password, 12);
      updates.push(`password_hash = $${paramIndex}`);
      values.push(passwordHash);
      paramIndex++;
    }

    if (id_rol !== undefined) {
      updates.push(`id_rol = $${paramIndex}`);
      values.push(id_rol);
      paramIndex++;
    }

    updates.push(`updated_at = now()`);

    const result = await query<any>(
      `UPDATE usuario SET ${updates.join(", ")} WHERE id_usuario = $1
       RETURNING id_usuario, nombre, correo, id_rol, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario actualizado",
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error actualizando usuario:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error actualizando usuario" },
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
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `DELETE FROM usuario WHERE id_usuario = $1
       RETURNING id_usuario, nombre, correo`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario eliminado",
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return NextResponse.json(
      { error: "Error eliminando usuario" },
      { status: 500 }
    );
  }
}
