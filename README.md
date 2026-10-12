# @amg/core

Nucleo multi-tenant reutilizable de AMG. Libreria compartida (no es un servidor):
expone la base SQLite, la identidad/sesiones, utilidades de dinero, assets y los
modulos de agenda, recordatorios, documentos e inventario.

Se consume desde varios proyectos (la suite SaaS Mini y los que vengan) como
dependencia versionada.

## Desarrollo

```bash
npm install
npm run build      # compila a dist/ (tsc)
npm test           # vitest
npm run typecheck
```

## Como lo consumen los demas proyectos

Dependencia git por tag (sin registry). En el `package.json` del consumidor:

```json
{
  "dependencies": {
    "@amg/core": "git+https://github.com/bentlyy/amg-core.git#v0.1.0"
  }
}
```

Al instalar, npm ejecuta el script `prepare` de este repo, que corre `npm run build`
y deja `dist/` listo. Por eso `dist/` NO se versiona en este repositorio.

## Versionado

Se libera con un tag semver (`v0.1.0`, `v0.2.0`, ...). Los consumidores fijan el
tag en su `package.json`. Para publicar una version nueva:

```bash
# 1) subir "version" en package.json
# 2) commit y tag
git add -A
git commit -m "release v0.2.0"
git tag v0.2.0
git push origin main --tags
```

## Licencia

Propietaria (UNLICENSED). No redistribuir sin autorizacion.
