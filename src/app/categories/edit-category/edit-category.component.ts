import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category/category.service';
import { CategoryPagination, CategoryType } from '../../model/category.type';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-category',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.css'],
  standalone: true,
})
export class EditCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  categories: CategoryType[] = [];
  categoryId: number = 0;
  flattenedCategories: { id: number; displayName: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      parent_id: [null],
    });
    this.categoryId = Number(this.route.snapshot.paramMap.get('id')) || 0;
  }

  ngOnInit(): void {
    this.loadAllCategories();
    this.loadCategory();
  }

  loadAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('Categories received:', categories);
        this.categories = Array.isArray(categories)
          ? categories
          : categories.categories || [];
        // Flatten the categories for the dropdown
        this.flattenedCategories = this.flattenCategories(
          this.categories,
          this.categoryId
        );
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categories = [];
        this.flattenedCategories = [];
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load categories.',
        });
      },
    });
  }

  loadCategory() {
    this.categoryService.getCategories('', 1).subscribe({
      next: (response: CategoryPagination) => {
        const category = this.findCategoryById(
          response.categories,
          this.categoryId
        );
        if (category) {
          this.categoryForm.patchValue({
            name: category.name,
            parent_id: category.parent_id,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Category not found.',
          });
          this.router.navigate(['/categories']);
        }
      },
      error: (err) => {
        console.error('Error loading category:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load category.',
        });
        this.router.navigate(['/categories']);
      },
    });
  }

  findCategoryById(
    categories: CategoryType[],
    id: number
  ): CategoryType | undefined {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      const found = this.findCategoryById(cat.children, id);
      if (found) return found;
    }
    return undefined;
  }

  flattenCategories(
    categories: CategoryType[],
    excludeId: number,
    prefix: string = ''
  ): { id: number; displayName: string }[] {
    let result: { id: number; displayName: string }[] = [];
    categories.forEach((cat) => {
      if (cat.id !== excludeId) {
        const displayName = prefix ? `${prefix} > ${cat.name}` : cat.name;
        result.push({ id: cat.id, displayName });
        if (cat.children?.length) {
          result = result.concat(
            this.flattenCategories(cat.children, excludeId, displayName)
          );
        }
      }
    });
    return result;
  }

  onUpdateCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched(); // Fixed typo: markAllAsTouched is a method, not a property
      return;
    }

    const categoryData: CategoryType = {
      // Fixed type to CategoryType for consistency
      name: this.categoryForm.value.name,
      parent_id: this.categoryForm.value.parent_id,
      id: this.categoryId,
      created_at: '',
      updated_at: '',
      children: [],
    };

    console.log('Updating category:', categoryData); // Debug

    this.categoryService
      .updateCategory(this.categoryId, categoryData)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Category updated successfully!',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.router.navigate(['/categories']);
          });
        },
        error: (error) => {
          console.error('Error updating category:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'Failed to update category: ' +
              (error.message || 'Unknown error'),
          });
        },
      });
  }

  // Note: filterCategories is defined but not used; you can remove it unless you need it elsewhere
  filterCategories(
    categories: CategoryType[],
    excludeId: number
  ): CategoryType[] {
    return categories
      .filter((cat) => cat.id !== excludeId)
      .map((cat) => ({
        ...cat,
        children: this.filterCategories(cat.children, excludeId),
      }));
  }
}
