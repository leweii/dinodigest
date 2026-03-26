"use client";

import { useState, useEffect, useCallback } from "react";

interface DigestEvent {
  type: "status" | "progress" | "result" | "error";
  message?: string;
  percent?: number;
  error?: string;
  moduleId?: string;
  moduleName?: string;
}

export function useDigestEvents(articleId: string) {
  const [events, setEvents] = useState<DigestEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "open" | "done" | "error">(
    "connecting",
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const source = new EventSource(`/api/digest/${articleId}/events`);

    source.onopen = () => setStatus("open");

    source.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as DigestEvent;
        setEvents((prev) => [...prev, event]);

        if (event.type === "progress" && event.percent !== undefined) {
          setProgress(event.percent);
        }

        if (
          event.type === "status" &&
          event.message === "消化完成！"
        ) {
          setStatus("done");
          source.close();
        }

        if (event.type === "error" && !event.message?.includes("recoverable")) {
          setStatus("error");
          source.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    source.onerror = () => {
      setStatus("error");
      source.close();
    };

    return () => source.close();
  }, [articleId]);

  const latestStatus = events.filter((e) => e.type === "status").at(-1)?.message ?? "";

  return { events, status, progress, latestStatus };
}
