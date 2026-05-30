import jsPDF from "jspdf"

type BalanceGeneral = {
  id_balance: number
  id_empresa: number
  fecha: string
  total_activos: string
  total_pasivos: string
  total_capital: string
  inversiones_valores: string | null
  pagos_pendientes: string | null
  observaciones: string | null
  created_at: string
}

type EstadoResultado = {
  id_estado: number
  id_empresa: number
  anio: number
  periodo: string
  ingreso_total: string
  gasto_total: string
  utilidad_neta: string
  observaciones: string | null
  created_at: string
}

type Empresa = {
  id_empresa: number
  nombre: string
}

const fmtMXN = (n: string | number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(typeof n === "string" ? parseFloat(n) : n)

export async function generarReportePDF(
  empresa: Empresa,
  balances: BalanceGeneral[],
  resultados: EstadoResultado[],
  fecha: string
) {
  try {
    console.log("🚀 Iniciando generación de PDF...")
    console.log("Datos recibidos:", { empresa, balances: balances.length, resultados: resultados.length })

    if (!balances.length) {
      console.warn("⚠️ No hay balances para generar el reporte")
      throw new Error("No hay datos de balance general")
    }

    // Crear PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    })

    console.log("✓ PDF inicializado")

    const pageWidth = doc.getPageWidth()
    const pageHeight = doc.getPageHeight()
    const margin = 15
    let yPosition = margin

    // ========== HEADER CON LOGO ==========
    try {
      console.log("📸 Cargando logo...")
      const logoResponse = await fetch("/SOFTCOM_LOGO.png")
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob()
        const logoURL = URL.createObjectURL(logoBlob)
        doc.addImage(logoURL, "PNG", margin, yPosition, 30, 20)
        console.log("✓ Logo agregado")
      }
    } catch (e) {
      console.warn("⚠️ Logo no disponible:", e)
    }

    // Título
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("REPORTE DE ESTADOS FINANCIEROS", pageWidth / 2, yPosition + 8, {
      align: "center",
    })

    yPosition += 25

    // Subtítulo
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Empresa: ${empresa.nombre}`, margin, yPosition)
    yPosition += 6
    doc.text(`Fecha del Reporte: ${new Date(fecha).toLocaleDateString("es-MX")}`, margin, yPosition)
    yPosition += 12

    console.log("✓ Header agregado")

    // ========== BALANCE GENERAL ==========
    if (balances.length > 0) {
      const balance = balances[0] as any
      console.log("📊 Agregando balance general...")

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("BALANCE GENERAL", margin, yPosition)
      yPosition += 8

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Al ${new Date(balance.fecha).toLocaleDateString("es-MX")}`, margin, yPosition)
      yPosition += 10

      // Tabla de Balance con dos columnas (Inversión | Financiación)
      const columnWidth = (pageWidth - 2 * margin) / 2
      const rowHeight = 6

      // Headers
      doc.setFont("helvetica", "bold")
      doc.setFillColor(41, 128, 185)
      doc.setTextColor(255, 255, 255)
      doc.rect(margin, yPosition - 4, columnWidth - 2, rowHeight, "F")
      doc.text("INVERSIÓN", margin + 2, yPosition, { fontSize: 9 })
      doc.rect(margin + columnWidth, yPosition - 4, columnWidth - 2, rowHeight, "F")
      doc.text("FINANCIACIÓN", margin + columnWidth + 2, yPosition, { fontSize: 9 })
      yPosition += rowHeight + 2

      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")

      // Obtener detalles si están disponibles
      const detallesActivos = balance.detalles_activos || []
      const detallesPasivos = balance.detalles_pasivos_capital || []
      const bienes = balance.bienes || []

      // Construir filas de activos (izquierda) y pasivos+capital (derecha)
      const maxRows = Math.max(detallesActivos.length + 2, detallesPasivos.length + 2)

      for (let i = 0; i < maxRows; i++) {
        // Fila con color alternado
        if (i % 2 === 0) {
          doc.setFillColor(240, 240, 240)
          doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, rowHeight, "F")
        }

        doc.setTextColor(0, 0, 0)

        // Lado INVERSIÓN (Activos)
        if (i < detallesActivos.length) {
          const activo = detallesActivos[i]
          doc.text(`${activo.descripcion}`, margin + 2, yPosition, { fontSize: 8 })
          doc.text(fmtMXN(activo.monto), margin + columnWidth - 8, yPosition, {
            fontSize: 8,
            align: "right",
          })
        } else if (i === detallesActivos.length) {
          // Fila de TOTAL INVERSIÓN
          doc.setFont("helvetica", "bold")
          doc.setFillColor(220, 220, 220)
          doc.rect(margin, yPosition - 4, columnWidth - 2, rowHeight, "F")
          doc.text("TOTAL INVERSIÓN:", margin + 2, yPosition, { fontSize: 8 })
          doc.text(fmtMXN(balance.total_activos), margin + columnWidth - 8, yPosition, {
            fontSize: 8,
            align: "right",
          })
          doc.setFont("helvetica", "normal")
        }

        // Lado FINANCIACIÓN (Pasivos y Capital)
        if (i < detallesPasivos.length) {
          const pasivo = detallesPasivos[i]
          const descripcionCorta =
            pasivo.porcentaje_financiamiento > 0
              ? `${pasivo.descripcion} (${pasivo.porcentaje_financiamiento}%)`
              : pasivo.descripcion
          doc.text(descripcionCorta, margin + columnWidth + 2, yPosition, { fontSize: 8 })
          doc.text(fmtMXN(pasivo.monto), margin + pageWidth - margin - 8, yPosition, {
            fontSize: 8,
            align: "right",
          })
        } else if (i === detallesPasivos.length) {
          // Fila de TOTAL FINANCIACIÓN
          doc.setFont("helvetica", "bold")
          doc.setFillColor(220, 220, 220)
          doc.rect(margin + columnWidth, yPosition - 4, columnWidth - 2, rowHeight, "F")
          doc.text("TOTAL FINANCIACIÓN:", margin + columnWidth + 2, yPosition, { fontSize: 8 })
          doc.text(
            fmtMXN(
              parseFloat(balance.total_pasivos) + parseFloat(balance.total_capital)
            ),
            margin + pageWidth - margin - 8,
            yPosition,
            { fontSize: 8, align: "right" }
          )
          doc.setFont("helvetica", "normal")
        }

        yPosition += rowHeight

        if (yPosition > pageHeight - 50) {
          doc.addPage()
          yPosition = margin
        }
      }

      yPosition += 5

      // Detalles de bienes si existen
      if (bienes.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Detalle de Bienes Adquiridos:", margin, yPosition)
        yPosition += 6

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        bienes.forEach((bien: any) => {
          doc.text(`${bien.nombre_bien}:`, margin + 4, yPosition)
          yPosition += 4
          doc.text(
            `  Costo Total: ${fmtMXN(bien.costo_total)} | Capital Propio (${bien.porcentaje_capital_propio}%): ${fmtMXN(bien.monto_capital_propio)} | Préstamo (${bien.porcentaje_prestamo}%): ${fmtMXN(bien.monto_prestamo)}`,
            margin + 4,
            yPosition,
            { fontSize: 7 }
          )
          yPosition += 4
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
          }
        })

        yPosition += 3
      }

      // Verificación de ecuación
      doc.setFont("helvetica", "bold")
      doc.setTextColor(41, 128, 185)
      doc.setFontSize(8)
      doc.text(
        `Ecuación de Balance: Activos (${fmtMXN(balance.total_activos)}) = Pasivos (${fmtMXN(balance.total_pasivos)}) + Capital (${fmtMXN(balance.total_capital)})`,
        margin,
        yPosition,
        { maxWidth: pageWidth - 2 * margin }
      )
      yPosition += 8

      doc.setTextColor(0, 0, 0)
      console.log("✓ Balance general agregado")
    }

    // Agregar página si es necesario
    if (yPosition > pageHeight - 50) {
      doc.addPage()
      yPosition = margin
    }

    // Agregar página si es necesario
    if (yPosition > pageHeight - 50) {
      doc.addPage()
      yPosition = margin
    }

    // ========== ESTADO DE RESULTADOS ==========
    if (resultados.length > 0) {
      console.log("📈 Agregando estado de resultados...")

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("ESTADO DE RESULTADOS", margin, yPosition)
      yPosition += 8

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      const primerResultado = resultados[0] as any
      doc.text(
        `Período: ${primerResultado.anio} - ${primerResultado.periodo}`,
        margin,
        yPosition
      )
      yPosition += 8

      // Mostrar desglose detallado si está disponible
      if (primerResultado.detalles && primerResultado.detalles.length > 0) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)

        const detalles = primerResultado.detalles

        detalles.forEach((detalle: any, idx: number) => {
          // Color para líneas principales (ingresos, gastos, resultados)
          const esLinea =
            ["ingreso_ventas", "margen_bruto", "baii", "bai", "beneficio_neto"].includes(
              detalle.concepto
            )
          const esSubtotal =
            ["margen_bruto", "baii", "bai", "beneficio_neto"].includes(detalle.concepto)

          if (esSubtotal) {
            // Líneas de subtotal en negrita y con fondo
            doc.setFont("helvetica", "bold")
            doc.setFillColor(240, 240, 240)
            doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, "F")
          } else if (esLinea) {
            doc.setFont("helvetica", "bold")
          } else {
            doc.setFont("helvetica", "normal")
          }

          // Descripción
          let conceptoLabel = ""
          switch (detalle.concepto) {
            case "ingreso_ventas":
              conceptoLabel = "INGRESOS POR VENTAS"
              break
            case "gastos_variables":
              conceptoLabel = "  (-) Gastos Variables"
              break
            case "margen_bruto":
              conceptoLabel = "= MARGEN BRUTO"
              break
            case "gastos_fijos":
              conceptoLabel = "  (-) Gastos Fijos"
              break
            case "amortizaciones":
              conceptoLabel = "  (-) Amortizaciones y Provisiones"
              break
            case "baii":
              conceptoLabel = "= BAII (Beneficio Antes de Int. e Imp.)"
              break
            case "intereses":
              conceptoLabel = "  (-) Intereses"
              break
            case "bai":
              conceptoLabel = "= BAI (Beneficio Antes de Impuestos)"
              break
            case "impuestos":
              conceptoLabel = "  (-) Impuestos (ISR)"
              break
            case "beneficio_neto":
              conceptoLabel = "= BENEFICIO NETO"
              break
            default:
              conceptoLabel = detalle.descripcion
          }

          doc.text(conceptoLabel, margin + 2, yPosition)

          // Monto a la derecha
          const monto = parseFloat(detalle.monto)
          const montoFormato = monto < 0 ? `(${fmtMXN(Math.abs(monto))})` : fmtMXN(monto)
          doc.text(montoFormato, pageWidth - margin - 2, yPosition, { align: "right" })

          yPosition += 6

          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
          }
        })
      } else {
        // Fallback si no hay detalles: mostrar solo totales
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Ingresos Totales:", margin + 2, yPosition)
        doc.text(fmtMXN(primerResultado.ingreso_total), pageWidth - margin - 2, yPosition, {
          align: "right",
        })
        yPosition += 8

        doc.text("Gastos Totales:", margin + 2, yPosition)
        doc.text(fmtMXN(primerResultado.gasto_total), pageWidth - margin - 2, yPosition, {
          align: "right",
        })
        yPosition += 8

        doc.setFont("helvetica", "bold")
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, "F")
        doc.text("Utilidad Neta:", margin + 2, yPosition)
        doc.text(fmtMXN(primerResultado.utilidad_neta), pageWidth - margin - 2, yPosition, {
          align: "right",
        })
        yPosition += 8
      }

      yPosition += 5
      console.log("✓ Estado de resultados agregado")
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    const pageCount = (doc as any).internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      (doc as any).setPage(i)
      doc.text(
        `Página ${i} de ${pageCount} - Generado ${new Date().toLocaleString("es-MX")}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      )
    }

    console.log("✓ Footer agregado")

    // Descargar
    const nombreArchivo = `Reporte_Estados_Financieros_${new Date().toISOString().split("T")[0]}.pdf`
    console.log(`📥 Descargando: ${nombreArchivo}`)
    doc.save(nombreArchivo)

    console.log("✅ PDF generado y descargado exitosamente")
    return { success: true, message: `PDF descargado: ${nombreArchivo}` }
  } catch (error) {
    console.error("❌ Error generando PDF:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return { success: false, message: `Error: ${errorMessage}` }
  }
}
