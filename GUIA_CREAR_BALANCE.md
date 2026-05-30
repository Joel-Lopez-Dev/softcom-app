# 📊 Guía de Uso: Crear Balance General en SoftCom

## 🎯 ¿Para qué sirve esta sección?

La sección **"Crear Balance"** te permite **registrar los bienes y el presupuesto** de tu empresa de forma sencilla. Sin necesidad de programadores, tú puedes:

- ✅ Registrar qué bienes tiene tu empresa (propiedad, equipos, etc)
- ✅ Indicar cuánto cuesta cada bien
- ✅ Especificar cómo se financian (% capital propio vs % préstamo)
- ✅ Registrar ingresos y gastos previstos
- ✅ **Generar automáticamente** un balance financiero profesional
- ✅ **Exportar a PDF** para reportes o presentaciones

**Resultado:** Un estado financiero completo y profesional, generado en segundos.

---

## 📝 Paso 1: Ir a Estados Financieros

1. Click en **"Estados Financieros"** en el menú lateral
2. Selecciona tu **empresa cliente** del dropdown
3. Verás 4 tabs: **"➕ Crear Balance"** (activo), Balance General, Estado de Resultados, Indicadores

---

## 🏢 Paso 2: Registrar Bienes y Activos

### Ejemplo Real:
Tienes una empresa con:
- 1 propiedad comercial de $3,000,000
- Equipos por $1,500,000

### ¿Cómo hacerlo?

**1. Llenar el primer bien (la propiedad):**

| Campo | Valor | Explicación |
|-------|-------|-------------|
| **Nombre del Bien** | Propiedad Comercial | ¿Qué es? |
| **Costo Total** | 3,000,000 | ¿Cuánto cuesta? |
| **% Capital** | 25 | ¿Cuánto % pagaste de tu bolsillo? |
| **% Préstamo** | 70 | ¿Cuánto % es financiamiento bancario? |
| **Plazo (meses)** | 48 | ¿En cuántos meses pagas el préstamo? |

Los valores **se calculan automáticamente**:
- **% Otros** = 100% - 25% - 70% = **5%** (otras fuentes)

**2. Agregar más bienes:**

Click en **"+ Agregar Bien"** y repite el proceso para los equipos:

| Campo | Valor |
|-------|-------|
| **Nombre del Bien** | Equipos Industriales |
| **Costo Total** | 1,500,000 |
| **% Capital** | 25 |
| **% Préstamo** | 70 |
| **Plazo (meses)** | 36 |

**3. Eliminar un bien:**

Si te equivocas, click en el 🗑️ (tacho de basura) en la fila y se elimina.

---

## 💰 Paso 3: Registrar Presupuesto (Ingresos y Gastos)

Ahora registras cuánto **esperas ganar (ingresos)** y cuánto **esperas gastar (gastos)**.

### Ejemplo Real:
Tu empresa estima:
- Ingresos por ventas: **$3,200,000** (enero-diciembre)
- Gastos variables: **$800,000**
- Gastos fijos: **$800,000**
- Intereses de préstamos: **$325,000**

### ¿Cómo hacerlo?

**Ya hay 2 filas predefinidas:**

| Concepto | Descripción | Monto | Tipo |
|----------|-------------|-------|------|
| Ingresos por Ventas | (edita si quieres) | **3,200,000** | 📈 Ingreso |
| Gastos Variables | (edita) | **800,000** | 📉 Gasto |

**Llenar:**
1. Click en el campo de "Monto" y escribe: `3200000`
2. Cambiar el tipo si es necesario (📈 Ingreso o 📉 Gasto)

**Agregar más líneas:**

Click en **"+ Agregar Línea"** y agrega:

| Concepto | Monto | Tipo |
|----------|-------|------|
| Gastos Fijos | 800,000 | 📉 Gasto |
| Intereses | 325,000 | 📉 Gasto |

**Eliminar una línea:**

Click en el 🗑️ si te equivocas.

---

## 📊 Paso 4: Ver el Resumen Automático

**SoftCom calcula automáticamente:**

| Métrica | Fórmula | Valor |
|---------|---------|-------|
| **Total Activos** | Suma de todos los bienes | $4,500,000 |
| **Capital Total** | 25% de activos | $1,125,000 |
| **Pasivos Totales** | 70% de activos | $3,150,000 |
| **Total Ingresos** | Suma ingresos | $3,200,000 |
| **Total Gastos** | Suma gastos | $2,325,000 |

Este resumen aparece en la **caja gris** debajo de la tabla de presupuestos.

