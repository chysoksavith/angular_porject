// category.type.ts

export interface CategoryType {
  // Renamed from Category to CategoryType
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryPagination {
  categories: CategoryType[]; // Updated to use CategoryType
  currentPage: number;
  totalPage: number;
  totalCategories: number;
  perPage: number;
}
