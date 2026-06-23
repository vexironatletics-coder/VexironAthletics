'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useLazyExportOrdersReportQuery,
  useLazyDownloadDispatchReceiptQuery,
  useLazyDownloadInvoiceQuery,
} from '@/store/api/orderApi';
import { formatPrice } from '@/lib/utils';
import type { OrderStatus } from '@/lib/utils';
import { formatPaymentMethod } from '@/components/orders/OrderList';

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data, isLoading } = useGetAllOrdersQuery({
    status: statusFilter || undefined,
    page,
    limit: 15,
  });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [exportPdfReport] = useLazyExportOrdersReportQuery();
  const [downloadDispatchReceipt] = useLazyDownloadDispatchReceiptQuery();
  const [downloadInvoice] = useLazyDownloadInvoiceQuery();

  const downloadPdfBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDispatchReceipt = async (orderId: string) => {
    setDownloadingId(orderId);
    try {
      const blob = await downloadDispatchReceipt(orderId).unwrap();
      downloadPdfBlob(blob, `dispatch-receipt-${orderId.slice(-8)}.pdf`);
      toast.success('Dispatch receipt downloaded');
    } catch {
      toast.error('Failed to download dispatch receipt');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleInvoice = async (orderId: string) => {
    setDownloadingId(orderId);
    try {
      const blob = await downloadInvoice(orderId).unwrap();
      downloadPdfBlob(blob, `invoice-${orderId.slice(-8)}.pdf`);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  const exportCsv = () => {
    if (!data?.orders) return;
    const headers = ['ID', 'Date', 'Status', 'Total'];
    const rows = data.orders.map((o) => [
      o._id,
      new Date(o.createdAt).toISOString(),
      o.status,
      o.total,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadPdfBlob(blob, 'orders.csv');
  };

  const exportPdf = async () => {
    try {
      const blob = await exportPdfReport({}).unwrap();
      downloadPdfBlob(blob, 'orders-report.pdf');
    } catch {
      toast.error('Failed to export orders report');
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            Export PDF
          </Button>
        </div>
      </div>
      <select
        className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
      >
        <option value="">All Statuses</option>
        {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {isLoading ? (
        <p className="mt-4">Loading...</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--secondary)]/30">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Update</th>
                <th className="px-4 py-3 text-left">Documents</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders.map((order) => (
                <tr key={order._id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-8)}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{formatPaymentMethod(order.paymentMethod)}</p>
                    {order.paymentMethod === 'bank' && order.bankPaymentProof?.url && (
                      <a
                        href={order.bankPaymentProof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-[var(--accent)] hover:underline"
                      >
                        View proof
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--foreground)]"
                      value={order.status}
                      onChange={(e) =>
                        updateStatus({ id: order._id, status: e.target.value as OrderStatus })
                      }
                    >
                      {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={order.status === 'cancelled' || downloadingId === order._id}
                        onClick={() => handleDispatchReceipt(order._id)}
                      >
                        <Truck className="h-3.5 w-3.5" />
                        Dispatch PDF
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="gap-1.5"
                        disabled={downloadingId === order._id}
                        onClick={() => handleInvoice(order._id)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data?.pagination && data.pagination.pages > 1 && (
        <Pagination pagination={data.pagination} onPageChange={setPage} scrollToTop={false} />
      )}
    </ErrorBoundary>
  );
}