---

## 💾 Paso 5: Guardar el Balance

Cuando termines de completar todos los datos:

1. **Verifica** que todos los campos estén llenos
2. Click en el botón **"💾 Guardar Balance General"** (abajo del todo)
3. Espera que diga ✅ "Balance guardado exitosamente"

**¿Qué pasa entonces?**
- Los datos se guardan en la BD
- La página cambia automáticamente al tab **"Balance General"**
- Ves el reporte con números grandes, bien formateado

---

## 📄 Paso 6: Generar PDF Profesional

Una vez que guardaste tu balance:

1. Click en **"Exportar reporte"** (botón arriba)
2. Se descarga un **PDF profesional** con:
   - Logo de SOFTCOM
   - Balance General con todos los detalles
   - Estado de Resultados
   - Indicadores financieros
3. **Archivo:** `Reporte_Estados_Financieros_YYYY-MM-DD.pdf`

**Úsalo para:**
- Presentaciones a clientes ✅
- Reportes a bancos ✅
- Archivos de control interno ✅
- Decisiones estratégicas ✅

---

## ⚙️ Tips y Trucos

### 1. **Porcentajes no cuadran?**
Los 3 porcentajes (capital, préstamo, otros) deben sumar ~100%.
- Si sumas 25 + 70 = 95%, el 5% se asigna a "Otros"
- **No necesitas sumarlos**, ¡ya lo hace SoftCom!

### 2. **¿Cómo debo llenar los datos?**
Úsalos **reales**:
- Si tu propiedad costó $3M → Escribe **3000000** (sin formato)
- Si ingresos son $3.2M → Escribe **3200000**
- SoftCom automáticamente formatea a moneda: **$3,200,000**

### 3. **¿Puedo editar después?**
Actualmente: **No**. Los balances guardados son **inmutables** (no se borran ni se editan).

**Solución:** Si necesitas corregir, crea un balance nuevo con datos correctos.

### 4. **¿Cuántos bienes puedo agregar?**
**Ilimitados**. Agrega todos los que necesites:
- 1 bien → Sólo bienes
- 10 bienes → Más detallado
- El cálculo es automático

### 5. **¿Cuántos ingresos/gastos puedo agregar?**
**Ilimitados también**. Desglose completo:
- Ingresos: Ventas, Servicios, Intereses, Otros
- Gastos: Variables, Fijos, Amortizaciones, Intereses, etc.

---

## 🎬 Flujo Completo (2 minutos)

```
1. Abro Estados Financieros → Selecciono empresa
2. Tab "Crear Balance" (ya está activo)
3. Agrego 2 bienes (Propiedad $3M, Equipos $1.5M)
4. Agrego 4 líneas de presupuesto (ingresos + gastos)
5. Veo el resumen: Activos $4.5M, Ingresos $3.2M
6. Click "Guardar Balance General"
7. ✅ Se guarda automáticamente
8. Click "Exportar reporte"
9. Descargo PDF profesional
10. Lo comparto con mi equipo / banco / cliente
```

**Tiempo total:** ~2 minutos (sin necesidad de técnicos)

---

## ❌ Errores Comunes

| Problema | Solución |
|----------|----------|
| "Completa al menos un bien" | Agrega nombre + costo a la primera fila |
| "No descarga el PDF" | Asegúrate de haber guardado el balance primero |
| "Los números no cuadran" | SoftCom calcula automáticamente, confía en los valores |
| "¿Cómo edito?" | Actualmente no se puede editar. Crea uno nuevo. |

---

## 🚀 Próximo Nivel: Análisis

Una vez que guardaste balances:

1. Ve al tab **"Indicadores Financieros"**
2. Ves ratios calculados automáticamente:
   - **ROE** (Return on Equity)
   - **ROA** (Return on Assets)
   - **Deuda/Capital**
   - **Margen Neto**
3. Úsalos para **tomar decisiones** de inversión/préstamos

---

## 📞 ¿Necesitas ayuda?

- **¿Qué es un balance general?** → Es una foto de la salud financiera de tu empresa
- **¿Por qué % capital/préstamo?** → Muestra cómo financias tus activos
- **¿Por qué el PDF?** → Documento profesional para reportes y presentaciones

**Contacta:** Tu gerente de cuenta en SoftCom

---

**¡Listo!** 🎉

Ya puedes crear balances profesionales sin ayuda técnica. La BD se actualiza automáticamente y los reportes se generan en segundos.

**Próxima vez:** Menos tiempo, más análisis.
