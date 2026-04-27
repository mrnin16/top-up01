'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ReturnInner() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const paymentId = params.get('paymentId');
    const status    = params.get('status');

    if (status === 'success' && paymentId) {
      // Extract orderId from paymentId (format: bank-<orderId>)
      const orderId = paymentId.replace(/^bank-/, '');
      router.replace(`/orders/${orderId}`);
    } else {
      router.replace('/');
    }
  }, [params, router]);

  return (
    <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg)' }}>
      <p style={{ color: 'var(--muted)' }}>Verifying payment…</p>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return <Suspense><ReturnInner /></Suspense>;
}
