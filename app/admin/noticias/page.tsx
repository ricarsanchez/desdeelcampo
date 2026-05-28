"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "../../../components/admin/AdminShell";
import { AdminSection } from "../../../components/admin/AdminSection";
import { NewsManagementForm } from "../../../components/admin/NewsManagementForm";
import type { NewsArticle } from "../../../lib/news";

type NewsDraft = {
  title: string;
  content: string;
  date: string;
};

const emptyDraft: NewsDraft = { title: "", content: "", date: "" };

export default function NoticiasAdminPage() {
  const [tab, setTab] = useState<"lotes" | "publicidad" | "noticias" | "precios">("noticias");
  const [preview, setPreview] = useState(false);

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsDraft, setNewsDraft] = useState<NewsDraft>({ ...emptyDraft });
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreviewUrl, setNewsImagePreviewUrl] = useState<string | null>(null);
  const [newsErrors, setNewsErrors] = useState<string[]>([]);
  const [newsApiError, setNewsApiError] = useState<string | null>(null);
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.noticias)) setNews(data.noticias);
      })
      .catch(() => setNewsApiError("No se pudieron cargar las noticias."));
  }, []);

  async function handleSaveNews() {
    const errors: string[] = [];
    if (!newsDraft.title.trim()) errors.push("El título es obligatorio.");
    if (!newsDraft.content.trim()) errors.push("El contenido es obligatorio.");
    if (!newsDraft.date) errors.push("La fecha es obligatoria.");
    setNewsErrors(errors);
    if (errors.length > 0) return;

    setIsSavingNews(true);
    setNewsApiError(null);
    try {
      const fd = new FormData();
      fd.append("title", newsDraft.title);
      fd.append("content", newsDraft.content);
      fd.append("date", newsDraft.date);
      if (editingNewsId) fd.append("id", editingNewsId);
      if (newsImageFile) fd.append("image", newsImageFile);

      const res = await fetch("/api/news", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar la noticia.");

      if (editingNewsId) {
        setNews((prev) => prev.map((n) => (n.id === editingNewsId ? data.article : n)));
      } else {
        setNews((prev) => [data.article, ...prev]);
      }
      setNewsDraft({ ...emptyDraft });
      setNewsImageFile(null);
      setNewsImagePreviewUrl(null);
      setEditingNewsId(null);
    } catch (err: unknown) {
      setNewsApiError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSavingNews(false);
    }
  }

  function handleEditNews(article: NewsArticle) {
    setEditingNewsId(article.id);
    setNewsDraft({ title: article.title, content: article.content, date: article.date });
    setNewsImagePreviewUrl(article.imageUrl ?? null);
  }

  function handleCancelEdit() {
    setEditingNewsId(null);
    setNewsDraft({ ...emptyDraft });
    setNewsImageFile(null);
    setNewsImagePreviewUrl(null);
  }

  async function handleDeleteNews(id: string) {
    try {
      const res = await fetch("/api/news", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error("Error al eliminar.");
      setNews((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setNewsApiError("No se pudo eliminar la noticia.");
    }
  }

  return (
    <AdminShell tab={tab} setTab={setTab} preview={preview} setPreview={setPreview}>
      <AdminSection title="Gestión de Noticias" description="Crear, editar y eliminar noticias del sitio.">
        <NewsManagementForm
          news={news}
          newsDraft={newsDraft}
          setNewsDraft={setNewsDraft}
          newsImageFile={newsImageFile}
          setNewsImageFile={setNewsImageFile}
          newsImagePreviewUrl={newsImagePreviewUrl}
          newsErrors={newsErrors}
          newsApiError={newsApiError}
          onSaveNews={handleSaveNews}
          onEditNews={handleEditNews}
          onCancelEdit={handleCancelEdit}
          onDeleteNews={handleDeleteNews}
          isSavingNews={isSavingNews}
          editingNewsId={editingNewsId}
        />
      </AdminSection>
    </AdminShell>
  );
}
