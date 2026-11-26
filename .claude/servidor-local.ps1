# Servidor local para probar la web (no hay Node ni Python en el equipo).
# Uso: powershell -ExecutionPolicy Bypass -File servidor-local.ps1 -Carpeta <carpeta de la web> -Puerto 8090
param([string]$Carpeta, [int]$Puerto = 8090)
$tipos = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8'; '.json'='application/json'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.mp4'='video/mp4'; '.mp3'='audio/mpeg'; '.ico'='image/x-icon'; '.txt'='text/plain; charset=utf-8'; '.xml'='application/xml'; '.webmanifest'='application/manifest+json' }
$raiz = (Resolve-Path $Carpeta).Path
$l = New-Object Net.HttpListener; $l.Prefixes.Add("http://localhost:$Puerto/"); $l.Start()
Write-Host "Sirviendo $raiz en http://localhost:$Puerto/"
while ($l.IsListening) {
  $ctx = $l.GetContext(); $res = $ctx.Response
  try {
    $ruta = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($ruta -eq '') { $ruta = 'index.html' }
    $f = Join-Path $raiz $ruta
    if ((Test-Path $f -PathType Container)) { $f = Join-Path $f 'index.html' }
    if (-not (Test-Path $f -PathType Leaf) -and (Test-Path "$f.html" -PathType Leaf)) { $f = "$f.html" }
    if (Test-Path $f -PathType Leaf) {
      $b = [IO.File]::ReadAllBytes($f); $ext = [IO.Path]::GetExtension($f).ToLower()
      $res.ContentType = $(if ($tipos[$ext]) { $tipos[$ext] } else { 'application/octet-stream' })
      $res.Headers.Add('Cache-Control', 'no-store')
      $res.OutputStream.Write($b, 0, $b.Length)
    } else {
      $res.StatusCode = 404; $nf = Join-Path $raiz '404.html'
      if (Test-Path $nf) { $b = [IO.File]::ReadAllBytes($nf); $res.ContentType = 'text/html; charset=utf-8'; $res.OutputStream.Write($b, 0, $b.Length) }
    }
  } catch { $res.StatusCode = 500 } finally { $res.Close() }
}
