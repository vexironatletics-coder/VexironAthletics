'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { FieldErrors, UseFormRegister, UseFormWatch, Control } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ShippingFormData } from '@/lib/validators';

interface ShippingAddressFormProps {
  register: UseFormRegister<ShippingFormData>;
  control: Control<ShippingFormData>;
  errors: FieldErrors<ShippingFormData>;
  watch: UseFormWatch<ShippingFormData>;
}

export function ShippingAddressForm({
  register,
  control,
  errors,
  watch,
}: ShippingAddressFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'phones',
  });

  const phones = watch('phones');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="John Doe" {...register('name')} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Mobile Numbers</Label>
          {fields.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10"
              onClick={() => append({ number: '' })}
            >
              <Plus className="h-3.5 w-3.5" />
              Add number
            </Button>
          )}
        </div>
        <p className="mb-3 text-xs text-[var(--muted)]">
          At least one mobile number is required. Add alternate numbers for delivery updates.
        </p>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder={index === 0 ? '0300 1234567' : 'Alternate mobile number'}
                {...register(`phones.${index}.number`)}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove number"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors.phones?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.phones.message}</p>
        )}
        {errors.phones?.root?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.phones.root.message}</p>
        )}
        {Array.isArray(errors.phones) &&
          errors.phones.map((err, i) =>
            err?.number?.message ? (
              <p key={i} className="text-sm text-red-500">
                Number {i + 1}: {err.number.message}
              </p>
            ) : null
          )}
        {phones?.length === 5 && (
          <p className="mt-1 text-xs text-[var(--muted)]">Maximum 5 numbers reached.</p>
        )}
      </div>

      <div>
        <Label htmlFor="landmark">Famous Place / Landmark</Label>
        <Input
          id="landmark"
          placeholder="e.g. Near Centaurus Mall, F-10 Markaz, Packages Mall"
          {...register('landmark')}
        />
        {errors.landmark && <p className="text-sm text-red-500">{errors.landmark.message}</p>}
        <p className="mt-1 text-xs text-[var(--muted)]">
          A well-known nearby place so the rider can find you easily.
        </p>
      </div>

      <div>
        <Label htmlFor="street">Your Place / House Address</Label>
        <Input
          id="street"
          placeholder="House #, Street, Sector, Block"
          {...register('street')}
        />
        {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Islamabad" {...register('city')} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" placeholder="Punjab" {...register('state')} />
          {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
        </div>
        <div>
          <Label htmlFor="postal">Postal Code</Label>
          <Input id="postal" placeholder="44000" {...register('postal')} />
          {errors.postal && <p className="text-sm text-red-500">{errors.postal.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register('country')} />
        {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
      </div>
    </div>
  );
}
