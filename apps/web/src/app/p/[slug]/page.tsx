import { Suspense } from 'react';
import { DetailClient } from '@/components/detail/DetailClient';

export const revalidate = 300;

export default function ProductPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense>
      <DetailClient slug={params.slug} />
    </Suspense>
  );
}
