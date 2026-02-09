"use client";

import { useState, useEffect, useCallback } from "react";
import type { EnrollmentState } from "@repo/shared";
import { getEnrollmentState } from "@/lib/api/enrollments";

export function useEnrollmentState(enrollmentId: string) {
  const [state, setState] = useState<EnrollmentState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getEnrollmentState(enrollmentId);
      setState(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch state");
      return null;
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(async () => {
      const data = await refresh();
      if (
        data &&
        (data.status === "COMPLETED" || data.status === "FAILED")
      ) {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { state, error, loading, refresh };
}
