"use client";

import React, { useEffect, useMemo, useState } from "react";

type Tile = {
  id: number;         // logique 0..3 (ex: 0=head, 3=tail)
  displayIndex: number; // position affichée dans la grille 0..3
};

type NewCaptchaResp = {
  token: string;
  shuffledIds: number[]; // exemple [2,0,3,1] order to render
  // optionally: message, ttl, hint text
};

export function HorseCaptcha({
  imageUrl,
  onSuccess,
  onFail,
}: {
  imageUrl: string; // url de l'image
  onSuccess: () => void;
  onFail?: (reason?: string) => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [tiles, setTiles] = useState<Tile[] | null>(null);
  const [clicked, setClicked] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string>("Ordre: Top left -> Top right -> bottom left -> bottom right");

  // fetch new captcha from server
  const fetchNew = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/captcha/new", { method: "POST" });
      const body: NewCaptchaResp = await res.json();
      setToken(body.token);
      // build tiles array: for display indices 0..3, tile id is shuffledIds[displayIndex]
      setTiles(
        body.shuffledIds.map((tileId, idx) => ({
          id: tileId,
          displayIndex: idx,
        }))
      );
      setClicked([]);
    } catch (e) {
      setHint("Erreur lors de la génération du captcha");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (tileId: number) => {
    if (!token) return;
    // prevent duplicate clicks
    if (clicked.includes(tileId)) return;
    const next = [...clicked, tileId];
    setClicked(next);

    // if 4 clicked, verify
    if (next.length === 4) {
      verifySolution(next);
    }
  };

  const verifySolution = async (sequence: number[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sequence }),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        onSuccess();
      } else {
        setHint(body.error || "Mauvaise sélection — réessaie");
        onFail?.(body.error);
        // regenerate after short delay
        setTimeout(fetchNew, 900);
      }
    } catch (e) {
      console.error(e);
      setHint("Erreur de vérification");
      onFail?.("network");
      setTimeout(fetchNew, 900);
    } finally {
      setLoading(false);
    }
  };

  if (!tiles) return <div>Chargement du captcha…</div>;

  // CSS crop positions for 4 quadrants:
  // assume image displayed in a square grid 2x2.
  // tileIndex id corresponds to logical part; we only control CSS by backgroundPosition.
  const bgPositions: Record<number, string> = {
    0: "top 0px left 0px",   // top-left
    1: "top 0px right 0px",  // top-right
    2: "bottom 0px left 0px",  // bottom-left
    3: "bottom 0px right 0px", // bottom-right
  };

  return (
    <div className="w-full max-w-sm">
      <p className="text-sm text-gray-600 mb-2">{hint}</p>

      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => {
          const isClicked = clicked.includes(tile.id);
          return (
            <button
              key={tile.displayIndex}
              type="button"
              onClick={() => handleClick(tile.id)}
              disabled={loading}
              aria-label={`Tuile ${tile.displayIndex + 1}`}
              className={`relative w-40 h-40 rounded-md overflow-hidden border-2 ${isClicked ? "border-emerald-400" : "border-gray-300"} focus:outline-none`}
              style={{
                // we render the background using the full image and show only quadrant via backgroundPosition/size
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "200% 200%", // because 2x2 grid
                backgroundPosition: bgPositions[tile.id], // tile.id decides which quadrant of full image is shown
              }}
            >
              {isClicked && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold bg-black/30 pointer-events-none">
                  {clicked.indexOf(tile.id) + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={fetchNew}
          className="px-3 py-1 bg-slate-700 text-white rounded"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}


