'use client';

import { ChatWidget } from '@/components/chat/ChatWidget';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

/** Stacked floating support buttons — live chat above WhatsApp */
export function FloatingSupportButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <ChatWidget inline />
      <WhatsAppButton inline />
    </div>
  );
}
