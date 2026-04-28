'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TopNav } from '@/components/layout/TopNav';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { CategoryChips } from './CategoryChips';
import { GameGrid } from './GameGrid';
import { HeroCard } from './HeroCard';
import { useT } from '@/lib/i18n';

export function HomeClient() {
  const router        = useRouter();
  const t             = useT();
  const [query,    setQuery]    = useState('');
  const [debounced, setDebounced] = useState('');
  const [cat,      setCat]      = useState('all');

  // Debounce search input by 250ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  api.categories,
    staleTime: 5 * 60_000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', cat, debounced],
    queryFn:  () => api.products({
      category: cat === 'all' ? undefined : cat,
      q:        debounced || undefined,
    }),
  });

  const goDetail = (slug: string) => router.push(`/p/${slug}`);

  return (
    <>
      {/* Desktop ≥ md */}
      <div className="hidden md:flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
        <TopNav query={query} onSearch={setQuery} activeRoute="home" />
        <div className="route-content">
          <HeroCard />
          <section className="px-8 pt-4">
            <CategoryChips categories={categories} active={cat} onChange={setCat} />
          </section>
          <section className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora font-bold text-lg">
                {cat === 'all'
                  ? (debounced ? `${t('resultsFor')} "${debounced}"` : t('trendingNow'))
                  : categories.find((c: any) => c.slug === cat)?.label}
              </h3>
              <span className="text-[12.5px]" style={{ color: 'var(--muted)' }}>{products.length} {t('itemsCount')}</span>
            </div>
            {products.length === 0 ? (
              <div className="py-16 text-center" style={{ color: 'var(--muted)' }}>
                {t('noMatches')}{debounced ? ` for "${debounced}"` : ''}.
              </div>
            ) : (
              <GameGrid products={products} onSelect={goDetail} />
            )}
          </section>
        </div>
      </div>

      {/* Mobile < md */}
      <div className="md:hidden">
        <MobileLayout
          query={query}
          setQuery={setQuery}
          categories={categories}
          products={products}
          cat={cat}
          setCat={setCat}
          onSelect={goDetail}
        />
      </div>
    </>
  );
}
