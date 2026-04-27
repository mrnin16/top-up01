'use client';
interface Props {
  categories: any[];
  active: string;
  onChange: (cat: string) => void;
}

const ICON: Record<string, string> = {
  all: '✦', Bolt: '⚡', Star: '★', Gift: '🎁', Signal: '📶', Card: '💳',
};

export function CategoryChips({ categories, active, onChange }: Props) {
  const all = [{ slug: 'all', label: 'All', icon: 'all' }, ...categories];
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((c: any) => (
        <button
          key={c.slug}
          aria-pressed={active === c.slug}
          onClick={() => onChange(c.slug)}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border text-[13px] font-medium transition-all duration-150"
          style={{
            background:   active === c.slug ? 'var(--ink)'     : 'var(--surface)',
            color:        active === c.slug ? 'var(--surface)'  : 'var(--ink-2)',
            borderColor:  active === c.slug ? 'var(--ink)'     : 'var(--line)',
          }}
        >
          <span style={{ fontSize: 12 }}>{ICON[c.icon] ?? '●'}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}
