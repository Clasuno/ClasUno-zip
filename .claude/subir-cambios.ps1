# Sube a GitHub (rama main) los cambios que haya en el repositorio.
# Lo ejecuta Claude solo al terminar cada turno (hook «Stop» en .claude/settings.local.json),
# para que el compañero vea los cambios sin tener que acordarse de subirlos.
# También se puede lanzar a mano:  powershell -File .claude/subir-cambios.ps1
#
# - Si no hay nada nuevo, no hace nada.
# - Nunca sube claves: respeta .gitignore y además excluye .env y los ajustes personales.
# - Antes de subir trae lo del compañero (pull --rebase). Si chocan cambios en el mismo
#   sitio, NO fuerza nada: deja tu commit guardado en local y avisa.

$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$raiz = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { Split-Path -Parent $PSScriptRoot }
Set-Location $raiz

function Avisar($texto) {
  # Mensaje que Claude enseña en la conversación
  @{ systemMessage = $texto } | ConvertTo-Json -Compress
}

# Solo en main: no subir nunca desde otra rama
$rama = (git rev-parse --abbrev-ref HEAD 2>$null)
if ($rama -ne 'main') { exit 0 }

# 1. Guardar los cambios nuevos en un commit
$cambios = git status --porcelain -- . ':!*.env' ':!.env.*' ':!.claude/settings.local.json'
if ($cambios) {
  git add -A -- . ':!*.env' ':!.env.*' ':!.claude/settings.local.json' 2>$null | Out-Null
  $archivos = (git diff --cached --name-only) -join ', '
  if ($archivos) {
    if ($archivos.Length -gt 200) { $archivos = $archivos.Substring(0, 200) + '…' }
    $msg = "Cambios automáticos: $archivos`n`nSubido solo al terminar un turno de Claude (.claude/subir-cambios.ps1).`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
    git commit -q -m $msg 2>$null | Out-Null
  }
}

# 2. ¿Hay algo en local que GitHub no tenga?
git fetch -q origin main 2>$null
$pendientes = [int](git rev-list --count origin/main..HEAD 2>$null)
if ($pendientes -eq 0) { exit 0 }

# 3. Traer lo del compañero encima y subir
git pull -q --rebase origin main 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  git rebase --abort 2>$null | Out-Null
  Avisar "⚠️ No he podido subir a GitHub: tu compañero ha cambiado lo mismo que tú. Tus cambios están guardados en tu ordenador; pide a Claude que los junte y los suba."
  exit 0
}
git push -q origin main 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Avisar "⚠️ No he podido subir a GitHub (¿sin internet o sin sesión en GitHub?). Los cambios siguen guardados en tu ordenador y se subirán en el siguiente intento."
  exit 0
}
$ultimo = git log -1 --format='%h %s'
Avisar "✅ Subido a GitHub ($pendientes cambio(s)): $ultimo"
exit 0
