import { Suspense } from 'react';
import { SuccessClient } from '@/components/success/SuccessClient';

export default function OrderPage({ params }: { params: { id: string } }) {
  return <Suspense><SuccessClient orderId={params.id} /></Suspense>;
}
