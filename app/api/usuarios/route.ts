import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import * as bcrypt from "bcrypt";

export async function GET() {
  try {
    const result = await query<any>(
      `SELECT 
        u.id_usuario, u.nombre, u.correo, u.id_rol, 
        r.nombre_rol, u.created_at, u.updated_at
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      ORDER BY u.created_at DESC`
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
    console.error("Error obteniendo usuarios:", error);
    return NextResponse.json(
      { error: "Error obteniendo usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre, correo, password, id_rol } = await request.json();

    // Validaciones
    if (!nombre || nombre.trim().length < 2) {
      return NextResponse.json(
        { error: "Nombre debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    if (!correo || !correo.includes("@")) {
      return NextResponse.json(
        { error: "Correo inválido" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(id_rol)) {
      return NextResponse.json(
        { error: "Rol inválido (debe ser 1, 2 o 3)" },
        { status: 400 }
      );
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario
    const result = await query<any>(
      `INSERT INTO usuario (nombre, correo, password_hash, id_rol, created_at, updated_at)
       VALUES ($1, $2, $3, $4, now(), now())
       RETURNING id_usuario, nombre, correo, id_rol, created_at`,
      [nombre, correo, passwordHash, id_rol]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Error al crear usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado exitosamente",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creando usuario:", error);

    // Validar errores de BD
    if (error.code === "23505") {
      // Unique violation
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error creando usuario" },
      { status: 500 }
    );
  }
}
