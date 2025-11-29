/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Минимальная оптимизация для dev режима
    minimumCacheTTL: 60,
    // Разрешенные домены (если используете внешние изображения)
    remotePatterns: [],
  },
};

module.exports = nextConfig;

