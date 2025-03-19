import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoryPagination, CategoryType } from '../../model/category.type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:5000/api/categories';

  constructor(private http: HttpClient) {}

  getCategories(
    search: string = '',
    page: number = 1,
    limit: number = 15
  ): Observable<CategoryPagination> {
    return this.http.get<CategoryPagination>(
      `${this.apiUrl}?search=${search}&page=${page}&limit=${limit}`
    );
  }
  getAllCategories(): Observable<any> {
    return this.http.get<any>(
      'http://localhost:5000/api/category_all'
    );
  }
  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  createCategory(category: CategoryType): Observable<CategoryType> {
    return this.http.post<CategoryType>(this.apiUrl, category);
  }
  updateCategory(id: number, category: CategoryType): Observable<CategoryType> {
    return this.http.put<CategoryType>(`${this.apiUrl}/${id}`, category);
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
