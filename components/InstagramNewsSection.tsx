"use client";

import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { InstagramPost } from "../lib/instagram";

type InstagramNewsSectionProps = {
  initialPosts?: InstagramPost[];
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function PostCard({ post }: { post: InstagramPost }) {
  return (
    <article className="card-hover bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-stone-700">{post.likes}</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-medium text-stone-800 leading-snug line-clamp-2 mb-2">{post.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-400">{post.date}</span>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
            <InstagramIcon className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function InstagramNewsSection({ initialPosts = [] }: InstagramNewsSectionProps) {
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts);

  useEffect(() => {
    let isActive = true;
    let stream: EventSource | null = null;

    async function loadPosts() {
      try {
        const response = await fetch("/api/instagram-news", { cache: "no-store" });
        const data = (await response.json()) as { ok?: boolean; posts?: InstagramPost[] };
        if (!isActive || !response.ok || !data.ok || !Array.isArray(data.posts)) {
          return;
        }
        if (data.posts.length > 0) {
          setPosts(data.posts);
        }
      } catch {
        // Mantiene los posts previos en caso de error temporal.
      }
    }

    stream = new EventSource("/api/instagram-news/stream");
    stream.onmessage = (event) => {
      if (!isActive) return;
      try {
        const payload = JSON.parse(event.data) as { type?: string };
        if (payload.type === "refresh") {
          void loadPosts();
        }
      } catch {
        // Ignora eventos mal formados.
      }
    };

    void loadPosts();
    const intervalId = window.setInterval(() => {
      void loadPosts();
    }, 300000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      stream?.close();
    };
  }, []);

  const visiblePosts = useMemo(() => posts.slice(0, 3), [posts]);
  const instagramLink = visiblePosts[0]?.permalink ?? "https://www.instagram.com/";

  return (
    <aside className="w-full lg:w-1/4 shrink-0">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
          <InstagramIcon className="w-3 h-3 text-white" />
        </div>
        <h2 className="font-bold text-stone-700 text-lg">Noticias</h2>
      </div>
      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <a
        href={instagramLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-stone-200 text-stone-500 text-sm font-medium hover:border-purple-400 hover:text-purple-600 transition-all"
      >
        Ver más en Instagram
      </a>
    </aside>
  );
}
