# Creates the dependency-free Sites artifact from the validated vanilla source.
$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$distRoot = Join-Path $projectRoot "dist"
$assetsRoot = Join-Path $distRoot "assets"
$serverRoot = Join-Path $distRoot "server"

if (Test-Path -LiteralPath $distRoot) {
  $resolvedDist = (Resolve-Path -LiteralPath $distRoot).Path
  if (-not $resolvedDist.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to clear a build directory outside the project."
  }
  Remove-Item -LiteralPath $resolvedDist -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $assetsRoot, $serverRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot "index.html") -Destination $assetsRoot
Copy-Item -LiteralPath (Join-Path $projectRoot "css") -Destination $assetsRoot -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot "js") -Destination $assetsRoot -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot "utilities") -Destination $assetsRoot -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot "assets") -Destination $assetsRoot -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot "worker\index.js") -Destination $serverRoot

$required = @(
  (Join-Path $assetsRoot "index.html"),
  (Join-Path $assetsRoot "js\app.js"),
  (Join-Path $serverRoot "index.js")
)
foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Build output is missing $path" }
}

Write-Output "Vyrelix build created at $distRoot"
