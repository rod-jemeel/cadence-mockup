"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { EnrollmentState } from "@repo/shared";
import { getEnrollmentState } from "@/lib/api/enrollments";

export function useEnrollmentState(enrollmentId: string) {
  const [state, setState] = useState<EnrollmentState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const data = await getEnrollmentState(enrollmentId);
      if (!cancelledRef.current) {
        setState(data);
        setError(null);
      }
      return data;
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Failed to fetch state");
      }
      return null;
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [enrollmentId]);

  useEffect(() => {
    cancelledRef.current = false;
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
    return () => {
      cancelledRef.current = true;
      clearInterval(interval);
    };
  }, [refresh]);

  return { state, error, loading, refresh };
}
