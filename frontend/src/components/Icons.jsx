/** Hand-tuned stroke icons. 20×20 viewBox. stroke="currentColor". */
const base = { viewBox: "0 0 20 20", width: 16, height: 16, fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export const I = {
  search: (p) => <svg {...base} {...p}><circle cx="9" cy="9" r="6"/><path d="m17 17-3.5-3.5"/></svg>,
  close:  (p) => <svg {...base} width="14" height="14" strokeWidth="1.8" {...p}><path d="M5 5l10 10M15 5 5 15"/></svg>,
  bag:    (p) => <svg {...base} {...p}><path d="M4 7h12l-1 10H5L4 7Z"/><path d="M7 7V5a3 3 0 0 1 6 0v2"/></svg>,
  user:   (p) => <svg {...base} {...p}><circle cx="10" cy="7" r="3"/><path d="M3 17c1.5-3 4-4 7-4s5.5 1 7 4"/></svg>,
  plus:   (p) => <svg {...base} width="14" height="14" strokeWidth="1.8" {...p}><path d="M10 4v12M4 10h12"/></svg>,
  minus:  (p) => <svg {...base} width="14" height="14" strokeWidth="1.8" {...p}><path d="M4 10h12"/></svg>,
  trash:  (p) => <svg {...base} width="14" height="14" {...p}><path d="M3 5h14M8 5V3h4v2m-6 0 1 12h6l1-12"/></svg>,
  arrow:  (p) => <svg {...base} width="14" height="14" {...p}><path d="M4 10h12m-4-4 4 4-4 4"/></svg>,
  arrowLeft: (p) => <svg {...base} width="14" height="14" {...p}><path d="M16 10H4m4-4-4 4 4 4"/></svg>,
  check:  (p) => <svg {...base} width="14" height="14" strokeWidth="1.8" {...p}><path d="m4 10 4 4 8-9"/></svg>,
  box:    (p) => <svg {...base} width="14" height="14" {...p}><path d="M3 6l7-3 7 3v8l-7 3-7-3V6Z"/><path d="m3 6 7 3 7-3M10 9v9"/></svg>,
  bolt:   (p) => <svg {...base} width="14" height="14" {...p}><path d="M11 2 4 11h5l-1 7 7-9h-5l1-7Z"/></svg>,
  logout: (p) => <svg {...base} width="14" height="14" {...p}><path d="M12 3h3v14h-3M8 7l-3 3 3 3M5 10h9"/></svg>,
  lock:   (p) => <svg {...base} width="14" height="14" {...p}><rect x="4" y="9" width="12" height="8" rx="1.5"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/></svg>,
  grid:   (p) => <svg {...base} width="14" height="14" {...p}><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/></svg>,
  people: (p) => <svg {...base} width="14" height="14" {...p}><circle cx="7" cy="7" r="2.5"/><circle cx="14" cy="8" r="2"/><path d="M2 16c.5-2.5 2.5-4 5-4s4.5 1.5 5 4M11 15c.5-1.8 2-3 3.5-3s3 1 3.5 3"/></svg>,
  chart: (p) => <svg {...base} width="14" height="14" {...p}><path d="M3 17V3m0 14h14M7 13v-3m4 3V7m4 6v-4"/></svg>,
  activity: (p) => <svg {...base} width="14" height="14" {...p}><path d="M3 10h3l2-5 4 10 2-5h3"/></svg>,
};
