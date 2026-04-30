"use client";

import { useEffect, useState } from "react";
import { Box, Card, Flex, Stack, Text, Inline } from "@sanity/ui";
import { useFormValue, useClient } from "sanity";
import { deriveHues, HUE_SWATCH } from "@/data/sanityToSlab";
import type { Hue } from "@/data/slabs";

const PREDEFINED_HUES = new Set<string>(Object.keys(HUE_SWATCH));
const CUSTOM_HUE_GRADIENT = "linear-gradient(135deg,#5a6772,#3a444d)";

/**
 * Read-only Studio input that shows the hue(s) the catalogue would
 * tag this product with. Reads the document's name, collection
 * reference, manualHues override, and the mainImage asset's
 * dominant-color metadata, then runs the same `deriveHues` algorithm
 * the website uses. Renders a swatch row + a label explaining which
 * data source the result came from (manual override → image colour
 * → name keywords → grey fallback) so editors can spot when
 * auto-classification is wrong and add a manual override.
 *
 * The component is pure-display: it ignores any onChange, never
 * writes to the document, and is bound to a `computedHue` field on
 * the schema marked `readOnly: true`. The field's stored string
 * value is irrelevant — the UI is computed live from the other
 * fields every time the form re-renders.
 */
export function ComputedHueField() {
  const name = useFormValue(["name"]) as string | undefined;
  const manualHues = useFormValue(["manualHues"]) as string[] | undefined;
  const mainImage = useFormValue(["mainImage"]) as
    | { asset?: { _ref?: string } }
    | undefined;
  const collection = useFormValue(["collection"]) as
    | { _ref?: string }
    | undefined;

  // Sanity Studio's pre-authenticated client. apiVersion can be any
  // recent dated string; we just need read access to the dataset to
  // resolve the image asset's palette + the collection name.
  const client = useClient({ apiVersion: "2026-03-28" });

  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    if (mainImage?.asset?._ref) {
      client
        .fetch<string | null>(
          `*[_id == $id][0].metadata.palette.dominant.background`,
          { id: mainImage.asset._ref }
        )
        .then((value) => {
          if (!cancelled) setDominantColor(value ?? null);
        })
        .catch(() => {
          if (!cancelled) setDominantColor(null);
        });
    } else {
      setDominantColor(null);
    }
    return () => {
      cancelled = true;
    };
  }, [mainImage?.asset?._ref, client]);

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

  const hues = deriveHues(
    name ?? "",
    collectionName,
    dominantColor,
    manualHues
  );

  // Trace which path produced the result so the editor knows whether
  // they're looking at editor override / image-derived / name-keyword
  // / grey fallback.
  const cleanedManual =
    manualHues && manualHues.length > 0
      ? manualHues.filter((h) => HUE_SWATCH[h as Hue])
      : [];
  const source: "manual" | "image" | "keyword" | "fallback" =
    cleanedManual.length > 0
      ? "manual"
      : dominantColor
        ? "image"
        : name && hues[0] !== "grey"
          ? "keyword"
          : "fallback";

  const sourceLabel: Record<typeof source, string> = {
    manual: "Editor override (Hue Override field below)",
    image:
      `Auto-classified from image dominant colour ${dominantColor ?? ""}`.trim(),
    keyword: "Auto-classified from product / collection name keywords",
    fallback: "No signal found — falling back to Grey",
  };

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} shadow={1} tone="transparent">
        <Stack space={3}>
          <Inline space={2}>
            {hues.map((h) => (
              <HueSwatch key={h} hue={h} />
            ))}
          </Inline>
          <Text size={1} muted>
            {sourceLabel[source]}
          </Text>
          {dominantColor && (
            <Flex align="center" gap={2}>
              <Box
                style={{
                  width: 14,
                  height: 14,
                  background: dominantColor,
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,.15)",
                }}
              />
              <Text size={1} muted>
                Image dominant colour: {dominantColor}
              </Text>
            </Flex>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

function HueSwatch({ hue }: { hue: string }) {
  // Hues whose swatch is light enough that white text on it would
  // wash out — these get dark text instead. Pink, like cream/gold,
  // is a light pastel. Custom (non-predefined) hues use the dark
  // fallback gradient and white text.
  const isPredefined = PREDEFINED_HUES.has(hue);
  const lightHues: string[] = ["white", "cream", "gold", "beige", "pink"];
  const textColor = lightHues.includes(hue) ? "#222" : "#fff";
  const background = isPredefined
    ? HUE_SWATCH[hue as Hue]
    : CUSTOM_HUE_GRADIENT;
  return (
    <Box
      style={{
        background,
        borderRadius: 999,
        padding: "4px 12px",
        color: textColor,
        fontSize: 12,
        fontWeight: 500,
        textTransform: "capitalize",
        letterSpacing: "0.05em",
        border: "1px solid rgba(0,0,0,.12)",
      }}
    >
      {hue}
    </Box>
  );
}
