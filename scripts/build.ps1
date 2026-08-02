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
New-Item -ItemType Directory -Force -Path (Join-Path $distRoot "css") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $distRoot "js") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $distRoot "assets") | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot "css\nyvera.css") -Destination (Join-Path $distRoot "css")
Copy-Item -LiteralPath (Join-Path $projectRoot "css\radio.css") -Destination (Join-Path $distRoot "css")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\app.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\nyvera-data.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\nyvera-prompts.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\nyvera-storage.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\nyvera-workflows.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\radio.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\radio-explorer.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\radio-service.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "js\radio-storage.js") -Destination (Join-Path $distRoot "js")
Copy-Item -LiteralPath (Join-Path $projectRoot "assets") -Destination $distRoot -Recurse -Force
Copy-Item -LiteralPath (Join-Path $projectRoot "manifest.webmanifest") -Destination $distRoot
Copy-Item -LiteralPath (Join-Path $projectRoot "service-worker.js") -Destination $distRoot
New-Item -ItemType File -Force -Path (Join-Path $distRoot ".nojekyll") | Out-Null

$required = @(
  (Join-Path $distRoot "index.html"),
  (Join-Path $distRoot "css\nyvera.css"),
  (Join-Path $distRoot "css\radio.css"),
  (Join-Path $distRoot "js\app.js"),
  (Join-Path $distRoot "manifest.webmanifest"),
  (Join-Path $distRoot "service-worker.js"),
  (Join-Path $distRoot "js\nyvera-prompts.js"),
  (Join-Path $distRoot "js\nyvera-workflows.js"),
  (Join-Path $distRoot "js\radio.js"),
  (Join-Path $distRoot "js\radio-explorer.js"),
  (Join-Path $distRoot "js\radio-service.js"),
  (Join-Path $distRoot "js\radio-storage.js"),
  (Join-Path $distRoot ".nojekyll")
)
foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Build output is missing $path" }
}

Write-Output "Nyvera GitHub Pages build created at $distRoot"
