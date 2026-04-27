// icons.jsx — minimal stroke icons (24x24 viewBox)
const Ic = ({ d, size = 18, fill = false, stroke = "currentColor", sw = 1.7, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? stroke : "none"} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d}
  </svg>
);

const Icons = {
  Search: (p) => <Ic {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>}/>,
  Bolt: (p) => <Ic {...p} d={<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>}/>,
  Diamond: (p) => <Ic {...p} d={<><path d="M6 3h12l3 5-9 13L3 8z"/><path d="M3 8h18"/><path d="m9 8 3 13"/><path d="m15 8-3 13"/><path d="M9 8 12 3l3 5"/></>}/>,
  Cart: (p) => <Ic {...p} d={<><path d="M3 3h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.5L22 6H6"/><circle cx="10" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></>}/>,
  User: (p) => <Ic {...p} d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>}/>,
  Bell: (p) => <Ic {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7"/><path d="M10 19a2 2 0 0 0 4 0"/></>}/>,
  Globe: (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>}/>,
  Check: (p) => <Ic {...p} d={<path d="m5 12 5 5L20 7"/>}/>,
  Chevron: (p) => <Ic {...p} d={<path d="m9 6 6 6-6 6"/>}/>,
  ChevronDown: (p) => <Ic {...p} d={<path d="m6 9 6 6 6-6"/>}/>,
  Arrow: (p) => <Ic {...p} d={<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>}/>,
  Back: (p) => <Ic {...p} d={<><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></>}/>,
  Lock: (p) => <Ic {...p} d={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>}/>,
  Shield: (p) => <Ic {...p} d={<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>}/>,
  Card: (p) => <Ic {...p} d={<><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 11h18"/><path d="M7 16h4"/></>}/>,
  Bank: (p) => <Ic {...p} d={<><path d="M3 10 12 4l9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M3 20h18"/></>}/>,
  Qr: (p) => <Ic {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1"/></>}/>,
  Copy: (p) => <Ic {...p} d={<><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>}/>,
  Star: (p) => <Ic {...p} d={<path d="m12 3 2.7 5.7 6.3.9-4.5 4.4 1 6.3L12 17.3 6.5 20.3l1-6.3L3 9.6l6.3-.9z"/>}/>,
  Fire: (p) => <Ic {...p} d={<path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 1-3s-1 5 2 5c0-3 1-5 1-5s4 3 4 6a6 6 0 1 1-12 0c0-7 8-11 8-11z"/>}/>,
  Sparkle: (p) => <Ic {...p} d={<><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="m6 6 3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></>}/>,
  Filter: (p) => <Ic {...p} d={<path d="M3 5h18l-7 9v6l-4-2v-4z"/>}/>,
  Clock: (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}/>,
  Info: (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></>}/>,
  Menu: (p) => <Ic {...p} d={<><path d="M4 7h16M4 12h16M4 17h16"/></>}/>,
  Home: (p) => <Ic {...p} d={<><path d="m3 11 9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/></>}/>,
  Receipt: (p) => <Ic {...p} d={<><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/></>}/>,
  Gift: (p) => <Ic {...p} d={<><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12"/><path d="M8 9a3 3 0 1 1 3-3c0 1.5-.5 3-3 3zM16 9a3 3 0 1 0-3-3c0 1.5.5 3 3 3z"/></>}/>,
  Plus: (p) => <Ic {...p} d={<><path d="M12 5v14M5 12h14"/></>}/>,
  X: (p) => <Ic {...p} d={<><path d="m6 6 12 12M18 6 6 18"/></>}/>,
  Battery: (p) => <Ic {...p} d={<><rect x="2" y="8" width="18" height="8" rx="2"/><path d="M22 11v2"/><rect x="4" y="10" width="14" height="4" rx="1" fill="currentColor" stroke="none"/></>}/>,
  Wifi: (p) => <Ic {...p} d={<><path d="M2 9a16 16 0 0 1 20 0"/><path d="M5 13a11 11 0 0 1 14 0"/><path d="M8.5 17a6 6 0 0 1 7 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></>}/>,
  Signal: (p) => <Ic {...p} d={<><path d="M2 20h2v-2H2zM7 20h2v-6H7zM12 20h2v-10h-2zM17 20h2v-14h-2z" fill="currentColor" stroke="none"/></>}/>,
};

window.Icons = Icons;
