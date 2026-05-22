import Link from "next/link";
import { getInstagramPosts } from "@/lib/instagram";

export default async function Home() {
  const posts = await getInstagramPosts();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-900">Desde el Campo</h1>
        <p className="text-zinc-600">
          Integración con webhook de Instagram para mostrar publicaciones en
          tiempo real.
        </p>
      </header>

      {posts.length === 0 ? (
        <section className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-zinc-600">
          No hay publicaciones disponibles. Configura las variables
          <code className="mx-1 rounded bg-zinc-200 px-1 py-0.5">
            INSTAGRAM_ACCESS_TOKEN
          </code>
          y
          <code className="mx-1 rounded bg-zinc-200 px-1 py-0.5">
            INSTAGRAM_USER_ID
          </code>
          para cargar el feed.
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <img
                src={post.mediaUrl}
                alt={post.caption || "Publicación de Instagram"}
                className="h-64 w-full object-cover"
                loading="lazy"
              />
              <div className="space-y-2 p-4">
                <p className="line-clamp-3 text-sm text-zinc-700">
                  {post.caption || "Sin descripción"}
                </p>
                {post.permalink ? (
                  <Link
                    href={post.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    Ver en Instagram
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
