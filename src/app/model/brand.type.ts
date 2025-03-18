export type Brand = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};
export interface BrandPagination {
  brands: Brand[];
  currentPage: number;
  totalPages: number;
  totalBrands: number;
  perPage: number;
}
