"use client";

import { useEffect, useState } from "react";
import { Box, Card, Stack, Text, Inline } from "@sanity/ui";
import { useFormValue, useClient } from "sanity";
import {
  derivePattern,
  resolvePattern,
  VALID_PATTERNS,
} from "@/data/sanityToSlab";

/**
 * Read-only Studio input that shows the pattern (Marble-look /
 * Movement / Solid / Veined) the catalogue would tag this product
 * with. Mirrors ComputedHueField — reads the document's name,
 * collection name, and manualPattern override, runs the same
 * `resolvePattern` algorithm the website uses, and renders a pill
 * with the result plus a one-line trace of which data source it
 * came from.
 *
 * Pure-display: ignores onChange, never writes. Bound to a
 * `computedPattern` field on the schema marked `readOnly: true`;
 * the stored string is irrelevant and recomputed on every render.
 */
export function ComputedPatternField() {
  const name = useFormValue(["name"]) as string | undefined;
  const manualPattern = useFormValue(["manualPattern"]) as string | undefined;
  const collection = useFormValue(["collection"]) as
    | { _ref?: string }
    | undefined;

  const client = useClient({ apiVersion: "2026-03-28" });
  const [collectionName, setCollectionName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    if (collection?._ref) {
      client
        .fetch<string | null>(`*[_id == $id][0].name`, { id: collection._ref })
        .then((value) => {
          if (!cancelled) setCollectionName(value ?? "");
        })
        .catch(() => {
          if (!cancelled) setCollectionName("");
        });
    } else {
      setCollectionName("");
    }
    return () => {
      cancelled = true;
    };
  }, [collection?._ref, client]);

  const pattern = resolvePattern(name ?? "", collectionName, manualPattern);
  const autoPattern = derivePattern(name ?? "", collectionName);

  const cleanedManual =
    manualPattern &&
    (VALID_PATTERNS as readonly string[]).includes(manualPattern)
      ? manualPattern
      : null;

  const source: "manual" | "keyword" | "fallback" = cleanedManual
    ? "manual"
    : autoPattern !== "Marble-look"
      ? "keyword"
      : "fallback";

  const sourceLabel: Record<typeof source, string> = {
    manual: "Editor override (Pattern Override field below)",
    keyword: `Auto-classified from product / collection name keywords`,
    fallback: 'No keyword match — defaulting to "Marble-look"',
  };

  return (
    <Card padding={3} radius={2} shadow={1} tone="transparent">
      <Stack space={3}>
        <Inline space={2}>
          <PatternPill pattern={pattern} active />
        </Inline>
        <Text size={1} muted>
          {sourceLabel[source]}
        </Text>
        {source === "manual" && pattern !== autoPattern && (
          <Text size={1} muted>
            Without override the algorithm would have classified this as{" "}
            <strong>{autoPattern}</strong>.
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function PatternPill({
  pattern,
  active,
}: {
  pattern: string;
  active: boolean;
}) {
  return (
    <Box
      style={{
        background: active ? "#1a3545" : "transparent",
        color: active ? "#fff" : "#9aa8b6",
        borderRadius: 999,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.05em",
        border: "1px solid rgba(255,255,255,.12)",
      }}
    >
      {pattern}
    </Box>
  );
}
