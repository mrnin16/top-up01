'use client';
// Wrapper used when the user navigates directly to /checkout/:orderId
// (e.g. from a bank return, bookmark, or share link).
// Shows the PaymentDialog on a gradient background.
// The primary flow uses PaymentDialog as an overlay on the detail page.

import { useRouter } from 'next/navigation';
import { useQuery }  from '@tanstack/react-query';
import { api }       from '@/lib/api';
import { PaymentDialog } from './PaymentDialog';

interface Props { orderId: string; }

export function DirectCheckout({ orderId }: Props) {
  const router = useRouter();
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => api.order(orderId),
  });

  const product = order?.product ?? {};

  return (
    <div
      className="fixed inset-0"
      style={{
        background: product.gradFrom
          ? `radial-gradient(140% 130% at 50% 0%, ${product.gradFrom}, ${product.gradTo ?? product.gradFrom} 45%, #0b1226 72%)`
          : 'linear-gradient(135deg, #0b1226, #1a2244)',
      }}>
      {/* Faint product identity visible through the blur */}
      {order && (
        <div className="absolute top-16 inset-x-0 flex flex-col items-center text-white select-none pointer-events-none"
          style={{ opacity: 0.7 }}>
          <div className="w-16 h-16 rounded-[18px] grid place-items-center font-sora font-extrabold text-[22px] mb-3"
            style={{ background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.16)' }}>
            {product.emblem ?? '?'}
          </div>
          <p className="font-sora font-bold text-[18px] m-0">{product.title ?? 'Top-up'}</p>
          <p className="text-[12px] mt-1 opacity-60">{order.ref} · ${(order.totalCents / 100).toFixed(2)}</p>
        </div>
      )}

      {/* Dialog — always open, closing it goes back */}
      <PaymentDialog
        orderId={orderId}
        onClose={() => {
          if (window.history.length > 1) router.back();
          else router.push('/');
        }}
      />
    </div>
  );
}
