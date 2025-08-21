import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Flags = Record<string, boolean | undefined>;

/**
 * Single source of truth for ?tab=
 * - Reads initial tab from querystring (respects feature flags)
 * - Writes changes back to URL (push/replace)
 * - Listens to back/forward via popstate
 * - Auto-corrects if current tab becomes invalid due to flags
 */
export function useUrlTab(
  allowedTabs: string[],
  defTab: string,
  featureFlags: Flags = {}
) {
  const [ , nav ] = useLocation();

  const gated = useMemo(
    () => allowedTabs.filter(t => featureFlags[t] !== false),
    [allowedTabs, featureFlags]
  );

  const pickValid = useCallback((raw: string | null) => {
    const fallback = gated.includes(defTab) ? defTab : (gated[0] ?? defTab);
    if (!raw) return fallback;
    return gated.includes(raw) ? raw : fallback;
  }, [gated, defTab]);

  const readTabFromUrl = useCallback(() => {
    const sp = new URLSearchParams(window.location.search);
    return pickValid(sp.get("tab"));
  }, [pickValid]);

  const [tab, setTabState] = useState<string>(() => readTabFromUrl());

  // Keep URL aligned with state (on mount and state changes)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("tab") !== tab) {
      sp.set("tab", tab);
      const url = `${window.location.pathname}?${sp.toString()}${window.location.hash}`;
      // replace: true so we don't spam history while correcting
      nav(url, { replace: true });
    }
  }, [tab, nav]);

  // Back/forward support: update state when the user navigates history
  useEffect(() => {
    const onPop = () => setTabState(readTabFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [readTabFromUrl]);

  // If flags changed and current tab is now invalid, auto-correct
  useEffect(() => {
    const corrected = pickValid(tab);
    if (corrected !== tab) setTabState(corrected);
  }, [pickValid, tab]);

  const setTab = (next: string) => {
    if (!gated.includes(next)) return; // ignore invalid
    const sp = new URLSearchParams(window.location.search);
    sp.set("tab", next);
    const url = `${window.location.pathname}?${sp.toString()}${window.location.hash}`;
    nav(url, { replace: false }); // real navigation
    setTabState(next);
  };

  return { tab, setTab, allowed: gated };
}
