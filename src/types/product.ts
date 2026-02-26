export interface Product {
  id: string;
  brand: string;
  model: string;
  name: {
    en: string;
    ar: string;
  };
  description?: {
    en: string;
    ar: string;
  };
  category: string;
  price: number;
  images?: string[];
  is_active: boolean;
  show_out_of_stock?: boolean;
  variants: Array<{
    color: string;
    colorCode?: string;
    sizeSystem?: string;
    sizes: Array<{
      size: string;
      stock: number;
      price?: number;
      sku?: string;
    }>;
    images?: string[];
  }>;
  hasStock?: boolean;
  stockRemaining?: number;
  availableColors?: string[];
}
