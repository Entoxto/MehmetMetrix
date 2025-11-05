export interface ProductMaterials {
  outer?: string;
  lining?: string;
  comments?: string;
}

export interface Product {
  id: string;
  name: string;
  category: "Мех" | "Замша" | "Кожа" | "Экзотика";
  photo: string;
  sizes: string[];
  price?: number;
  materials?: ProductMaterials;
  inStock: boolean;
  tags?: string[];
}

export interface ProductsData {
  products: Product[];
}

