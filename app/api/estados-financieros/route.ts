import { query } from "@/lib/db";

type BalanceGeneral = {
  id_balance: number;
  id_empresa: number;
  fecha: string;
  total_activos: string;
  total_pasivos: string;
  total_capital: string;
  inversiones_valores: string | null;
  pagos_pendientes: string | null;
  observaciones: string | null;
  created_at: string;
};

type EstadoResultado = {
  id_estado: number;
  id_empresa: number;
  anio: number;
  periodo: string;
  ingreso_total: string;
  gasto_total: string;
  utilidad_neta: string;
  observaciones: string | null;
  created_at: string;
};

type Indicador = {
  id_indicador: number;
  id_empresa: number;
  fecha: string;
  rentabilidad_activos: string | null;
  rentabilidad_patrimonio: string | null;
  razon_solvencia: string | null;
  razon_liquidez: string | null;
  indice_endeudamiento: string | null;
  margen_utilidad: string | null;
  created_at: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresa_id");
    const tipo = searchParams.get("tipo"); // "balance" | "resultado" | "indicadores"

    if (!empresaId) {
      return Response.json(
        { success: false, error: "empresa_id es requerido" },
        { status: 400 }
      );
    }

    const empresaIdNum = parseInt(empresaId);

    if (tipo === "balance" || !tipo) {
      const result = await query<BalanceGeneral>(
        `SELECT * FROM balance_general 
         WHERE id_empresa = $1 
         ORDER BY fecha DESC 
         LIMIT 50`,
        [empresaIdNum]
      );
      
      if (tipo === "balance") {
        return Response.json({ success: true, data: result.rows });
      }
    }

    if (tipo === "resultado" || !tipo) {
      const result = await query<EstadoResultado>(
        `SELECT * FROM estado_resultado 
         WHERE id_empresa = $1 
         ORDER BY anio DESC, periodo DESC 
         LIMIT 50`,
        [empresaIdNum]
      );
      
      if (tipo === "resultado") {
        return Response.json({ success: true, data: result.rows });
      }
    }

    if (tipo === "indicadores" || !tipo) {
      const result = await query<Indicador>(
        `SELECT * FROM indicador 
         WHERE id_empresa = $1 
         ORDER BY fecha DESC 
         LIMIT 50`,
        [empresaIdNum]
      );
      
      if (tipo === "indicadores") {
        return Response.json({ success: true, data: result.rows });
      }
    }

    // Si no hay tipo específico, retornar todos
    const balanceResult = await query<BalanceGeneral>(
      `SELECT * FROM balance_general WHERE id_empresa = $1 ORDER BY fecha DESC LIMIT 10`,
      [empresaIdNum]
    );

    const resultadoResult = await query<EstadoResultado>(
      `SELECT * FROM estado_resultado WHERE id_empresa = $1 ORDER BY anio DESC, periodo DESC LIMIT 10`,
      [empresaIdNum]
    );

    const indicadoresResult = await query<Indicador>(
      `SELECT * FROM indicador WHERE id_empresa = $1 ORDER BY fecha DESC LIMIT 10`,
      [empresaIdNum]
    );

    // Obtener detalles del balance más reciente
    let balanceConDetalles = null;
    let estadoConDetalles = null;

    if (balanceResult.rows.length > 0) {
      const balanceId = balanceResult.rows[0].id_balance;
      
      const detallesActivos = await query(
        `SELECT * FROM detalle_activo WHERE id_balance = $1 ORDER BY tipo_activo`,
        [balanceId]
      );
      
      const detallesPasivos = await query(
        `SELECT * FROM detalle_pasivo_capital WHERE id_balance = $1 ORDER BY tipo_financiamiento`,
        [balanceId]
      );
      
      const bienesBalance = await query(
        `SELECT * FROM bien_balance WHERE id_balance = $1`,
        [balanceId]
      );

      balanceConDetalles = {
        ...balanceResult.rows[0],
        detalles_activos: detallesActivos.rows,
        detalles_pasivos_capital: detallesPasivos.rows,
        bienes: bienesBalance.rows,
      };
    }

    if (resultadoResult.rows.length > 0) {
      const estadoId = resultadoResult.rows[0].id_estado;
      
      const detallesResultado = await query(
        `SELECT * FROM detalle_estado_resultado WHERE id_estado = $1 ORDER BY id_detalle_estado`,
        [estadoId]
      );

      estadoConDetalles = {
        ...resultadoResult.rows[0],
        detalles: detallesResultado.rows,
      };
    }

    return Response.json({
      success: true,
      data: {
        balance_general: balanceConDetalles || balanceResult.rows[0],
        estado_resultado: estadoConDetalles || resultadoResult.rows[0],
        indicadores: indicadoresResult.rows,
      },
    });
  } catch (err: any) {
    console.error("Error obteniendo estados financieros:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_empresa, tipo, ...datos } = body;

    if (!id_empresa || !tipo) {
      return Response.json(
        { success: false, error: "id_empresa y tipo son requeridos" },
        { status: 400 }
      );
    }

    if (tipo === "balance") {
      const {
        fecha,
        total_activos,
        total_pasivos,
        total_capital,
        inversiones_valores,
        pagos_pendientes,
        observaciones,
      } = datos;

      if (!fecha || total_activos == null || total_pasivos == null || total_capital == null) {
        return Response.json(
          { success: false, error: "Campos requeridos faltantes" },
          { status: 400 }
        );
      }

      // Validar ecuación contable
      const activos = parseFloat(total_activos);
      const pasivos = parseFloat(total_pasivos);
      const capital = parseFloat(total_capital);

      if (Math.abs(activos - (pasivos + capital)) > 0.01) {
        return Response.json(
          {
            success: false,
            error: "Ecuación contable no cuadra: Activos ≠ Pasivos + Capital",
          },
          { status: 400 }
        );
      }

      const result = await query<BalanceGeneral>(
        `INSERT INTO balance_general 
         (id_empresa, fecha, total_activos, total_pasivos, total_capital, inversiones_valores, pagos_pendientes, observaciones)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          id_empresa,
          fecha,
          total_activos,
          total_pasivos,
          total_capital,
          inversiones_valores || null,
          pagos_pendientes || null,
          observaciones || null,
        ]
      );

      return Response.json({ success: true, data: result.rows[0] });
    }

    if (tipo === "resultado") {
      const { anio, periodo, ingreso_total, gasto_total, utilidad_neta, observaciones } = datos;

      if (!anio || !periodo || ingreso_total == null || gasto_total == null || utilidad_neta == null) {
        return Response.json(
          { success: false, error: "Campos requeridos faltantes" },
          { status: 400 }
        );
      }

      // Validar ecuación
      const ingresos = parseFloat(ingreso_total);
      const gastos = parseFloat(gasto_total);
      const utilidad = parseFloat(utilidad_neta);

      if (Math.abs(utilidad - (ingresos - gastos)) > 0.01) {
        return Response.json(
          {
            success: false,
            error: "Ecuación de resultado no cuadra: Utilidad ≠ Ingreso - Gasto",
          },
          { status: 400 }
        );
      }

      const result = await query<EstadoResultado>(
        `INSERT INTO estado_resultado 
         (id_empresa, anio, periodo, ingreso_total, gasto_total, utilidad_neta, observaciones)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          id_empresa,
          anio,
          periodo,
          ingreso_total,
          gasto_total,
          utilidad_neta,
          observaciones || null,
        ]
      );

      return Response.json({ success: true, data: result.rows[0] });
    }

    if (tipo === "indicadores") {
      const {
        fecha,
        rentabilidad_activos,
        rentabilidad_patrimonio,
        razon_solvencia,
        razon_liquidez,
        indice_endeudamiento,
        margen_utilidad,
      } = datos;

      if (!fecha) {
        return Response.json(
          { success: false, error: "fecha es requerida" },
          { status: 400 }
        );
      }

      const result = await query<Indicador>(
        `INSERT INTO indicador 
         (id_empresa, fecha, rentabilidad_activos, rentabilidad_patrimonio, razon_solvencia, razon_liquidez, indice_endeudamiento, margen_utilidad)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          id_empresa,
          fecha,
          rentabilidad_activos || null,
          rentabilidad_patrimonio || null,
          razon_solvencia || null,
          razon_liquidez || null,
          indice_endeudamiento || null,
          margen_utilidad || null,
        ]
      );

      return Response.json({ success: true, data: result.rows[0] });
    }

    return Response.json(
      { success: false, error: "Tipo de documento no válido" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error creando estado financiero:", err);

    if (err.code === "23514") {
      return Response.json(
        { success: false, error: "Validación fallida: verifica los valores" },
        { status: 400 }
      );
    }

    if (err.code === "23503") {
      return Response.json(
        { success: false, error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
