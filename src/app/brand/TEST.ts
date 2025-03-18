import { Component, OnInit } from '@angular/core';
import { BrandService } from '../../services/brand.service';
import { Brand } from '../../models/brand';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.css'],
})
export class BrandListComponent implements OnInit {
  brands: Brand[] = [];
  brandForm: FormGroup;
  isModalOpen = false;
  isEditMode = false;
  successMessage: string | null = null;

  constructor(private brandService: BrandService, private fb: FormBuilder) {
    this.brandForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.maxLength(200)]],
    });
  }

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (brands) => {
        console.log('Brands loaded successfully:', brands);
        this.brands = brands;
      },
      error: (err) => console.error('Error loading brands:', err),
    });
  }

  openCreateModal() {
    this.brandForm.reset({ name: '', description: '' });
    this.isEditMode = false;
    this.isModalOpen = true;
    console.log('Opening create modal');
  }

  openEditModal(brand: Brand) {
    this.brandForm.patchValue(brand);
    this.isEditMode = true;
    this.isModalOpen = true;
    console.log('Opening edit modal for brand:', brand);
  }

  closeModal() {
    this.isModalOpen = false;
    this.successMessage = null;
    this.brandForm.reset();
    console.log('Modal closed');
  }

  saveBrand() {
    if (this.brandForm.invalid) {
      console.log('Form is invalid:', this.brandForm.errors);
      this.brandForm.markAllAsTouched();
      return;
    }

    const brandData: Brand = this.brandForm.value;

    if (this.isEditMode && brandData.id) {
      this.brandService.updateBrand(brandData.id, brandData).subscribe({
        next: (updatedBrand) => {
          console.log('Brand updated successfully:', updatedBrand);
          this.successMessage = 'Brand updated successfully!';
          this.loadBrands();
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => console.error('Error updating brand:', err),
      });
    } else {
      this.brandService.createBrand(brandData).subscribe({
        next: (newBrand) => {
          console.log('Brand created successfully:', newBrand);
          this.successMessage = 'Brand created successfully!';
          this.loadBrands();
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => console.error('Error creating brand:', err),
      });
    }
  }

  deleteBrand(id: number) {
    if (confirm('Are you sure you want to delete this brand?')) {
      this.brandService.deleteBrand(id).subscribe({
        next: () => {
          console.log(`Brand with ID ${id} deleted successfully`);
          this.successMessage = 'Brand deleted successfully!';
          this.loadBrands();
          setTimeout(() => (this.successMessage = null), 1500);
        },
        error: (err) => console.error('Error deleting brand:', err),
      });
    }
  }

  // Method to format the created_at date
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

  get nameControl() {
    return this.brandForm.get('name');
  }

  get descriptionControl() {
    return this.brandForm.get('description');
  }
}
