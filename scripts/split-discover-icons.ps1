Add-Type -AssemblyName System.Drawing

function Test-VisiblePixel($pixel, $threshold) {
  if ($pixel.A -le 10) { return $false }
  return -not ($pixel.R -le $threshold -and $pixel.G -le $threshold -and $pixel.B -le $threshold)
}

function Remove-DarkBackground($bitmap, $threshold) {
  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    for ($y = 0; $y -lt $bitmap.Height; $y++) {
      $pixel = $bitmap.GetPixel($x, $y)
      if ($pixel.R -le $threshold -and $pixel.G -le $threshold -and $pixel.B -le $threshold) {
        $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      }
    }
  }
}

function Get-ContentBounds($bitmap) {
  $minX = $bitmap.Width
  $minY = $bitmap.Height
  $maxX = 0
  $maxY = 0

  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    for ($y = 0; $y -lt $bitmap.Height; $y++) {
      if (Test-VisiblePixel $bitmap.GetPixel($x, $y) 28) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt $minX) { return $null }
  return @{
    X = $minX
    Y = $minY
    Width = ($maxX - $minX + 1)
    Height = ($maxY - $minY + 1)
  }
}

function New-CenteredSquareIcon($sourceBitmap, $outputSize, $paddingRatio) {
  $bounds = Get-ContentBounds $sourceBitmap
  if ($null -eq $bounds) { return $sourceBitmap }

  $content = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
  $gContent = [System.Drawing.Graphics]::FromImage($content)
  $srcRect = New-Object System.Drawing.Rectangle $bounds.X, $bounds.Y, $bounds.Width, $bounds.Height
  $destRect = New-Object System.Drawing.Rectangle 0, 0, $bounds.Width, $bounds.Height
  $gContent.DrawImage($sourceBitmap, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $gContent.Dispose()

  $maxSide = [Math]::Max($bounds.Width, $bounds.Height)
  $pad = [int]($maxSide * $paddingRatio)
  $canvasSize = $maxSide + ($pad * 2)

  $canvas = New-Object System.Drawing.Bitmap $outputSize, $outputSize
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  $scale = [double]$outputSize / [double]$canvasSize
  $drawW = [int]($bounds.Width * $scale)
  $drawH = [int]($bounds.Height * $scale)
  $offsetX = [int](($outputSize - $drawW) / 2)
  $offsetY = [int](($outputSize - $drawH) / 2)

  $destRect = New-Object System.Drawing.Rectangle $offsetX, $offsetY, $drawW, $drawH
  $g.DrawImage($content, $destRect)
  $g.Dispose()
  $content.Dispose()

  return $canvas
}

$src = (Resolve-Path (Join-Path $PSScriptRoot '..\src\static\imgs\discover_icon.png')).Path
$img = [System.Drawing.Image]::FromFile($src)

$cols = 3
$cellW = [int]($img.Width / $cols)
$cellH = [int]($img.Height / 2)

$outDir = Join-Path $PSScriptRoot '..\src\static\imgs\discover'
if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}
$outDir = (Resolve-Path $outDir).Path

$names = @('anime', 'ai', 'tech', 'movie', 'bilibili', 'more')

for ($i = 0; $i -lt 6; $i++) {
  $col = $i % $cols
  $row = [math]::Floor($i / $cols)

  # Keep icon area only, exclude bottom text labels.
  $srcX = $col * $cellW
  $srcY = [int]($row * $cellH + ($cellH * 0.02))
  $srcW = $cellW
  $srcH = [int]($cellH * 0.74)

  $raw = New-Object System.Drawing.Bitmap $srcW, $srcH
  $gRaw = [System.Drawing.Graphics]::FromImage($raw)
  $gRaw.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $srcRect = New-Object System.Drawing.Rectangle $srcX, $srcY, $srcW, $srcH
  $destRect = New-Object System.Drawing.Rectangle 0, 0, $srcW, $srcH
  $gRaw.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $gRaw.Dispose()

  Remove-DarkBackground $raw 28
  $final = New-CenteredSquareIcon $raw 256 0.08
  $raw.Dispose()

  $path = Join-Path $outDir ($names[$i] + '.png')
  $final.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $final.Dispose()
  Write-Output $path
}

$img.Dispose()
