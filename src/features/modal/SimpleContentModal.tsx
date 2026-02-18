export default function SimpleContentModal({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-300">
        Tohle je moderní šablona pro sekci <span className="font-semibold text-slate-100">{title}</span>. Obsah je
        připravený tak, aby se dal snadno doplnit (texty, odkazy, fotky, karty lidí, články…).
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Karty" desc="Jednotný styl, stíny, hover, klik." />
        <Card title="Komponenty" desc="Text + CTA tlačítka + odkazy." />
        <Card title="Animace" desc="Jemné framer-motion přechody." />
        <Card title="Responsivita" desc="Mobil / tablet / desktop." />
      </div>
    </div>
  )
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-300">{desc}</div>
    </div>
  )
}
