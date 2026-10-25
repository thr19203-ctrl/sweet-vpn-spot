import { useRef, useState } from "react";
import { Play, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORKFLOW } from "@/lib/workflow";
import videoAsset from "@/assets/videos/cfg-workflow.mp4.asset.json";
import webmAsset from "@/assets/videos/cfg-workflow.webm.asset.json";
import posterAsset from "@/assets/videos/cfg-workflow-poster.jpg.asset.json";

// HTMLMediaElement.NETWORK_NO_SOURCE: every <source> candidate failed.
const NETWORK_NO_SOURCE = 3;

export function Workflow({ lang }: { lang: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  // The clip lives on the Lovable asset CDN. When that host is unreachable
  // (self-hosted previews, CDN incidents, offline users) the player used to
  // stay as a black box with a play button that did nothing — fail loudly
  // instead and offer a retry.
  const [mediaBroken, setMediaBroken] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const copy = WORKFLOW[lang] ?? WORKFLOW["en"];
  if (!copy) return null;

  const fail = () => {
    setStarted(false);
    setMediaBroken(true);
  };

  const play = async () => {
    const player = video.current;
    if (!player) return;
    try {
      await player.play();
      setStarted(true);
    } catch {
      // Autoplay rejection is fine (controls still work), a missing source is not.
      if (player.error || player.networkState === NETWORK_NO_SOURCE) fail();
      else setStarted(true);
    }
  };

  const retry = () => {
    setStarted(false);
    setMediaBroken(false);
    setAttempt((value) => value + 1);
  };

  return (
    <section
      id="workflow"
      aria-labelledby="workflow-title"
      className="mx-auto max-w-6xl px-5 py-16 sm:py-20"
    >
      <div className="text-center">
        <h2 id="workflow-title" className="text-4xl font-semibold sm:text-5xl">
          {copy.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {copy.description}
        </p>
      </div>
      <div className="relative mt-10 aspect-video overflow-hidden rounded-lg border border-border bg-card sm:mt-12">
        {mediaBroken ? (
          <div
            role="status"
            className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_0%,var(--color-secondary),var(--color-card))] px-6 text-center"
          >
            <VideoOff aria-hidden="true" className="h-10 w-10 text-muted-foreground" />
            <p className="max-w-sm text-sm text-muted-foreground">{copy.unavailable}</p>
            <Button variant="secondary" onClick={retry} className="rounded-xl">
              {copy.retry}
            </Button>
          </div>
        ) : (
          <>
            {/* Probes the poster so an unreachable CDN is detected before the click. */}
            <img
              key={`poster-${attempt}`}
              src={posterAsset.url}
              alt=""
              aria-hidden="true"
              className="hidden"
              onError={fail}
            />
            <video
              key={`video-${attempt}`}
              ref={video}
              poster={posterAsset.url}
              controls={started}
              playsInline
              preload="none"
              aria-label={copy.title}
              onPlay={() => setStarted(true)}
              onError={fail}
              className="h-full w-full object-contain"
            >
              <source src={webmAsset.url} type="video/webm" />
              <source src={videoAsset.url} type="video/mp4" onError={fail} />
            </video>
            {!started && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                <Button
                  size="icon"
                  onClick={play}
                  aria-label={copy.play}
                  title={copy.play}
                  className="h-16 w-16 rounded-full [&_svg]:size-6"
                >
                  <Play className="ms-1" fill="currentColor" aria-hidden="true" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
