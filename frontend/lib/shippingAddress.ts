export const formatShippingPhones = (address: {
  phones?: string[];
  phone?: string;
}): string => {
  const phones =
    address.phones && address.phones.length > 0
      ? address.phones
      : address.phone
        ? [address.phone]
        : [];
  return phones.join(', ');
};
