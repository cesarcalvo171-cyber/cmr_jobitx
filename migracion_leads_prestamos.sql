-- =====================================================
-- MIGRACION: Adaptar tabla leads para CRM de Prestamos
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Eliminar el constraint de etapas antiguo
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_stage_check;

-- 2. Agregar nuevo constraint con etapas de prestamos
ALTER TABLE leads ADD CONSTRAINT leads_stage_check 
  CHECK (stage IN ('Nuevo', 'En Proceso', 'Prestamo Programado', 'Prestamo Cerrado'));

-- 3. Actualizar el valor por defecto
ALTER TABLE leads ALTER COLUMN stage SET DEFAULT 'Nuevo';

-- 4. Actualizar registros existentes que tengan etapas viejas (si los hay)
UPDATE leads SET stage = 'Nuevo' WHERE stage NOT IN ('Nuevo', 'En Proceso', 'Prestamo Programado', 'Prestamo Cerrado');

-- 5. Cambiar el campo 'value' de texto a numerico
--    (guardamos el monto del prestamo como numero real para poder sumar)
ALTER TABLE leads ALTER COLUMN value TYPE numeric USING NULLIF(regexp_replace(value, '[^0-9.]', '', 'g'), '')::numeric;
ALTER TABLE leads ALTER COLUMN value SET DEFAULT 0;

-- 6. Verificar la estructura final
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads';
