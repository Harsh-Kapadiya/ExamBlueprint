import Crumbs from './Crumbs';

/** Header for every page below home: the hero's grid and gradient title, at page size. */
export default function PageHeader({
  trail,
  title,
  meta,
  children,
}: {
  trail: [href: string, label: string][];
  title: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b bg-[linear-gradient(to_bottom,var(--background)_40%,var(--muted))]">
      <div aria-hidden className="grid-paper absolute inset-0 -z-10 opacity-80 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_55%,transparent_100%)]" />
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-10 md:px-6 md:pt-14 md:pb-14">
        <Crumbs trail={trail} />
        <h1 className="text-gradient mt-6 pb-2 text-4xl leading-[1.05] font-semibold tracking-tighter text-balance md:text-6xl">{title}</h1>
        {meta && <p className="mt-3 text-lg tracking-tight text-muted-foreground">{meta}</p>}
        {children}
      </div>
    </section>
  );
}
