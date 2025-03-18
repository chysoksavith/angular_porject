import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoryPagination } from '../../model/category.type';
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
    limit: number = 10
  ): Observable<CategoryPagination> {
    return this.http.get<CategoryPagination>(
      `${this.apiUrl}?search=${search}&page=${page}&limit=${limit}`
    );
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
