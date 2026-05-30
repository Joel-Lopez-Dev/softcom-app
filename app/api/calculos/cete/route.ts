import { NextRequest, NextResponse } from "next/server";
import { calcularCETE, validarDiasCETE, validarTasa, validarCantidad } from "@/lib/financial-calculations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { F = 10, r, N, cantidad } = body;

    // Validaciones
    if (r === undefined || !validarTasa(r)) {
      return NextResponse.json(
        { error: "Tasa inválida. Debe estar entre 0 y 50%" },
        { status: 400 }
      );
    }

    if (!validarDiasCETE(N)) {
      return NextResponse.json(
        { error: "Plazo inválido. Permitidos: 28, 91, 182, 364 días" },
        { status: 400 }
      );
    }

    if (!validarCantidad(cantidad)) {
      return NextResponse.json(
        { error: "Cantidad debe ser un entero positivo" },
        { status: 400 }
      );
    }

    // Calcular
    const resultado = calcularCETE({
      F,
      r,
      N,
      cantidad,
    });

    return NextResponse.json(
      {
        success: true,
        data: resultado,
        input: { F, r, N, cantidad },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en cálculo CETE:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
