import { NextRequest, NextResponse } from "next/server";
import { calcularBonoM, validarTasa } from "@/lib/financial-calculations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { F = 100, tasaCupon, r, N, cantidad } = body;

    // Validaciones
    if (tasaCupon === undefined || !validarTasa(tasaCupon)) {
      return NextResponse.json(
        { error: "Tasa cupón inválida. Debe estar entre 0 y 50%" },
        { status: 400 }
      );
    }

    if (r === undefined || !validarTasa(r)) {
      return NextResponse.json(
        { error: "Tasa de rendimiento inválida. Debe estar entre 0 y 50%" },
        { status: 400 }
      );
    }

    if (![182, 364].includes(N)) {
      return NextResponse.json(
        { error: "Plazo inválido para Bono M. Permitidos: 182, 364 días" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return NextResponse.json(
        { error: "Cantidad debe ser un entero positivo" },
        { status: 400 }
      );
    }

    // Calcular
    const resultado = calcularBonoM({
      F,
      tasaCupon,
      r,
      N,
      cantidad,
    });

    return NextResponse.json(
      {
        success: true,
        data: resultado,
        input: { F, tasaCupon, r, N, cantidad },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en cálculo Bono M:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
