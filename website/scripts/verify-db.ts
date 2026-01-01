/**
 * Script para verificar que los datos se insertaron correctamente en Supabase
 * Ejecutar con: npx tsx scripts/verify-db.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDatos() {
  console.log('🔍 Verificando datos en Supabase...\n');

  // Verificar categorías
  const { data: categorias, error: errorCategorias } = await supabase
    .from('categorias')
    .select('*')
    .order('orden');

  console.log('=== CATEGORÍAS ===');
  if (errorCategorias) {
    console.error('❌ Error:', errorCategorias.message);
  } else {
    console.log(`✅ Total: ${categorias?.length || 0}`);
    categorias?.forEach(c => console.log(`  - ${c.nombre} (ID: ${c.id})`));
  }
  console.log('');

  // Verificar posiciones
  const { data: posiciones, error: errorPosiciones } = await supabase
    .from('posiciones')
    .select('*')
    .order('id');

  console.log('=== POSICIONES ===');
  if (errorPosiciones) {
    console.error('❌ Error:', errorPosiciones.message);
  } else {
    console.log(`✅ Total: ${posiciones?.length || 0}`);
    posiciones?.forEach(p => console.log(`  - ${p.nombre} (${p.abreviatura}) - ID: ${p.id}`));
  }
  console.log('');

  // Verificar equipos
  const { data: equipos, error: errorEquipos } = await supabase
    .from('equipos')
    .select('*, categoria:categoria_id(nombre)')
    .order('id');

  console.log('=== EQUIPOS ===');
  if (errorEquipos) {
    console.error('❌ Error:', errorEquipos.message);
  } else {
    console.log(`✅ Total: ${equipos?.length || 0}`);
    equipos?.forEach(e => console.log(`  - ${e.nombre} (ID: ${e.id}) - Temporada: ${e.temporada}`));
  }
  console.log('');

  // Resumen
  console.log('=== RESUMEN ===');
  const total = (categorias?.length || 0) + (posiciones?.length || 0) + (equipos?.length || 0);
  const esperado = 3 + 10 + 3; // 3 categorías + 10 posiciones + 3 equipos

  if (total === esperado) {
    console.log('✅ ¡Todos los datos fueron insertados correctamente!');
    console.log(`✅ Total de registros: ${total}/${esperado}`);
  } else {
    console.log(`⚠️  Datos incompletos: ${total}/${esperado} registros`);
    console.log('');
    console.log('Esperado:');
    console.log('  - 3 categorías');
    console.log('  - 10 posiciones');
    console.log('  - 3 equipos');
    console.log('');
    console.log('Encontrado:');
    console.log(`  - ${categorias?.length || 0} categorías`);
    console.log(`  - ${posiciones?.length || 0} posiciones`);
    console.log(`  - ${equipos?.length || 0} equipos`);
  }
}

verificarDatos().catch(console.error);
