import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryType } from '../../model/category.type';
import { CategoryService } from '../../services/category/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-category',
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.css'],
  standalone: true,
})
export class CreateCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  categories: CategoryType[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      categories: this.fb.array([this.createCategoryFormGroup()]),
    });
  }

  get getCategoriesArray(): FormArray {
    return this.categoryForm.get('categories') as FormArray;
  }

  createCategoryFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      parent_id: [null],
    });
  }

  addCategoryInput(): void {
    this.getCategoriesArray.push(this.createCategoryFormGroup());
  }

  removeCategoryInput(index: number): void {
    if (this.getCategoriesArray.length > 1) {
      this.getCategoriesArray.removeAt(index);
    }
  }

  ngOnInit(): void {
    this.loadAllCategories();
  }

  loadAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        // Adjust based on actual API response structure
        this.categories = Array.isArray(categories)
          ? categories
          : categories.categories || [];
      },
      error: (err) => {
        this.categories = []; // Ensure it’s an array even on error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load categories.',
        });
      },
    });
  }

  onSaveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoriesData: CategoryType[] = this.getCategoriesArray.value.map(
      (cat: any) => ({
        name: cat.name,
        parent_id: cat.parent_id, // This should now work with the fixed select
        children: [],
      })
    );


    const createRequests = categoriesData.map(
      (category) => this.categoryService.createCategory(category).toPromise() // Correctly return the promise
    );

    Promise.all(createRequests)
      .then((responses) => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${categoriesData.length} category(ies) created successfully!`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/categories']);
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            'Failed to create categories: ' +
            (error.message || 'Unknown error'),
        });
      });
  }

  resetForm() {
    this.categoryForm.setControl(
      'categories',
      this.fb.array([this.createCategoryFormGroup()])
    );
  }
}
