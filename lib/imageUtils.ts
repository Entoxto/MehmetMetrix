/**
 * Утилиты для работы с изображениями
 */

/**
 * Преобразует путь к JPG изображению в путь к WebP версии.
 * 
 * @param jpgPath - Путь к JPG изображению (например: "/images/products/jpg/фото.jpg")
 * @returns Путь к WebP (например: "/images/products/webp/фото.webp")
 */
export function getOptimizedImagePath(jpgPath: string): string {
  return jpgPath.replace('/jpg/', '/webp/').replace(/\.(jpg|jpeg)$/i, '.webp');
}

/**
 * Генерирует размытый placeholder для изображений.
 * Использует простой градиент на основе цвета фона карточки.
 * 
 * @returns Base64 encoded blur placeholder (1x1 пиксель, размытый)
 */
export function getBlurPlaceholder(): string {
  // Создаём простой размытый placeholder на основе тёмного фона
  // Это очень маленький base64 изображение (1x1 пиксель, размытый)
  // Next.js автоматически применит blur эффект
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyNjI2MjYiLz48L3N2Zz4=';
}
