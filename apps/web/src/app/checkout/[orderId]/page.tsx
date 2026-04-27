import { Suspense } from 'react';
import { DirectCheckout } from '@/components/checkout/DirectCheckout';

// Direct checkout page — used when the user navigates directly to /checkout/:id
// (bank redirects, bookmarks, etc.). Renders the PaymentDialog over a minimal background.
export default function CheckoutPage({ params }: { params: { orderId: string } }) {
  return (
    <Suspense>
      <DirectCheckout orderId={params.orderId} />
    </Suspense>
  );
}
