import { Suspense } from 'react';
import { HomeClient } from '@/components/home/HomeClient';

export const revalidate = 300;

export default function HomePage() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
