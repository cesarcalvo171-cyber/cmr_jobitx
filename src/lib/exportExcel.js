import * as XLSX from 'xlsx';

export function exportToExcel(filename, headers, rows) {
  // Combinar headers y rows en una sola matriz (array de arrays)
  const data = [headers, ...rows];
  
  // Crear una nueva hoja de trabajo (worksheet) a partir de la matriz de datos
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Crear un nuevo libro de trabajo (workbook)
  const workbook = XLSX.utils.book_new();
  
  // Añadir la hoja de trabajo al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  
  // Generar el archivo y descargarlo en el navegador
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
