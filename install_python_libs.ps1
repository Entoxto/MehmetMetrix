# Скрипт для установки Python библиотек
Write-Host "Проверка Python..." -ForegroundColor Cyan
python --version

Write-Host "`nОбновление pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

Write-Host "`nУстановка библиотек из requirements.txt..." -ForegroundColor Cyan
python -m pip install -r requirements.txt

Write-Host "`nПроверка установленных библиотек..." -ForegroundColor Cyan
python -c "import pandas; print('✅ pandas:', pandas.__version__)"
python -c "import openpyxl; print('✅ openpyxl:', openpyxl.__version__)"
python -c "from PIL import Image; print('✅ Pillow:', Image.__version__)"

Write-Host "`n✅ Готово!" -ForegroundColor Green






