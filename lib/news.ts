import { createId, readStoreData, writeStoreData } from "../app/api/_utils/store";
import type { NewsArticle } from "../app/api/_utils/store";

export type { NewsArticle };

export async function readNewsArticles(): Promise<NewsArticle[]> {
  const store = await readStoreData();
  return store.noticias ?? [];
}

export async function addNewsArticle(article: Omit<NewsArticle, "id">): Promise<NewsArticle> {
  const store = await readStoreData();
  const noticia: NewsArticle = {
    id: createId(),
    title: article.title,
    content: article.content,
    date: article.date,
    imageUrl: article.imageUrl,
  };

  await writeStoreData({
    ...store,
    noticias: [noticia, ...(store.noticias ?? [])],
  });

  return noticia;
}

export async function updateNewsArticle(
  id: string,
  updates: Partial<Omit<NewsArticle, "id">>,
): Promise<NewsArticle> {
  const store = await readStoreData();
  const currentNews = store.noticias ?? [];
  const index = currentNews.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("Noticia no encontrada");
  }

  const existing = currentNews[index];
  const updated: NewsArticle = {
    ...existing,
    ...updates,
    id,
    imageUrl: updates.imageUrl ?? existing.imageUrl,
  };

  const updatedNews = [...currentNews];
  updatedNews[index] = updated;

  await writeStoreData({
    ...store,
    noticias: updatedNews,
  });

  return updated;
}

export async function deleteNewsArticle(id: string): Promise<void> {
  const store = await readStoreData();
  const currentNews = store.noticias ?? [];
  const updatedNews = currentNews.filter((item) => item.id !== id);
  await writeStoreData({
    ...store,
    noticias: updatedNews,
  });
}
