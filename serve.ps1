# Servidor estático local (sem dependências) — uso: powershell -ExecutionPolicy Bypass -File serve.ps1
param([int]$Port = 5500)

$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Servindo $root em http://localhost:$Port/"

$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'
  '.json' = 'application/json'; '.woff2' = 'font/woff2'; '.ico' = 'image/x-icon'
  '.mp4' = 'video/mp4'; '.webm' = 'video/webm'
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($path -eq '') { $path = 'index.html' }
    $file = [System.IO.Path]::GetFullPath((Join-Path $root $path))
    if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf)) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
      $res.Headers.Add('Cache-Control', 'no-store')
      $res.Headers.Add('Accept-Ranges', 'bytes')
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $start = 0; $end = $bytes.Length - 1

      # Suporte a "Range" (necessário para o navegador avançar/repetir vídeos)
      $range = $ctx.Request.Headers['Range']
      if ($range -match '^bytes=(\d*)-(\d*)$') {
        if ($Matches[1] -ne '') { $start = [long]$Matches[1] }
        if ($Matches[2] -ne '') { $end = [Math]::Min([long]$Matches[2], $bytes.Length - 1) }
        elseif ($Matches[1] -eq '') { $start = 0 }
        $res.StatusCode = 206
        $res.Headers.Add('Content-Range', "bytes $start-$end/$($bytes.Length)")
      }

      $len = $end - $start + 1
      $res.ContentLength64 = $len
      if ($ctx.Request.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bytes, $start, $len) }
    } else {
      $res.StatusCode = 404
    }
  } catch {
    # cliente cancelou a requisição (comum com vídeo) — segue servindo
  } finally {
    try { $res.Close() } catch {}
  }
}
