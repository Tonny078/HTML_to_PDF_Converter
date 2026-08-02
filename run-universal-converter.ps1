# Universal HTML to PDF Converter
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Universal HTML to PDF Converter" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will convert ALL HTML files in the input folder to PDF" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"
Write-Host ""
Write-Host "Running universal converter..." -ForegroundColor Yellow
npm run universal
Write-Host ""
Write-Host "Conversion completed! Check the output folder for your PDFs." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"