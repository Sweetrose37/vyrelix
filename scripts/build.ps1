# Creates the dependency-free static artifact deployed by GitHub Pages.
$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$distRoot = Join-Path $projectRoot "dist"

if (Test-Path -LiteralPath $distRoot) {
  $resolvedDist = (Resolve-Path -LiteralPath $distRoot).Path
  if (-not $resolvedDist.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to clear a build directory outside the project."
  }
  Remove-Item -LiteralPath $resolvedDist -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $distRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot "index.html") -Destination $distRoot
Copy-Item -LiteralPath (Join-Path $projectRoot "css") -Destination $distRoot -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot "js") -Destination $distRoot -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot "utilities") -Destination $distRoot -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot "assets") -Destination $distRoot -Recurse
New-Item -ItemType File -Force -Path (Join-Path $distRoot ".nojekyll") | Out-Null

$required = @(
  (Join-Path $distRoot "index.html"),
  (Join-Path $distRoot "css\style.css"),
  (Join-Path $distRoot "js\app.js"),
  (Join-Path $distRoot "utilities\helpers.js"),
  (Join-Path $distRoot ".nojekyll")
)
foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Build output is missing $path" }
}

Write-Output "Vyrelix GitHub Pages build created at $distRoot"
