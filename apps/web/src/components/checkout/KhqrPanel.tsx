'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useT } from '@/lib/i18n';

interface Props {
  merchantImageUrl?: string | null;  // admin-uploaded KHQR (preferred)
  qrString:         string;          // dynamically generated fallback
  merchantName?:    string | null;
  fmtTimer:         string;
  scanning:         boolean;
  total:            number;
  onSimulate:       () => void;
}

export function KhqrPanel({
  merchantImageUrl,
  qrString,
  merchantName,
  fmtTimer,
  scanning,
  total,
  onSimulate,
}: Props) {
  const t = useT();
  const [shared,      setShared]      = useState(false);
  const [imageError,  setImageError]  = useState(false);

  const showUploadedImage = !!(merchantImageUrl && !imageError);

  // ── Web Share API ──────────────────────────────────────────────────────────
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleShare = async () => {
    try {
      if (merchantImageUrl && canShare) {
        // Fetch the image as a blob so the native share sheet can offer "Save to Photos"
        try {
          const blob = await fetch(merchantImageUrl).then(r => r.blob());
          const file = new File([blob], 'khqr-payment.jpg', { type: blob.type });
          await navigator.share({
            title:  `Pay $${total.toFixed(2)} via KHQR`,
            text:   `Scan this KHQR to pay $${total.toFixed(2)}${merchantName ? ` to ${merchantName}` : ''}.`,
            files:  [file],
          });
        } catch {
          // If sharing files isn't supported, fall back to URL share
          await navigator.share({
            title: `Pay $${total.toFixed(2)} via KHQR`,
            text:  `Scan this KHQR to pay $${total.toFixed(2)}${merchantName ? ` to ${merchantName}` : ''}.`,
            url:   merchantImageUrl,
          });
        }
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      // User cancelled share — do nothing
    }
  };

  // ── Save / download image ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!merchantImageUrl) return;
    try {
      const blob = await fetch(merchantImageUrl).then(r => r.blob());
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'khqr-payment.jpg';
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
  };

  return (
    <div className="mt-4 rounded-2xl border-2 overflow-hidden"
      style={{
        background:  'var(--surface-2)',
        borderColor: 'color-mix(in oklab, var(--success) 40%, var(--line))',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)', animation: 'pulse 1.4s infinite' }} />
          <span className="text-[13px] font-semibold">
            {showUploadedImage ? t('scanToPay') : `${t('expires')} ${fmtTimer}`}
          </span>
          {merchantName && (
            <span className="text-[12px]" style={{ color: 'var(--muted)' }}>· {merchantName}</span>
          )}
        </div>
        <span className="font-sora font-bold text-[16px]">${total.toFixed(2)}</span>
      </div>

      {/* QR image */}
      <div className="flex flex-col sm:flex-row gap-5 items-center p-4">

        {/* ── Merchant's uploaded KHQR (preferred) ── */}
        <div className="relative flex-none mx-auto sm:mx-0">
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              width:     200,
              height:    200,
              boxShadow: 'var(--shadow-md)',
              border:    '1px solid var(--line)',
            }}>
            {showUploadedImage ? (
              <img
                src={merchantImageUrl!}
                alt="KHQR payment"
                className="w-full h-full object-contain p-2"
                onError={() => setImageError(true)}
              />
            ) : (
              /* Fallback: generated QR code (no image uploaded or image failed) */
              <div className="w-full h-full p-3 grid place-items-center">
                <QRCodeSVG value={qrString} size={174} />
              </div>
            )}
          </div>

          {/* KHQR logo badge at top-right */}
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: '#e11d48' }}>
            KHQR
          </div>
        </div>

        {/* ── Instructions + actions ── */}
        <div className="flex-1 text-center sm:text-left">
          <h4 className="font-sora font-bold text-[15px] mb-1.5">
            {showUploadedImage ? t('openBankingScan') : t('scanKhqrApp')}
          </h4>
          <p className="text-[12px] mb-4" style={{ color: 'var(--muted)' }}>
            ABA · ACLEDA · Wing · Chip Mong · TrueMoney &amp; more
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">

            {/* Share button — only on mobile (Web Share API) */}
            {canShare && merchantImageUrl && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[12px] font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--brand)', borderColor: 'var(--brand)', color: '#fff' }}>
                {shared ? t('shared') : t('shareQr')}
              </button>
            )}

            {/* Save / Download */}
            {merchantImageUrl && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[12px] font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
                {t('saveImageLong')}
              </button>
            )}

            {/* Simulate (dev only) */}
            <button
              onClick={onSimulate}
              disabled={scanning}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[12px] font-medium transition-all hover:opacity-80${scanning?' btn-busy':''}`}
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}>
              {scanning ? t('waiting') : t('simulateScan')}
            </button>
          </div>

          {/* Amount reminder */}
          <div className="mt-4 p-3 rounded-xl text-[12px]"
            style={{ background: 'color-mix(in oklab, var(--brand) 7%, var(--surface))', border: '1px solid color-mix(in oklab, var(--brand) 20%, var(--line))' }}>
            {t('enterLabel')} <b>${total.toFixed(2)} {t('transferAmountHint')}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
