import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryPagination } from 'src/app/models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:5000/categories';

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

  getCategoryById(id: number): Observable<{ category: Category }> {
    return this.http.get<{ category: Category }>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: Category): Observable<any> {
    return this.http.post<any>(this.apiUrl, category);
  }

  updateCategory(id: number, category: Category): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
import { Component, OnInit } from '@angular/core';
import { Category, CategoryPagination } from 'src/app/models/category.model';
import { CategoryService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-list',
  standalone: true,
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  search = '';
  currentPage = 1;
  totalPages = 1;
  isLoading = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories(this.search, this.currentPage).subscribe({
      next: (response: CategoryPagination) => {
        this.categories = response.categories;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPage;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to fetch categories', 'error');
      },
    });
  }

  searchCategories(): void {
    this.currentPage = 1;
    this.loadCategories();
  }

  deleteCategory(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(id).subscribe(() => {
          Swal.fire('Deleted!', 'Category has been deleted.', 'success');
          this.loadCategories();
        });
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }
}
