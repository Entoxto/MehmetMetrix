import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const productsPath = path.join(rootDir, "data", "products.json");
const jpgDir = path.join(rootDir, "public", "images", "products", "jpg");
const webpDir = path.join(rootDir, "public", "images", "products", "webp");
const sourceDirs = ["app", "components", "lib"];
const sourceImagePattern =
  /\/images\/products\/(?:jpg|webp)\/[^"'`\r\n]+?\.(?:jpg|jpeg|webp)/gi;

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function listFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

function readProducts() {
  const raw = fs.readFileSync(productsPath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.products) ? parsed.products : [];
}

function buildPublicPath(photoPath) {
  return path.join(rootDir, "public", ...photoPath.replace(/^\/+/, "").split("/"));
}

function getWebpPhotoPath(photoPath) {
  return photoPath.replace("/jpg/", "/webp/").replace(/\.(jpg|jpeg)$/i, ".webp");
}

function walkFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const result = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(fullPath));
      continue;
    }

    if (/\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(entry.name)) {
      result.push(fullPath);
    }
  }

  return result;
}

function collectSourceImageReferences() {
  const refs = new Set();

  for (const dirName of sourceDirs) {
    const dirPath = path.join(rootDir, dirName);
    for (const filePath of walkFiles(dirPath)) {
      const source = fs
        .readFileSync(filePath, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      const matches = source.match(sourceImagePattern) ?? [];
      for (const match of matches) {
        refs.add(match);
      }
    }
  }

  return refs;
}

const products = readProducts();
const errors = [];
const warnings = [];

const referencedJpg = new Set();
const referencedWebp = new Set();
const sourceImageReferences = collectSourceImageReferences();

for (const product of products) {
  const { id, photo, name } = product;
  const label = `${id} (${name})`;

  if (typeof photo !== "string" || photo.trim().length === 0) {
    errors.push(`${label}: photo отсутствует`);
    continue;
  }

  if (!photo.startsWith("/images/products/jpg/")) {
    errors.push(`${label}: photo должен начинаться с /images/products/jpg/`);
    continue;
  }

  if (!/\.(jpg|jpeg)$/i.test(photo)) {
    errors.push(`${label}: photo должен указывать на .jpg/.jpeg`);
    continue;
  }

  const jpgAbsolutePath = buildPublicPath(photo);
  referencedJpg.add(path.basename(jpgAbsolutePath));

  if (!fs.existsSync(jpgAbsolutePath)) {
    errors.push(`${label}: отсутствует JPG-файл ${photo}`);
    continue;
  }

  const webpPhoto = getWebpPhotoPath(photo);
  const webpAbsolutePath = buildPublicPath(webpPhoto);
  referencedWebp.add(path.basename(webpAbsolutePath));

  if (!fs.existsSync(webpAbsolutePath)) {
    warnings.push(`${label}: отсутствует WebP-версия ${webpPhoto}`);
  }
}

for (const imagePath of sourceImageReferences) {
  const absolutePath = buildPublicPath(imagePath);
  const fileName = path.basename(absolutePath);

  if (!fs.existsSync(absolutePath)) {
    errors.push(`В коде есть ссылка на отсутствующее изображение ${imagePath}`);
    continue;
  }

  if (imagePath.includes("/jpg/")) {
    referencedJpg.add(fileName);
    const webpImagePath = getWebpPhotoPath(imagePath);
    const webpAbsolutePath = buildPublicPath(webpImagePath);
    referencedWebp.add(path.basename(webpAbsolutePath));

    if (!fs.existsSync(webpAbsolutePath)) {
      warnings.push(`Для изображения из кода отсутствует WebP-версия ${webpImagePath}`);
    }
  } else if (imagePath.includes("/webp/")) {
    referencedWebp.add(fileName);
  }
}

const jpgFiles = listFiles(jpgDir);
const webpFiles = listFiles(webpDir);

const orphanJpg = jpgFiles.filter((fileName) => !referencedJpg.has(fileName));
const orphanWebp = webpFiles.filter((fileName) => !referencedWebp.has(fileName));

if (orphanJpg.length > 0) {
  warnings.push(
    `Есть неиспользуемые JPG-файлы (${orphanJpg.length}): ${orphanJpg
      .slice(0, 8)
      .join(", ")}${orphanJpg.length > 8 ? ", ..." : ""}`
  );
}

if (orphanWebp.length > 0) {
  warnings.push(
    `Есть неиспользуемые WebP-файлы (${orphanWebp.length}): ${orphanWebp
      .slice(0, 8)
      .join(", ")}${orphanWebp.length > 8 ? ", ..." : ""}`
  );
}

if (errors.length > 0) {
  console.error("ERROR: Проверка каталожных изображений не пройдена:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  if (warnings.length > 0) {
    console.error("WARN:");
    for (const warning of warnings) {
      console.error(`  - ${warning}`);
    }
  }
  process.exit(1);
}

console.log("OK: Каталожные изображения валидны");
console.log(`  Товаров с фото: ${products.length}`);
console.log(`  Доп. ссылок на изображения в коде: ${sourceImageReferences.size}`);
console.log(`  JPG-файлов в каталоге: ${jpgFiles.length}`);
console.log(`  WebP-файлов в каталоге: ${webpFiles.length}`);

if (warnings.length > 0) {
  console.log("WARN:");
  for (const warning of warnings) {
    console.log(`  - ${warning}`);
  }
}
