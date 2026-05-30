import { NextRequest, NextResponse } from "next/server";
import {
  calcularPrecioSucio,
} from "@/lib/financial-calculations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      precioLimpio,
      diasDesdeUltimoCupon,
      diasPeriodoCupon,
      montoCupon,
    } = body;

    // Validaciones
    if (!precioLimpio || precioLimpio <= 0) {
      return NextResponse.json(
        { error: "Precio limpio debe ser un valor positivo" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(diasDesdeUltimoCupon) || diasDesdeUltimoCupon < 0) {
      return NextResponse.json(
        { error: "Días desde último cupón debe ser un entero no negativo" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(diasPeriodoCupon) || diasPeriodoCupon <= 0) {
      return NextResponse.json(
        { error: "Días del período de cupón debe ser un entero positivo" },
        { status: 400 }
      );
    }

    if (diasDesdeUltimoCupon > diasPeriodoCupon) {
      return NextResponse.json(
        {
          error: "Días desde último cupón no puede exceder días del período",
        },
        { status: 400 }
      );
    }

    if (!montoCupon || montoCupon <= 0) {
      return NextResponse.json(
        { error: "Monto del cupón debe ser un valor positivo" },
        { status: 400 }
      );
    }

    // Calcular
    const resultado = calcularPrecioSucio({
      precioLimpio,
      diasDesdeUltimoCupon,
      diasPeriodoCupon,
      montoCupon,
    });

    return NextResponse.json(
      {
        success: true,
        data: resultado,
        input: {
          precioLimpio,
          diasDesdeUltimoCupon,
          diasPeriodoCupon,
          montoCupon,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en cálculo de precio sucio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
