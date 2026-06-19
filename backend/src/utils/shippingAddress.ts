import type { IShippingAddress } from '../models/Order';

const cleanPhone = (phone: string): string => phone.replace(/\s+/g, ' ').trim();

export const normalizeShippingAddress = (
  input: Partial<IShippingAddress> & { phone?: string }
): IShippingAddress => {
  const fromArray = (input.phones ?? []).map(cleanPhone).filter(Boolean);
  const phones =
    fromArray.length > 0
      ? fromArray
      : input.phone
        ? [cleanPhone(input.phone)]
        : [];

  if (phones.length === 0) {
    throw new Error('At least one mobile number is required');
  }

  return {
    name: input.name?.trim() ?? '',
    phones,
    phone: phones[0],
    landmark: input.landmark?.trim() ?? '',
    street: input.street?.trim() ?? '',
    city: input.city?.trim() ?? '',
    state: input.state?.trim() ?? '',
    postal: input.postal?.trim() ?? '',
    country: input.country?.trim() ?? '',
  };
};

export const formatShippingPhones = (address: Partial<IShippingAddress> & { phone?: string }): string => {
  const phones =
    address.phones && address.phones.length > 0
      ? address.phones
      : address.phone
        ? [address.phone]
        : [];
  return phones.join(', ');
};

export const formatShippingAddressBlock = (
  address: Partial<IShippingAddress> & { phone?: string }
): string => {
  const lines: string[] = [];
  if (address.landmark) {
    lines.push(`Near: ${address.landmark}`);
  }
  if (address.street) {
    lines.push(address.street);
  }
  const cityLine = [address.city, address.state, address.postal].filter(Boolean).join(', ');
  if (cityLine) lines.push(cityLine);
  if (address.country) lines.push(address.country);
  const phones = formatShippingPhones(address);
  if (phones) lines.push(`Mobile: ${phones}`);
  return lines.join('\n');
};
