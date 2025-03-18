import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CategoryPagination, CategoryType } from '../model/category.type';
import { CategoryService } from '../services/category/category.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { InstantiateExpr } from '@angular/compiler';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  categories: CategoryType[] = [];
  searchForm: FormGroup; // Define the FormGroup for the search form
  currentPage = 1;
  totalPages = 1;
  noData: boolean = false;

  // loading
  loading: boolean = false;
  private routerSubscription: Subscription | undefined;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      search: [''], // Initialize search field with an empty value
    });

    // loading
  }

  ngOnInit(): void {
    this.loadCategories();
    // Subscribe to form value changes to perform the search when the value changes
    this.searchForm.valueChanges.subscribe(() => {
      this.currentPage = 1; // Reset to the first page on each search change
      this.loadCategories();

      // loading
      this.routerSubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loading = true;
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationError ||
          event instanceof NavigationCancel
        ) {
          this.loading = false;
          this.loadCategories();
        }
      });
    });
  }
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe;
    }
  }
  // Load categories based on the search term and current page
  loadCategories(): void {
    const search = this.searchForm.value.search || ''; // Get the search term from the form
    this.categoryService.getCategories(search, this.currentPage).subscribe({
      next: (response: CategoryPagination) => {
        this.categories = response.categories;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPage;
        this.noData = this.categories.length === 0;
      },
      error: () => {
        this.noData = true;
        Swal.fire('Error', 'Failed to fetch categories', 'error');
      },
    });
  }

  // Reset the search form
  resetSearch() {
    this.searchForm.reset();
  }

  // Format date for display
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // category delete
  categoryDelete(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(id).subscribe({
          next: () => {
            this.loadCategories();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Category has been deleted.',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            console.error('Error deleting brand:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete brand.',
            });
          },
        });
      }
    });
  }
}
