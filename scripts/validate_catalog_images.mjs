import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT_DIR, readLocalSnapshot } from "./local_snapshot.mjs";

export function validateCatalogImages(productsData, rootDir = ROOT_DIR) {
  const jpgDir = path.join(rootDir, "public", "images", "products", "jpg");
  const webpDir = path.join(rootDir, "public", "images", "products", "webp");
  const cardWebpDir = path.join(webpDir, "card");
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

  function listRelativeFilesRecursive(dirPath, baseDir = dirPath) {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files = [];
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...listRelativeFilesRecursive(fullPath, baseDir));
      } else if (entry.isFile()) {
        files.push(toPosix(path.relative(baseDir, fullPath)));
      }
    }

    return files;
  }

  function buildPublicPath(photoPath) {
    return path.join(rootDir, "public", ...photoPath.replace(/^\/+/, "").split("/"));
  }

  function getWebpPhotoPath(photoPath) {
    return photoPath.replace("/jpg/", "/webp/").replace(/\.(jpg|jpeg)$/i, ".webp");
  }

  function getCardWebpPhotoPath(photoPath) {
    return photoPath
      .replace("/jpg/", "/webp/card/")
      .replace(/\.(jpg|jpeg)$/i, ".webp");
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
        if (/\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(filePath)) continue;
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

  const products = productsData.products;
  const errors = [];
  const warnings = [];
  const productsWithoutPhoto = [];

  const referencedJpg = new Set();
  const referencedWebp = new Set();
  const referencedCardWebp = new Set();
  const sourceImageReferences = collectSourceImageReferences();

  for (const product of products) {
    const { id, photo, name } = product;
    const label = `${id} (${name})`;

    if (typeof photo !== "string" || photo.trim().length === 0) {
      const excelRows = Array.isArray(product.excelRows)
        ? product.excelRows.filter((row) => Number.isInteger(row) && row > 0)
        : [];
      productsWithoutPhoto.push({
        label,
        excelRows,
      });
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

    const cardWebpPhoto = getCardWebpPhotoPath(photo);
    const cardWebpAbsolutePath = buildPublicPath(cardWebpPhoto);
    referencedCardWebp.add(path.basename(cardWebpAbsolutePath));

    if (!fs.existsSync(cardWebpAbsolutePath)) {
      errors.push(`${label}: отсутствует карточная WebP-версия ${cardWebpPhoto}`);
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

      const cardWebpImagePath = getCardWebpPhotoPath(imagePath);
      const cardWebpAbsolutePath = buildPublicPath(cardWebpImagePath);
      referencedCardWebp.add(path.basename(cardWebpAbsolutePath));

      if (!fs.existsSync(cardWebpAbsolutePath)) {
        errors.push(
          `Для изображения из кода отсутствует карточная WebP-версия ${cardWebpImagePath}`
        );
      }
    } else if (imagePath.includes("/webp/card/")) {
      referencedCardWebp.add(fileName);
    } else if (imagePath.includes("/webp/")) {
      referencedWebp.add(fileName);
    }
  }

  const jpgFiles = listFiles(jpgDir);
  const webpFiles = listFiles(webpDir).filter((fileName) => /\.webp$/i.test(fileName));
  const cardWebpFiles = listFiles(cardWebpDir).filter((fileName) =>
    /\.webp$/i.test(fileName)
  );
  const sourceStems = new Set(
    jpgFiles
      .filter((fileName) => /\.(jpg|jpeg)$/i.test(fileName))
      .map((fileName) => path.parse(fileName).name)
  );
  const allDerivedWebpFiles = listRelativeFilesRecursive(webpDir).filter(
    (fileName) => /\.webp$/i.test(fileName)
  );

  for (const relativePath of allDerivedWebpFiles) {
    const pathParts = relativePath.split("/");
    const hasSupportedLayout =
      pathParts.length === 1 ||
      (pathParts.length === 2 && pathParts[0] === "card");

    if (!hasSupportedLayout) {
      errors.push(
        `Неожиданный производный WebP ${relativePath}; запустите npm run images:sync`
      );
      continue;
    }

    const sourceStem = path.parse(pathParts.at(-1)).name;
    if (!sourceStems.has(sourceStem)) {
      errors.push(
        `У производного WebP ${relativePath} нет исходного JPG/JPEG; запустите npm run images:sync`
      );
    }
  }

  const orphanJpg = jpgFiles.filter((fileName) => !referencedJpg.has(fileName));
  const orphanWebp = webpFiles.filter((fileName) => !referencedWebp.has(fileName));
  const orphanCardWebp = cardWebpFiles.filter(
    (fileName) => !referencedCardWebp.has(fileName)
  );

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

  if (orphanCardWebp.length > 0) {
    warnings.push(
      `Есть неиспользуемые карточные WebP-файлы (${orphanCardWebp.length}): ${orphanCardWebp
        .slice(0, 8)
        .join(", ")}${orphanCardWebp.length > 8 ? ", ..." : ""}`
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
    throw new Error(errors.join("; "));
  }

  console.log("OK: Каталожные изображения валидны");
  console.log(`  Всего моделей в каталоге: ${products.length}`);
  console.log(`  Моделей с фото: ${products.length - productsWithoutPhoto.length}`);
  console.log(`  Моделей без фото: ${productsWithoutPhoto.length}`);
  if (productsWithoutPhoto.length > 0) {
    console.log("  Список моделей без фото:");
    for (const product of productsWithoutPhoto) {
      const rows =
        product.excelRows.length > 0
          ? product.excelRows.join(", ")
          : "не сохранены";
      console.log(`    - ${product.label}; строки Excel: ${rows}`);
    }
  }
  console.log(`  Доп. ссылок на изображения в коде: ${sourceImageReferences.size}`);
  console.log(`  JPG-файлов в каталоге: ${jpgFiles.length}`);
  console.log(`  WebP-файлов в каталоге: ${webpFiles.length}`);
  console.log(`  Карточных WebP-файлов в каталоге: ${cardWebpFiles.length}`);

  if (warnings.length > 0) {
    console.log("WARN:");
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }

}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const embedded = readLocalSnapshot({ preview: false });
    validateCatalogImages(embedded.products);
    const preview = readLocalSnapshot();
    if (preview.version !== embedded.version) validateCatalogImages(preview.products);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}
