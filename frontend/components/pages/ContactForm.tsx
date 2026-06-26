'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Message sent! We will get back to you within 24 hours.');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="not-prose space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your Name</Label>
          <Input id="name" placeholder="Ali Raza" {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" placeholder="Order issue, sizing question, return request…" {...register('subject')} />
        {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          rows={6}
          className="flex w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm transition-all placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
          placeholder="Describe your question or issue in detail…"
          {...register('message')}
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </Button>
      <p className="text-center text-xs text-[var(--muted)]">
        We typically reply within 24 hours · Mon–Sat
      </p>
    </form>
  );
}
