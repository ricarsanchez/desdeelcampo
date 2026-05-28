"use client";

import type React from "react";
import type { NewsArticle } from "../../lib/news";

type NewsDraft = {
  title: string;
  content: string;
  date: string;
};

type NewsManagementFormProps = {
  news: NewsArticle[];
  newsDraft: NewsDraft;
  setNewsDraft: React.Dispatch<React.SetStateAction<NewsDraft>>;
  newsImageFile: File | null;
  setNewsImageFile: (file: File | null) => void;
  newsImagePreviewUrl: string | null;
  newsErrors: string[];
  newsApiError: string | null;
  onSaveNews: () => Promise<void>;
  onEditNews: (article: NewsArticle) => void;
  onCancelEdit: () => void;
  onDeleteNews: (id: string) => Promise<void>;
  isSavingNews: boolean;
  editingNewsId: string | null;
};

export function NewsManagementForm({
  news,
  newsDraft,
  setNewsDraft,
  newsImageFile,
  setNewsImageFile,
  newsImagePreviewUrl,
  newsErrors,
  newsApiError,
  onSaveNews,
  onEditNews,
  onCancelEdit,
  onDeleteNews,
  isSavingNews,
  editingNewsId,
}: NewsManagementFormProps) {
  const isEditing = Boolean(editingNewsId);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-800">Título</label>
          <input
            type="text"
            value={newsDraft.title}
            onChange={(e) => setNewsDraft((p) => ({ ...p, title: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ej: Remate especial de hacienda"
            disabled={isSavingNews}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">Fecha</label>
          <input
            type="date"
            value={newsDraft.date}
            onChange={(e) => setNewsDraft((p) => ({ ...p, date: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            disabled={isSavingNews}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-800">Contenido</label>
        <textarea
          value={newsDraft.content}
          onChange={(e) => setNewsDraft((p) => ({ ...p, content: e.target.value }))}
          rows={6}
          className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Describí la noticia con todos los datos relevantes."
          disabled={isSavingNews}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-800">Imagen opcional</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewsImageFile(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          disabled={isSavingNews}
        />
        {newsImagePreviewUrl && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Vista previa de la noticia</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={newsImagePreviewUrl}
              alt="Vista previa de la noticia"
              className="mt-2 w-full max-w-full rounded-xl bg-white object-contain ring-1 ring-slate-200"
            />
          </div>
        )}
      </div>

      {newsErrors.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-900">Revisá lo siguiente:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {newsErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {newsApiError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {newsApiError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSaveNews}
          disabled={isSavingNews || newsErrors.length > 0}
          className={
            "rounded-xl px-4 py-2 text-sm font-semibold text-white transition " +
            (isSavingNews || newsErrors.length > 0
              ? "bg-slate-300"
              : "bg-emerald-600 hover:bg-emerald-700")
          }
        >
          {isSavingNews ? (isEditing ? "Actualizando..." : "Guardando...") : isEditing ? "Actualizar noticia" : "Crear noticia"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            Cancelar edición
          </button>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-900">Noticias guardadas</h3>
        {news.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No hay noticias publicadas aún.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {news.map((article) => (
              <article
                key={article.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{article.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(article.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEditNews(article)}
                      className="rounded-full border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteNews(article.id)}
                      className="rounded-full border border-rose-600 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700 line-clamp-3">{article.content}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
