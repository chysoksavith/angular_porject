// category.type.ts

export interface CategoryType {
  // Renamed from Category to CategoryType
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  children: CategoryType[];
}

export interface CategoryPagination {
  categories: CategoryType[];
  currentPage: number;
  totalPage: number;
  totalCategories: number;
  perPage: number;
}
