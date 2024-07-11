import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, ProductServicesService, Subcategory } from '../../../services/product-services.service'; 
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NewProduct } from '../prouctlist/prouctlist.component';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [
    MatButton,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatToolbarModule,
    MatIconModule,
    MatIconButton,
    CommonModule,
    FormsModule,
    MatListModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterLink,
  ],
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss'],
})
export class SubcategoriesComponent implements OnInit {
  subcategories: Subcategory[] = [];
  selectedSubcategory: Subcategory | null = null;
  selectedSubcategoryProducts: Product[] = [];
  showAddProductForm: boolean = false;
  newProductForm: FormGroup;
  editSubcategoryForm: FormGroup;
  showEditForm: boolean = false;
  showAddSubcategoryForm: boolean = false;
  newSubcategoryForm: FormGroup;
  editProductForm: FormGroup; 
  editingProduct: Product | null = null;

  constructor(
    private productService: ProductServicesService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.newProductForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, Validators.required],
      imageUrl: ['', Validators.required],
      stock: [0, Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      size: ['', Validators.required],
      rating: [0],
      subcategoryId: [null, Validators.required]
    });

    this.editProductForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, Validators.required],
      imageUrl: ['', Validators.required],
      stock: [0, Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      size: ['', Validators.required],
      rating: [0],
      subcategoryId: [null, Validators.required]
    });

    this.editSubcategoryForm = this.formBuilder.group({ 
      name: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.newSubcategoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const categoryId = +this.route.snapshot.params['categoryId'];
    this.loadSubcategories(categoryId);
  }

  loadSubcategories(categoryId: number): void {
    this.productService.getSubcategories(categoryId).subscribe(
      (subcategories: Subcategory[]) => {
        this.subcategories = subcategories;
      },
      (error: any) => {
        console.error('Error loading subcategories:', error);
      }
    );
  }

  viewSubcategory(subcategory: Subcategory): void {
    this.selectedSubcategory = subcategory;
    this.loadProductsForSubcategory(subcategory.id);
  }

  loadProductsForSubcategory(subcategoryId: number): void {
    this.productService.getProductsBySubcategory(subcategoryId).subscribe(
      (products: Product[]) => {
        this.selectedSubcategoryProducts = products;
      },
      (error: any) => {
        console.error('Error fetching products for subcategory:', error);
      }
    );
  }

  submitNewSubcategory(): void {
    if (this.newSubcategoryForm.invalid) {
      console.error('Form is invalid');
      return;
    }
  
    const categoryId = +this.route.snapshot.params['categoryId'];
    const newSubcategory: any = this.newSubcategoryForm.value;
  
    this.productService.createSubcategory(categoryId, newSubcategory).subscribe(
      (subcategory: Subcategory) => {
        console.log('New subcategory added successfully:', subcategory);
        this.newSubcategoryForm.reset();
        this.showAddSubcategoryForm = false;
        this.loadSubcategories(categoryId);
      },
      (error: any) => {
        console.error('Error adding new subcategory:', error);
      }
    );
  }

  setSubcategoryId(subcategoryId: number): void {
    this.newProductForm.patchValue({
      subcategoryId: subcategoryId,
    });
  }

  submitProductForm(): void {
    if (!this.selectedSubcategory) {
      console.error('No subcategory selected');
      return;
    }

    const subcategoryId = this.selectedSubcategory.id;

    this.newProductForm.patchValue({
      subcategoryId: subcategoryId,
    });

    const newProduct: Product = this.newProductForm.value;

    this.productService.createAllProducts(subcategoryId, newProduct).subscribe(
      (product: Product) => {
        console.log('New product added successfully:', product);
        this.showAddProductForm = false;
        this.newProductForm.reset();
        this.loadProductsForSubcategory(subcategoryId);
      },
      (error: any) => {
        console.error('Error adding new product:', error);
      }
    );
  }

  editSubcategory(subcategory: Subcategory): void {
    this.selectedSubcategory = { ...subcategory };
    this.editSubcategoryForm.patchValue({
      name: subcategory.name,
      description: subcategory.description,
    });
    this.showEditForm = true;
  }

  toggleAddProductForm(): void {
    this.showAddProductForm = !this.showAddProductForm;
  }

  submitEditedSubcategory(): void {
    if (!this.selectedSubcategory) {
      console.error('No subcategory selected');
      return;
    }

    const editedSubcategory: Subcategory = {
      ...this.selectedSubcategory,
      name: this.editSubcategoryForm.value.name,
      description: this.editSubcategoryForm.value.description,
    };

    this.productService.updateSubcategory(this.selectedSubcategory.id, editedSubcategory).subscribe(
      () => {
        console.log('Subcategory edited successfully');
        const categoryId = +this.route.snapshot.params['categoryId'];
        this.loadSubcategories(categoryId);
        this.selectedSubcategory = null;
        this.showEditForm = false;
      },
      (error: any) => {
        console.error('Error editing subcategory:', error);
      }
    );
  }

  cancelEditing(): void {
    this.selectedSubcategory = null;
    this.showEditForm = false;
  }

  deleteSubcategory(subcategoryId: number): void {
    this.productService.deleteSubcategory(subcategoryId).subscribe(
      () => {
        console.log('Subcategory deleted successfully');
        const categoryId = +this.route.snapshot.params['categoryId'];
        this.loadSubcategories(categoryId);
      },
      (error: any) => {
        console.error('Error deleting subcategory:', error);
      }
    );
  }

  editProduct(product: Product): void {
    this.editingProduct = { ...product };
    this.editProductForm.patchValue({ ...product });
  }

  updateProduct(): void {
    if (this.editingProduct) {
      this.productService.editProduct(this.editingProduct.id, this.editProductForm.value).subscribe(
        (updatedProduct: Product) => {
          console.log('Product updated successfully:', updatedProduct);
          const index = this.selectedSubcategoryProducts.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            this.selectedSubcategoryProducts[index] = updatedProduct;
          }
          this.editingProduct = null;
        },
        (error: any) => {
          console.error('Error updating product:', error);
          this.editingProduct = null;
        }
      );
    }
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe(
        () => {
          this.selectedSubcategoryProducts = this.selectedSubcategoryProducts.filter(p => p.id !== productId);
          console.log('Product deleted successfully:', productId);
        },
        (error: any) => {
          console.error('Error deleting product:', error);
        }
      );
    }
  }
}
