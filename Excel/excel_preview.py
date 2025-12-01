import pandas as pd
import os

# Настройки отображения
pd.set_option('display.max_rows', 500)
pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)

file_path = "Расчёты с мехметом new.xlsx"
output_file = "excel_preview.txt"

def generate_preview():
    if not os.path.exists(file_path):
        print(f"Файл {file_path} не найден.")
        return

    try:
        # Читаем файл (все листы)
        xl = pd.ExcelFile(file_path)
        
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"Файл: {file_path}\n")
            f.write(f"Листы: {xl.sheet_names}\n")
            f.write("="*50 + "\n\n")

            for sheet_name in xl.sheet_names:
                f.write(f"--- ЛИСТ: {sheet_name} ---\n")
                
                # Читаем лист. header=None, чтобы видеть "сырые" данные, как они лежат в ячейках
                df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
                
                # Убираем полностью пустые строки и столбцы, если они мешают (опционально)
                # df.dropna(how='all', inplace=True)
                # df.dropna(axis=1, how='all', inplace=True)

                # Инфо о размерности
                f.write(f"Размер: {df.shape[0]} строк, {df.shape[1]} колонок\n\n")
                
                # Записываем содержимое как таблицу
                # to_string() с index=True показывает номера строк, что удобно для навигации
                f.write(df.to_string(index=True, header=False, na_rep=""))
                f.write("\n\n" + "="*50 + "\n\n")
        
        print(f"Превью успешно сохранено в {output_file}")

    except Exception as e:
        print(f"Ошибка при чтении Excel: {e}")(f"Ошибка при чтении Excel: {e}")

if __name__ == "__main__":
    generate_preview()
