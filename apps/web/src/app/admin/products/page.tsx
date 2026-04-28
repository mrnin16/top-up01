'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [bulkPct, setBulkPct] = useState(0);
  const [saving, setSaving]   = useState<string | null>(null);
  const [changes, setChanges] = useState<Record<string, any>>({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn:  api.admin.products,
  });

  const change = (id: string, key: string, val: any) =>
    setChanges(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), [key]: val } }));

  const get = (product: any, key: string) =>
    changes[product.id]?.[key] !== undefined ? changes[product.id][key] : product[key];

  const saveProduct = async (id: string) => {
    if (!changes[id]) return;
    setSaving(id);
    try {
      await api.admin.updateProduct(id, changes[id]);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
      setChanges(prev => { const n = { ...prev }; delete n[id]; return n; });
    } finally { setSaving(null); }
  };

  const bulkMut = useMutation({
    mutationFn: () => api.admin.discountAll(bulkPct),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      setChanges({});
    },
  });

  // Each product has two upload zones: product art + currency icon
  const productImgRef  = useRef<Record<string, HTMLInputElement | null>>({});
  const currencyImgRef = useRef<Record<string, HTMLInputElement | null>>({});

  const uploadImage = async (productId: string, field: 'imageUrl' | 'currencyImageUrl', file: File) => {
    const res = await api.admin.upload(file);
    change(productId, field, res.url);
  };

  if (isLoading) {
    return <div className="flex flex-col gap-3">
      {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
    </div>;
  }

  return (
    <div className="route-content">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sora font-bold text-2xl m-0">Products</h1>

        {/* Bulk discount */}
        <div className="flex items-center gap-3 p-3 rounded-xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
          <span className="text-[13px] font-medium" style={{ color: 'var(--muted)' }}>Apply to ALL:</span>
          <input type="number" min={0} max={100}
            className="w-16 h-8 px-2 rounded-lg border text-center text-[14px] outline-none"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            value={bulkPct}
            onChange={e => setBulkPct(Math.min(100, Math.max(0, Number(e.target.value))))} />
          <span className="text-[13px]" style={{ color: 'var(--muted)' }}>% off</span>
          <button
            onClick={() => { if (bulkPct === 0 && !confirm('Apply 0% removes all discounts. Continue?')) return; bulkMut.mutate(); }}
            disabled={bulkMut.isPending}
            className="px-4 h-8 rounded-lg text-[12.5px] font-semibold text-white"
            style={{ background: 'var(--brand)' }}>
            {bulkMut.isPending ? '…' : 'Apply all'}
          </button>
          {bulkMut.isSuccess && <span className="text-[11px]" style={{ color: 'var(--success)' }}>✓ Done</span>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {products.map((p: any) => {
          const dirty           = !!changes[p.id];
          const discount        = get(p, 'discountPercent');
          const vip             = get(p, 'vip');
          const active          = get(p, 'active');
          const hot             = get(p, 'hot');
          const imageUrl        = get(p, 'imageUrl');
          const currencyImgUrl  = get(p, 'currencyImageUrl');

          return (
            <div key={p.id} className="p-4 rounded-2xl border"
              style={{
                background:  dirty ? 'color-mix(in oklab, var(--brand) 4%, var(--surface))' : 'var(--surface)',
                borderColor: dirty ? 'color-mix(in oklab, var(--brand) 40%, var(--line))'   : 'var(--line)',
                boxShadow:   'var(--shadow-sm)',
              }}>

              <div className="flex gap-4">
                {/* ── Left: two upload zones ── */}
                <div className="flex-none flex flex-col gap-2">

                  {/* Product card art */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--muted)' }}>Card art</p>
                    <div
                      className="w-20 h-20 rounded-2xl grid place-items-center font-sora font-extrabold text-2xl text-white cursor-pointer relative overflow-hidden group"
                      style={{ background: `radial-gradient(120% 100% at 30% 20%, ${p.gradFrom}, ${p.gradTo} 60%)` }}
                      onClick={() => productImgRef.current[p.id]?.click()}
                      title="Click to upload card image">
                      {imageUrl
                        ? <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        : <span className="relative z-10">{p.emblem}</span>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white text-2xl z-20">📷</div>
                    </div>
                    <input type="file" accept="image/*" className="hidden"
                      ref={el => { productImgRef.current[p.id] = el; }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(p.id, 'imageUrl', f); }} />
                  </div>

                  {/* Currency icon (diamond / gem / coin) */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--muted)' }}>Currency icon</p>
                    <div
                      className="w-20 h-20 rounded-2xl grid place-items-center cursor-pointer relative overflow-hidden group border-2 border-dashed"
                      style={{
                        background:  currencyImgUrl ? 'transparent' : 'var(--surface-2)',
                        borderColor: currencyImgUrl ? 'var(--brand)' : 'var(--line-strong)',
                      }}
                      onClick={() => currencyImgRef.current[p.id]?.click()}
                      title="Click to upload currency icon (diamond/gem/coin)">
                      {currencyImgUrl ? (
                        <img src={currencyImgUrl} alt="currency" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center">
                          <span className="text-3xl block">💎</span>
                          <span className="text-[9px] mt-1 block" style={{ color: 'var(--muted)' }}>Upload icon</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white text-xl z-20">📷</div>
                    </div>
                    <input type="file" accept="image/*" className="hidden"
                      ref={el => { currencyImgRef.current[p.id] = el; }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(p.id, 'currencyImageUrl', f); }} />
                    {currencyImgUrl && (
                      <button
                        className="mt-1 text-[10px] w-full text-center"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => change(p.id, 'currencyImageUrl', null)}>
                        ✕ Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Middle: controls ── */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="w-3 h-3 rounded-full flex-none" style={{ background: p.gradFrom }} />
                    <b className="font-sora font-bold text-[15px]">{p.title}</b>
                    <span className="text-[12px]" style={{ color: 'var(--muted)' }}>{p.sub}</span>
                    {vip     && <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase text-white" style={{ background: '#fbbf24' }}>VIP</span>}
                    {hot     && <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase text-white" style={{ background: '#ef4444' }}>HOT</span>}
                    {!active && <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase text-white" style={{ background: 'var(--danger)' }}>INACTIVE</span>}
                    {discount > 0 && <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold" style={{ background: '#dcfce7', color: '#15803d' }}>{discount}% OFF</span>}
                  </div>

                  <p className="text-[11.5px] mb-3" style={{ color: 'var(--muted)' }}>
                    {p._count.orders} orders · {p.packages.length} packages · {p.category.label} · currency: <b>{p.currencyLabel}</b>
                  </p>

                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Sort order */}
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium" style={{ color: 'var(--ink-2)' }}>Order</span>
                      <input type="number" min={0} step={1}
                        className="w-16 h-8 px-2 rounded-lg border text-center text-[13px] outline-none font-mono"
                        style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                        value={get(p, 'sortOrder') ?? 0}
                        onChange={e => change(p.id, 'sortOrder', parseInt(e.target.value) || 0)}
                        title="Lower number = appears first in catalog"
                      />
                    </div>

                    {/* Discount slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium" style={{ color: 'var(--ink-2)' }}>Discount</span>
                      <input type="range" min={0} max={60} step={5}
                        className="w-28"
                        style={{ accentColor: 'var(--brand)' }}
                        value={discount}
                        onChange={e => change(p.id, 'discountPercent', Number(e.target.value))} />
                      <span className="w-10 text-center font-sora font-bold text-[14px]"
                        style={{ color: discount > 0 ? 'var(--success)' : 'var(--muted)' }}>
                        {discount}%
                      </span>
                    </div>

                    {/* Toggle switches */}
                    {[
                      { key: 'vip',    label: 'VIP',    icon: '⭐', val: vip    },
                      { key: 'hot',    label: 'Hot',    icon: '🔥', val: hot    },
                      { key: 'active', label: 'Active', icon: '✅', val: active },
                    ].map(t => (
                      <label key={t.key} className="flex items-center gap-1.5 cursor-pointer select-none text-[12.5px] font-medium">
                        <span>{t.icon}</span>
                        <span style={{ color: 'var(--ink-2)' }}>{t.label}</span>
                        <button role="switch" aria-checked={t.val}
                          onClick={() => change(p.id, t.key, !t.val)}
                          className="relative w-9 h-5 rounded-full transition-all"
                          style={{ background: t.val ? 'var(--brand)' : 'var(--line-strong)' }}>
                          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                            style={{ left: 2, transform: t.val ? 'translateX(16px)' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
                        </button>
                      </label>
                    ))}
                  </div>

                  {/* Package price preview */}
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {p.packages.slice(0, 4).map((pkg: any) => {
                      const orig  = pkg.priceCents / 100;
                      const after = +(orig * (1 - discount / 100)).toFixed(2);
                      return (
                        <div key={pkg.id} className="text-[11px] px-2 py-1 rounded-lg"
                          style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
                          {pkg.amount.toLocaleString()}{pkg.bonus ? `+${pkg.bonus}` : ''} →{' '}
                          {discount > 0
                            ? <><s>${orig.toFixed(2)}</s> <span style={{ color: 'var(--success)' }}>${after}</span></>
                            : `$${orig.toFixed(2)}`
                          }
                        </div>
                      );
                    })}
                    {p.packages.length > 4 && <span className="text-[11px]" style={{ color: 'var(--muted-2)' }}>+{p.packages.length - 4} more</span>}
                  </div>
                </div>

                {/* ── Right: save button ── */}
                <div className="flex-none flex items-center">
                  <button
                    disabled={!dirty || saving === p.id}
                    onClick={() => saveProduct(p.id)}
                    className="px-4 h-10 rounded-xl text-[12.5px] font-semibold transition-all whitespace-nowrap"
                    style={{
                      background: dirty ? 'var(--brand)'    : 'var(--surface-2)',
                      color:      dirty ? '#fff'             : 'var(--muted-2)',
                      boxShadow:  dirty ? '0 4px 12px -2px color-mix(in oklab, var(--brand) 35%, transparent)' : 'none',
                    }}>
                    {saving === p.id ? 'Saving…' : dirty ? '💾 Save' : 'Saved'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
