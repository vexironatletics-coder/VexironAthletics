'use client';

import { ChatWidget } from '@/components/chat/ChatWidget';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

/** Stacked floating support buttons — live chat above WhatsApp */
export function FloatingSupportButtons() {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div className="pointer-events-auto">
        <ChatWidget inline />
      </div>
      <div className="pointer-events-auto">
        <WhatsAppButton inline />
      </div>
    </div>
  );
}
