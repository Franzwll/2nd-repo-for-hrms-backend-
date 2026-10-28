import { useEffect, useState } from "react";
import { essApi, type ApiEssEmployee } from "@/lib/api";
import { getUser } from "@/lib/auth";

type CacheEntry = {
  key: string;
  employee: ApiEssEmployee;
};

let cache: CacheEntry | null = null;
let inflight: { key: string; promise: Promise<ApiEssEmployee | null> } | null = null;

function sessionKey() {
  const user = getUser();
  return user?.email ?? "anonymous";
}

/** Live ESS profile for the signed-in employee. Cached per session. */
export function useEssProfile() {
  const key = sessionKey();
  const [employee, setEmployee] = useState<ApiEssEmployee | null>(
    cache?.key === key ? cache.employee : null,
  );
  const [loading, setLoading] = useState(cache?.key !== key);

  useEffect(() => {
    let active = true;
    const activeKey = sessionKey();

    if (cache?.key === activeKey) {
      setEmployee(cache.employee);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    if (!inflight || inflight.key !== activeKey) {
      inflight = {
        key: activeKey,
        promise: essApi
          .overview()
          .then((overview) => {
            cache = { key: activeKey, employee: overview.employee };
            return overview.employee;
          })
          .catch(() => null)
          .finally(() => {
            if (inflight?.key === activeKey) inflight = null;
          }),
      };
    }

    inflight.promise.then((profile) => {
      if (!active) return;
      setEmployee(profile);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [key]);

  return { employee, loading };
}

/** Drop the cached profile, e.g. after the employee record is updated. */
export function clearEssProfileCache() {
  cache = null;
  inflight = null;
}
