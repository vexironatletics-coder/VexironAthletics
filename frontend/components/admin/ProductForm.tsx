'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateProductMutation, useUpdateProductMutation } from '@/store/api/productApi';
import type { Product } from '@/lib/types';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  discountPrice: z.string().optional(),
  category: z.enum(['men', 'women', 'children']),
  stock: z.string().min(1, 'Stock is required'),
  sizes: z.string().min(1, 'Add at least one size (comma-separated)'),
  colors: z.string().min(1, 'Add at least one color (comma-separated)'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function getDefaultValues(product?: Product): ProductFormData {
  if (!product) {
    return {
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      category: 'men',
      stock: '10',
      sizes: 'S,M,L,XL',
      colors: 'Black,White',
    };
  }

  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    discountPrice: product.discountPrice != null ? String(product.discountPrice) : '',
    category: product.category,
    stock: String(product.stock),
    sizes: product.sizes.join(','),
    colors: product.colors.join(','),
  };
}

function buildFormData(
  data: ProductFormData,
  files: FileList | null | undefined,
  existingImages: Product['images']
): FormData {
  const price = Number(data.price);
  const stock = Number(data.stock);
  const discountPrice = data.discountPrice ? Number(data.discountPrice) : undefined;

  const formData = new FormData();
  formData.append('name', data.name.trim());
  formData.append('description', data.description.trim());
  formData.append('price', String(price));
  formData.append('stock', String(stock));
  formData.append('category', data.category);

  if (discountPrice !== undefined) {
    formData.append('discountPrice', String(discountPrice));
  } else {
    formData.append('discountPrice', '');
  }

  const sizes = data.sizes.split(',').map((s) => s.trim()).filter(Boolean);
  const colors = data.colors.split(',').map((c) => c.trim()).filter(Boolean);
  formData.append('sizes', JSON.stringify(sizes));
  formData.append('colors', JSON.stringify(colors));
  formData.append('existingImages', JSON.stringify(existingImages));

  if (files && files.length > 0) {
    Array.from(files).forEach((file) => formData.append('images', file));
  }

  return formData;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!product;
  const [existingImages, setExistingImages] = useState<Product['images']>(product?.images ?? []);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(product),
  });

  useEffect(() => {
    reset(getDefaultValues(product));
    setExistingImages(product?.images ?? []);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [product, reset]);

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    const price = Number(data.price);
    const stock = Number(data.stock);
    const discountPrice = data.discountPrice ? Number(data.discountPrice) : undefined;

    if (Number.isNaN(price) || price < 0) {
      toast.error('Enter a valid price');
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      toast.error('Enter a valid stock amount');
      return;
    }
    if (discountPrice !== undefined && (Number.isNaN(discountPrice) || discountPrice < 0)) {
      toast.error('Enter a valid discount price');
      return;
    }

    const files = fileInputRef.current?.files;
    const formData = buildFormData(data, files, existingImages);

    try {
      if (isEditing && product) {
        await updateProduct({ id: product._id, body: formData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createProduct(formData).unwrap();
        toast.success('Product created successfully');
        reset(getDefaultValues());
        setExistingImages([]);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess?.();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(
        apiErr.data?.message ??
          (isEditing ? 'Failed to update product' : 'Failed to create product')
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <Label htmlFor="name">Product name</Label>
        <Input id="name" {...register('name')} placeholder="Classic Running Tee" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          placeholder="Describe the product..."
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="price">Price (₨)</Label>
        <Input id="price" type="number" step="0.01" {...register('price')} />
        {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
      </div>

      <div>
        <Label htmlFor="discountPrice">Discount price (optional)</Label>
        <Input id="discountPrice" type="number" step="0.01" {...register('discountPrice')} />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          {...register('category')}
          className="mt-1 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="children">Children</option>
        </select>
      </div>

      <div>
        <Label htmlFor="stock">Stock</Label>
        <Input id="stock" type="number" {...register('stock')} />
        {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
      </div>

      <div>
        <Label htmlFor="sizes">Sizes (comma-separated)</Label>
        <Input id="sizes" {...register('sizes')} placeholder="S,M,L,XL" />
        {errors.sizes && <p className="text-sm text-red-500">{errors.sizes.message}</p>}
      </div>

      <div>
        <Label htmlFor="colors">Colors (comma-separated)</Label>
        <Input id="colors" {...register('colors')} placeholder="Black,White,Blue" />
        {errors.colors && <p className="text-sm text-red-500">{errors.colors.message}</p>}
      </div>

      {isEditing && existingImages.length > 0 && (
        <div className="sm:col-span-2">
          <Label>Current images</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {existingImages.map((image, index) => (
              <div
                key={`${image.public_id}-${index}`}
                className="relative h-20 w-20 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700"
              >
                <Image src={image.url} alt="" fill className="object-cover" sizes="80px" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute right-0 top-0 bg-red-600 px-1 text-[10px] text-white"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sm:col-span-2">
        <Label htmlFor="images">
          {isEditing ? 'Add more images (optional, up to 5)' : 'Product images (optional, up to 5)'}
        </Label>
        <Input
          id="images"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="mt-1 cursor-pointer"
        />
      </div>

      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditing
              ? 'Saving...'
              : 'Creating...'
            : isEditing
              ? 'Save Changes'
              : 'Create Product'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
