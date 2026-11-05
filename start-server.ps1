<#
.SYNOPSIS
  VocabBuddy - Lightweight Local HTTP Server (Zero External Dependencies)
  Uses Windows built-in .NET HttpListener so PWA Install (Service Worker & Manifest) works locally!
#>

param(
    [int]$Port = 8090,
    [string]$Path = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    $Port = 8095
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🦉 VocabBuddy - 英語全方位學習系統 本地端 PWA 伺服器已啟動" -ForegroundColor Green
Write-Host "  網址: $prefix (支援 Chrome/Edge 一鍵安裝為桌面 App)" -ForegroundColor Yellow
Write-Host "  請勿關閉此視窗。按 Ctrl+C 可隨時停止伺服器。" -ForegroundColor DarkCyan
Write-Host "==========================================================" -ForegroundColor Cyan

Start-Process $prefix

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "index.html"
        }
        $localPath = [System.Uri]::UnescapeDataString($localPath)
        $fullPath = Join-Path $Path $localPath

        if (Test-Path $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeMap.ContainsKey($ext)) {
                $contentType = $mimeMap[$ext]
            }

            $response.ContentType = $contentType
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
