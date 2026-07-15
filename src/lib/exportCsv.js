// Utilidad para exportar datos a CSV compatible con Microsoft Excel (UTF-8 BOM)

export function exportToCsv(filename, headers, rows) {
  const BOM = '\uFEFF'; // Indicador de orden de bytes para que Excel reconozca UTF-8 automáticamente
  
  const csvContent = BOM + [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      row.map(field => {
        const str = field !== null && field !== undefined ? String(field) : '';
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
