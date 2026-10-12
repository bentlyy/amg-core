import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * EL BACKEND CONVIERTE DINERO SOLO POR money.ts
 * =============================================
 *
 * Vivía en la suite (packages/core/tests/frontendMoney.test.ts) cuando el core
 * era un workspace del monorepo. Ahora que el core es su propio repo, el barrido
 * que mira SU fuente vive acá: escanea los modulos y falla si alguno convierte
 * montos a mano (`* 100` / `/ 100`) en vez de pasar por fromMinor/toMinor.
 */

const modulos = join(import.meta.dirname, '..', 'src', 'modules');

/**
 * No toda operacion con 100 es una conversion de dinero: hay milisegundos,
 * dias, expiraciones de token y PORCENTAJES (un impuesto de 19% se divide por
 * 100 a proposito, y no tiene nada que ver con centavos). Solo nos interesan
 * las que tocan montos.
 */
function esOperacionDeDinero(linea: string): boolean {
  if (/por\s*cent|percent|%|\/\s*tax|\btaxP\b|\bivaP\b|\bimpuesto/i.test(linea)) return false;
  const esTiempoOCantidad =
    /60|1000|86_?400|Date\.now|setInterval|setTimeout|windowMs|maxAge|timeout|\bms\b|segundos|minutos|toFixed|slice|substring/i.test(
      linea,
    );
  if (esTiempoOCantidad) return false;
  return /\b(price|prices|total|subtotal|tax|pricePerHour|price_at|unit_price_at|amount|value|openValue|totalValue|totalEmitido)\b/.test(
    linea,
  );
}

describe('el backend convierte solo por money.ts', () => {
  const rutas = readdirSync(modulos)
    .map((mod) => join(modulos, mod, 'routes.ts'))
    .filter((ruta) => existsSync(ruta));

  it('se encontraron las rutas de modulos', () => {
    expect(rutas.length).toBeGreaterThan(3);
  });

  for (const ruta of rutas) {
    const nombre = basename(join(ruta, '..')) + '/routes.ts';
    it(`${nombre}: no convierte montos a mano`, () => {
      const culpables: string[] = [];
      readFileSync(ruta, 'utf8')
        .split(/\r?\n/)
        .forEach((linea, i) => {
          if (/^\s*(\*|\/\/)/.test(linea)) return; // comentario: puede explicar la regla
          if (linea.includes('fromMinor') || linea.includes('toMinor')) return;
          if (!esOperacionDeDinero(linea)) return;
          if (/([*/])\s*100\b/.test(linea)) culpables.push(`  L${i + 1}: ${linea.trim()}`);
        });
      expect(culpables.join('\n'), `convierte dinero a mano en ${nombre}:\n${culpables.join('\n')}`).toBe('');
    });
  }
});
