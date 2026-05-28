import type { NewsArticle } from "../lib/news";

export function NewsSection({ news }: { news: NewsArticle[] }) {
  return (
    <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700 tracking-[0.2em]">Noticias</p>
          <h2 className="mt-2 text-2xl font-extrabold text-stone-900">Últimas publicaciones</h2>
        </div>
        <p className="max-w-xl text-sm text-slate-600">
          Las noticias se cargan desde el panel de administración y se ordenan por fecha para que siempre veas las novedades más recientes.
        </p>
      </div>

      {news.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No hay noticias publicadas todavía.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {news.map((article) => (
            <article key={article.id} className="rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
              {article.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full max-w-full h-auto object-contain bg-white"
                />
              ) : (
                <div className="h-40 w-full bg-slate-100" />
              )}
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {new Date(article.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h3 className="mt-3 text-lg font-bold text-stone-900">{article.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">{article.content}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
