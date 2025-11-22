# Script de test d'upload
Write-Host "🧪 Test d'upload vers le serveur de test" -ForegroundColor Cyan

# Chemin vers une image de test (modifie selon ton cas)
$imagePath = "C:\Users\Owen\Downloads\test.jpg"

# Vérifie si l'image existe
if (-not (Test-Path $imagePath)) {
    Write-Host "❌ Image de test introuvable: $imagePath" -ForegroundColor Red
    Write-Host "💡 Crée une petite image ou change le chemin dans le script" -ForegroundColor Yellow
    exit
}

Write-Host "✅ Image trouvée: $imagePath" -ForegroundColor Green
Write-Host "📤 Upload en cours..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/upload-test" `
        -Method POST `
        -Form @{
            image = Get-Item $imagePath
        }
    
    Write-Host "✅ UPLOAD RÉUSSI !" -ForegroundColor Green
    Write-Host "📸 URL: $($response.url)" -ForegroundColor Cyan
    Write-Host "🆔 ID: $($response.id)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
}