"""
Скрипт для конвертации JPG изображений в WebP формат.
Конвертирует только те файлы, для которых ещё нет WebP версии.
"""
from pathlib import Path
from PIL import Image

def convert_to_webp(input_path: Path, output_path: Path, quality: int = 85) -> tuple[int, int]:
    """
    Конвертирует изображение в WebP формат.
    
    Args:
        input_path: Путь к исходному файлу
        output_path: Путь для сохранения WebP
        quality: Качество WebP (1-100, рекомендуется 85)
    
    Returns:
        Tuple (размер_оригинала_в_байтах, размер_webp_в_байтах)
    """
    try:
        # Открываем изображение
        with Image.open(input_path) as img:
            # Конвертируем в RGB, если нужно (для JPG с CMYK)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Если есть прозрачность, сохраняем её
                img = img.convert('RGBA')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Сохраняем в WebP
            img.save(output_path, 'WebP', quality=quality, method=6)
            
            # Получаем размеры файлов
            original_size = input_path.stat().st_size
            webp_size = output_path.stat().st_size
            
            return original_size, webp_size
    except Exception as e:
        print(f"❌ Ошибка при конвертации {input_path.name}: {e}")
        return 0, 0

def main():
    """Главная функция конвертации"""
    # Определяем пути
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    jpg_dir = project_root / "public" / "images" / "products" / "jpg"
    webp_dir = project_root / "public" / "images" / "products" / "webp"
    
    # Создаём папки, если их нет
    jpg_dir.mkdir(parents=True, exist_ok=True)
    webp_dir.mkdir(parents=True, exist_ok=True)
    
    # Проверка существования папки с JPG
    if not jpg_dir.exists():
        print(f"❌ Папка не найдена: {jpg_dir}")
        print(f"💡 Сначала запустите scripts/migrate_images.py для перемещения файлов")
        return
    
    # Находим все JPG/JPG файлы
    image_extensions = ['.jpg', '.jpeg', '.JPG', '.JPEG']
    image_files = []
    for ext in image_extensions:
        image_files.extend(jpg_dir.glob(f"*{ext}"))
    
    if not image_files:
        print(f"❌ Не найдено изображений в {jpg_dir}")
        print(f"💡 Переместите JPG файлы в папку {jpg_dir}")
        return
    
    print(f"📸 Найдено {len(image_files)} изображений для проверки\n")
    
    # Статистика
    total_original_size = 0
    total_webp_size = 0
    converted_count = 0
    already_exists_count = 0
    
    # Конвертируем каждое изображение
    for img_path in sorted(image_files):
        # Создаём имя для WebP файла (то же имя, но с расширением .webp)
        webp_filename = img_path.stem + '.webp'
        webp_path = webp_dir / webp_filename
        
        # Пропускаем, если WebP уже существует
        if webp_path.exists():
            print(f"✓ Уже существует: {img_path.name} → {webp_filename}")
            already_exists_count += 1
            # Всё равно считаем размеры для статистики
            total_original_size += img_path.stat().st_size
            total_webp_size += webp_path.stat().st_size
            continue
        
        # Конвертируем
        print(f"🔄 Конвертирую: {img_path.name}...", end=" ")
        original_size, webp_size = convert_to_webp(img_path, webp_path, quality=85)
        
        if webp_size > 0:
            saved = original_size - webp_size
            saved_percent = (saved / original_size * 100) if original_size > 0 else 0
            total_original_size += original_size
            total_webp_size += webp_size
            converted_count += 1
            
            print(f"✅ {original_size / 1024:.1f} KB → {webp_size / 1024:.1f} KB "
                  f"(-{saved_percent:.1f}%, экономия {saved / 1024:.1f} KB)")
        else:
            print("❌ Ошибка")
    
    # Итоговая статистика
    print(f"\n{'='*60}")
    print(f"📊 ИТОГОВАЯ СТАТИСТИКА:")
    print(f"   Конвертировано: {converted_count}")
    print(f"   Уже существует: {already_exists_count}")
    print(f"   Всего обработано: {converted_count + already_exists_count}")
    print(f"\n   Размер оригиналов: {total_original_size / 1024 / 1024:.2f} MB")
    print(f"   Размер WebP: {total_webp_size / 1024 / 1024:.2f} MB")
    if total_original_size > 0:
        total_saved = total_original_size - total_webp_size
        total_saved_percent = (total_saved / total_original_size * 100)
        print(f"   Экономия: {total_saved / 1024 / 1024:.2f} MB ({total_saved_percent:.1f}%)")
        print(f"   Прирост скорости: ~{total_saved_percent * 0.8:.1f}% (примерно)")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
    input("\nНажмите Enter для выхода...")

