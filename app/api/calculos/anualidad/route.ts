import { NextRequest, NextResponse } from "next/server";
import { calcularAnualidad, validarTasa } from "@/lib/financial-calculations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, A, i, n, d } = body;

    // Validaciones
    if (!["ordinaria", "anticipada", "diferida"].includes(tipo)) {
      return NextResponse.json(
        {
          error: "Tipo inválido. Permitidos: 'ordinaria', 'anticipada', 'diferida'",
        },
        { status: 400 }
      );
    }

    if (!A || A <= 0) {
      return NextResponse.json(
        { error: "Importe (A) debe ser un valor positivo" },
        { status: 400 }
      );
    }

    if (i === undefined || !validarTasa(i)) {
      return NextResponse.json(
        { error: "Tasa de interés inválida. Debe estar entre 0 y 50%" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(n) || n <= 0) {
      return NextResponse.json(
        { error: "Número de períodos (n) debe ser un entero positivo" },
        { status: 400 }
      );
    }

    if (tipo === "diferida") {
      if (!Number.isInteger(d) || (d && d < 0)) {
        return NextResponse.json(
          {
            error: "Períodos de diferimiento (d) debe ser un entero no negativo",
          },
          { status: 400 }
        );
      }
    }

    // Calcular
    const resultado = calcularAnualidad({
      tipo,
      A,
      i,
      n,
      d,
    });

    return NextResponse.json(
      {
        success: true,
        data: resultado,
        input: { tipo, A, i, n, d },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en cálculo de anualidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
