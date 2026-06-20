export interface BankTransferDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
}

export const getBankTransferDetails = (): BankTransferDetails => ({
  accountName: process.env.BANK_ACCOUNT_NAME ?? 'Vexiron Athletics',
  bankName: process.env.BANK_NAME ?? 'HBL - Habib Bank Limited',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? '12345678901234',
});

export const formatPaymentMethodLabel = (method: string): string => {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'bank') return 'Bank Transfer';
  return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};
