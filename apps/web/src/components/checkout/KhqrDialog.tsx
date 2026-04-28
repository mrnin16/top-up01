'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/lib/i18n';

interface Props {
  /** Merchant's uploaded KHQR image URL */
  imageUrl?:     string | null;
  /** Dynamically-generated fallback QR string (if no image) */
  qrString?:     string;
  merchantName?: string | null;
  total:         number;
  orderRef:      string;
  scanning:      boolean;
  onSimulate:    () => void;
  onClose:       () => void;
}

export function KhqrDialog({
  imageUrl,
  qrString,
  merchantName,
  total,
  orderRef,
  scanning,
  onSimulate,
  onClose,
}: Props) {
  const t = useT();
  const [shared,     setShared]     = useState(false);
  const [imageError, setImageError] = useState(false);
  const [timer,      setTimer]      = useState(599);

  const showImage = !!(imageUrl && !imageError);
  const canShare  = typeof navigator !== 'undefined' && !!navigator.share;

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape key to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setTimer(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const fmtTimer = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!imageUrl) return;
    try {
      // Try sharing the image file directly (iOS shows "Save to Photos")
      const blob = await fetch(imageUrl).then(r => r.blob());
      const file = new File([blob], 'khqr.jpg', { type: blob.type });
      await navigator.share({
        title: `KHQR — Pay $${total.toFixed(2)}`,
        text:  `Scan to pay $${total.toFixed(2)}${merchantName ? ` to ${merchantName}` : ''}. Order ${orderRef}.`,
        files: [file],
      });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // user cancelled or browser doesn't support file share — try URL fallback
      try {
        await navigator.share({
          title: `KHQR — Pay $${total.toFixed(2)}`,
          text:  `Scan to pay $${total.toFixed(2)}${merchantName ? ` to ${merchantName}` : ''}. Order ${orderRef}.`,
          url:   imageUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch { /* user cancelled */ }
    }
  };

  // ── Save / download ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!imageUrl) return;
    try {
      const blob = await fetch(imageUrl).then(r => r.blob());
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `khqr-${orderRef}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    /* ── Backdrop (blurred — detail page still visible behind) ── */
    <div
      data-khqr-dialog="backdrop"
      className="fixed inset-0 flex flex-col justify-end sm:justify-center sm:items-center sm:p-6"
      style={{ zIndex: 9999, backdropFilter: 'blur(16px) saturate(1.4)', background: 'rgba(8,12,24,.52)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={e => { if (e.target === e.currentTarget) onClose(); }}>

      {/* ── Dialog panel ── */}
      <div
        data-khqr-dialog="panel"
        className="relative w-full sm:max-w-[420px] rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col"
        style={{
          background: 'var(--surface)',
          maxHeight:  '92vh',
          boxShadow:  '0 -16px 56px rgba(0,0,0,.38), 0 0 0 1px rgba(255,255,255,.06)',
        }}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 flex-none sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line-strong)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 flex-none border-b"
          style={{ borderColor: 'var(--line)' }}>
          <div>
            <h2 className="font-sora font-bold text-[17px] m-0">{t('scanToPay')}</h2>
            <p className="text-[12px] m-0 mt-0.5" style={{ color: 'var(--muted)' }}>
              {merchantName && <><b>{merchantName}</b> · </>}
              <span className="font-mono">{orderRef}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl grid place-items-center border text-[16px] transition-all hover:scale-95"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
            ✕
          </button>
        </div>

        {/* QR Image */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col items-center" style={{ scrollbarWidth: 'none' }}>

          {/* Amount badge */}
          <div className="mb-4 px-5 py-2.5 rounded-2xl font-sora font-bold text-[28px] text-center"
            style={{ background: 'color-mix(in oklab, var(--brand) 8%, var(--surface-2))', color: 'var(--brand)' }}>
            ${total.toFixed(2)} <span className="text-[14px] font-normal" style={{ color: 'var(--muted)' }}>USD</span>
          </div>

          {/* KHQR image / QR code */}
          <div
            className="relative bg-white rounded-3xl overflow-hidden"
            style={{
              width:     260,
              height:    260,
              boxShadow: '0 8px 32px rgba(0,0,0,.14)',
              border:    '2px solid var(--line)',
            }}>

            {showImage ? (
              <img
                src={imageUrl!}
                alt="KHQR"
                className="w-full h-full object-contain p-3"
                onError={() => setImageError(true)}
              />
            ) : qrString ? (
              /* Fallback: dynamically generated QR */
              <div className="w-full h-full grid place-items-center p-4">
                {/* dynamic import of QRCodeSVG to avoid SSR issues */}
                <QrFallback value={qrString} />
              </div>
            ) : (
              <div className="w-full h-full grid place-items-center">
                <div className="w-10 h-10 rounded-full border-4 animate-spin"
                  style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
              </div>
            )}

            {/* KHQR badge */}
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[11px] font-bold text-white"
              style={{ background: '#e11d48' }}>KHQR</div>
          </div>

          {/* Timer + instructions */}
          <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ color: timer < 60 ? 'var(--danger)' : 'var(--muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: timer < 60 ? 'var(--danger)' : 'var(--success)', animation: 'pulse 1.4s infinite' }} />
            {t('expiresIn')} {fmtTimer}
          </div>

          <p className="mt-2 text-[12.5px] text-center" style={{ color: 'var(--muted)' }}>
            {t('khqrInstructions')} <b>${total.toFixed(2)}</b> {t('asTheAmount')}
          </p>

          {/* Action row */}
          <div className="flex gap-2.5 mt-4 w-full justify-center flex-wrap">

            {/* Share (mobile Web Share API) */}
            {canShare && imageUrl && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-85"
                style={{ background: 'var(--brand)', color: '#fff', boxShadow: '0 4px 12px -2px color-mix(in oklab, var(--brand) 40%, transparent)' }}>
                {shared ? t('shared') : t('share')}
              </button>
            )}

            {/* Save / Download */}
            {imageUrl && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all hover:opacity-85"
                style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
                {t('saveImage')}
              </button>
            )}

            {/* Dev simulate */}
            <button
              onClick={onSimulate}
              disabled={scanning}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all hover:opacity-85${scanning?' btn-busy':''}`}
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}>
              {scanning ? t('waiting') : t('simulateAction')}
            </button>
          </div>
        </div>

        {/* Footer: pay confirmation */}
        <div className="flex-none px-5 py-4 border-t"
          style={{ borderColor: 'var(--line)', background: 'color-mix(in oklab, var(--surface) 96%, transparent)', backdropFilter: 'blur(10px)' }}>
          <button
            onClick={onSimulate}
            disabled={scanning}
            className={`w-full h-12 rounded-xl font-semibold text-[14.5px] flex items-center justify-center gap-2 transition-all${scanning?' btn-busy':''}`}
            style={{
              background: 'var(--brand)',
              color:      '#fff',
              border:     0,
              boxShadow:  scanning ? 'none' : '0 8px 20px -4px color-mix(in oklab, var(--brand) 40%, transparent)',
            }}>
            {scanning ? t('verifyingPayment') : t('iHavePaidConfirm')}
          </button>
          <p className="mt-2 text-[11px] text-center" style={{ color: 'var(--muted)' }}>
            {t('clickAfterPaid')}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Lazy QR fallback to avoid SSR issues with qrcode.react
function QrFallback({ value }: { value: string }) {
  const t = useT();
  const [QR, setQR] = useState<any>(null);
  useEffect(() => {
    import('qrcode.react').then(m => setQR(() => m.QRCodeSVG));
  }, []);
  if (!QR) return <div className="w-full h-full grid place-items-center text-sm" style={{ color: 'var(--muted)' }}>{t('processing')}</div>;
  return <QR value={value} size={220} />;
}
