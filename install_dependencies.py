"""
Скрипт для установки всех необходимых Python библиотек для проекта
"""
import subprocess
import sys

def install_package(package):
    """Устанавливает пакет и возвращает результат"""
    print(f"\n{'='*60}")
    print(f"Установка {package}...")
    print(f"{'='*60}")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", package],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"Ошибка при установке {package}: {e}")
        return False

def check_package(package_name, import_name=None):
    """Проверяет, установлен ли пакет"""
    if import_name is None:
        import_name = package_name
    try:
        module = __import__(import_name)
        version = getattr(module, '__version__', 'unknown')
        print(f"✅ {package_name}: {version}")
        return True
    except ImportError:
        print(f"❌ {package_name}: не установлен")
        return False

if __name__ == "__main__":
    print("="*60)
    print("Установка зависимостей Python для проекта")
    print("="*60)
    
    packages = [
        ("pandas", "pandas"),
        ("openpyxl", "openpyxl"),
        ("Pillow", "PIL"),
    ]
    
    # Устанавливаем пакеты
    for package_name, import_name in packages:
        if not check_package(package_name, import_name):
            install_package(package_name)
    
    # Финальная проверка
    print("\n" + "="*60)
    print("ФИНАЛЬНАЯ ПРОВЕРКА")
    print("="*60)
    all_ok = True
    for package_name, import_name in packages:
        if not check_package(package_name, import_name):
            all_ok = False
    
    if all_ok:
        print("\n✅ Все библиотеки успешно установлены!")
    else:
        print("\n❌ Некоторые библиотеки не установлены. Проверьте ошибки выше.")
        sys.exit(1)




