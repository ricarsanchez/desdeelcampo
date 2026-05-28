import { readInstagramNewsCache } from "../../_utils/instagramNews";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let lastVersion = -1;

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      void readInstagramNewsCache().then((cache) => {
        lastVersion = cache.version;
        send({ type: "ready", version: cache.version, updatedAt: cache.updatedAt });
      });

      const intervalId = setInterval(() => {
        void readInstagramNewsCache().then((cache) => {
          if (cache.version !== lastVersion) {
            lastVersion = cache.version;
            send({ type: "refresh", version: cache.version, updatedAt: cache.updatedAt });
          }
        });
      }, 5000);

      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Connection: "keep-alive",
    },
  });
}
