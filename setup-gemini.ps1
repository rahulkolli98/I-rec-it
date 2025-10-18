# Quick Setup Script for Gemini API Migration

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Gemini API Migration Setup" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "[✓] .env.local file found" -ForegroundColor Green
    
    # Check if GEMINI_API_KEY exists
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "GEMINI_API_KEY=") {
        Write-Host "[✓] GEMINI_API_KEY variable found in .env.local" -ForegroundColor Green
        
        # Check if it has a value
        if ($envContent -match "GEMINI_API_KEY=.+") {
            Write-Host "[✓] GEMINI_API_KEY appears to have a value" -ForegroundColor Green
        } else {
            Write-Host "[!] GEMINI_API_KEY is empty. Please add your API key." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[X] GEMINI_API_KEY not found in .env.local" -ForegroundColor Red
        Write-Host "    Please add: GEMINI_API_KEY=your_api_key_here" -ForegroundColor Yellow
    }
    
    # Check for old OpenRouter key
    if ($envContent -match "OPENROUTER_API_KEY=") {
        Write-Host "[!] Old OPENROUTER_API_KEY still present - you can remove it" -ForegroundColor Yellow
    }
} else {
    Write-Host "[X] .env.local file not found" -ForegroundColor Red
    Write-Host "    Creating .env.local from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "[✓] Created .env.local from .env.example" -ForegroundColor Green
        Write-Host "    Please edit .env.local and add your API keys" -ForegroundColor Yellow
    } else {
        Write-Host "[X] .env.example not found either" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Get your Gemini API key from:" -ForegroundColor White
Write-Host "   https://makersuite.google.com/app/apikey" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Add it to your .env.local file:" -ForegroundColor White
Write-Host "   GEMINI_API_KEY=your_actual_key_here" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Remove old OpenRouter variables (if present):" -ForegroundColor White
Write-Host "   - OPENROUTER_API_KEY" -ForegroundColor Cyan
Write-Host "   - BOOK_SUMMARY_MODEL" -ForegroundColor Cyan
Write-Host "   - MOVIE_SUMMARY_MODEL" -ForegroundColor Cyan
Write-Host "   - MOVIE_RECOMMENDATION_MODEL" -ForegroundColor Cyan
Write-Host "   - BOOK_RECOMMENDATION_MODEL" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Restart your development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed documentation, see:" -ForegroundColor White
Write-Host "   GEMINI_MIGRATION_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
