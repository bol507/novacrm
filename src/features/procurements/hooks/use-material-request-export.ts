// src/features/procurement/hooks/useMaterialRequestExport.ts

import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import type { MaterialRequest, MaterialRequestItem } from '../types/procurement';

// ✅ Tipo explícito para filas de Excel
type ExcelRow = Record<string, string | number>;

export const useMaterialRequestExport = () => {
  
  const formatStatus = (status: MaterialRequestItem['item_status']): string => {
    const map: Record<MaterialRequestItem['item_status'], string> = {
      approved: '✅ Aprobado',
      partially_approved: '⚠️ Parcial',
      rejected: '❌ Rechazado',
      pending: '⏳ Pendiente',
    };
    return map[status] || status;
  };

  const normalizeQuantity = (value: string | number | null | undefined, fallback: number): number => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  };

  const exportToExcel = (request: MaterialRequest, items: MaterialRequestItem[]) => {
    try {
      if (!items.length) {
        toast.info('No hay ítems para exportar');
        return;
      }

      // ✅ Tipar array explícitamente
      const data: ExcelRow[] = items.map((item, index) => {
        const approvedQty = item.item_status === 'approved' 
          ? item.quantity 
          : item.item_status === 'partially_approved'
            ? normalizeQuantity(item.approved_quantity, 0)
            : 0;

        return {
          'N°': index + 1,
          'Ítem': item.item_name || 'Sin nombre',
          'Tipo': item.catalog_item_type || 'General',
          'Razón': item.catalog_reason_type || (item.reason_other ? 'Otro' : '-'),
          'Detalle Razón': item.reason_other || '',
          'Cantidad Solicitada': Number(item.quantity) || 0,
          'Unidad': item.unit || '-',
          'Prioridad': item.priority || '-',
          'Costo Estimado': item.estimated_cost !== null && item.estimated_cost !== undefined 
            ? `$${Number(item.estimated_cost).toFixed(2)}` 
            : '-',
          'Estado': formatStatus(item.item_status),
          'Cantidad Aprobada': approvedQty,
          'Notas del Ítem': item.notes || '',
          'Proveedor Asignado': item.vendor_id ? `#${item.vendor_id}` : '-',
        };
      });

      // Totales
      const totalQty = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
      const totalApproved = items.reduce((sum, i) => {
        if (i.item_status === 'approved') return sum + (Number(i.quantity) || 0);
        if (i.item_status === 'partially_approved') {
          return sum + normalizeQuantity(i.approved_quantity, 0);
        }
        return sum;
      }, 0);
      const totalCost = items.reduce((sum, i) => sum + (Number(i.estimated_cost) || 0), 0);
      
      // ✅ Fila de totales con type assertion
      data.push({
        'N°': '', 
        'Ítem': '📊 TOTALES', 
        'Tipo': '', 
        'Razón': '', 
        'Detalle Razón': '',
        'Cantidad Solicitada': totalQty, // ✅ number
        'Unidad': '', 
        'Prioridad': '', 
        'Costo Estimado': totalCost > 0 ? `$${totalCost.toFixed(2)}` : '-', // ✅ string
        'Estado': '', 
        'Cantidad Aprobada': totalApproved, // ✅ number
        'Notas del Ítem': '', 
        'Proveedor Asignado': ''
      } as ExcelRow);

      // Workbook
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Material Request');

      // Column widths
      ws['!cols'] = [
        { wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 30 },
        { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
        { wch: 22 }, { wch: 35 }, { wch: 20 },
      ];

      // ✅ Nombre de archivo usando request.id (o request_number si lo agregaste)
      const requestIdentifier = (request as any).request_number || request.id;
      const fileName = `MR-${requestIdentifier}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      toast.success(`Reporte exportado: ${fileName}`);

    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      toast.error('Error al generar el reporte Excel');
    }
  };

  return { exportToExcel };
};