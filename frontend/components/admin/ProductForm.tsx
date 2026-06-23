'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';
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
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
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
    setNewFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [product, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const previews = Array.from(files).slice(0, 5).map((f) => URL.createObjectURL(f));
    setNewFilePreviews(previews);
  };

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
      setNewFilePreviews([]);
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
      className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-2"
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
                className="relative h-20 w-20 overflow-hidden rounded-md border border-[var(--border)]"
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
        <Label>{isEditing ? 'Add more images' : 'Product images'}</Label>
        {/* <p className="mb-2 text-xs text-zinc-500">
          Images are uploaded to Cloudinary. Make sure{' '}
          <code className="rounded bg-zinc-100 px-1 text-[11px] dark:bg-zinc-800">
            CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
          </code>{' '}
          are set in Hostinger environment variables.
        </p> */}

        {/* Drop zone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--card)] px-4 py-8 text-[var(--muted)] transition hover:border-[var(--primary)] hover:opacity-80"
        >
          <Upload className="h-8 w-8 opacity-60" />
          <span className="text-sm font-medium">Click to choose images (up to 5)</span>
          <span className="text-xs">PNG, JPG, WEBP — max 5 MB each</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* New file previews */}
        {newFilePreviews.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-[var(--muted)]">
              Selected ({newFilePreviews.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {newFilePreviews.map((src, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-[var(--border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setNewFilePreviews([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-red-400 text-red-400 hover:opacity-80"
                aria-label="Clear selected files"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
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
