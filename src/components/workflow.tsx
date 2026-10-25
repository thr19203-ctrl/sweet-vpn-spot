import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishedAssetUrl } from "@/lib/media";
import { WORKFLOW } from "@/lib/workflow";
import videoAsset from "@/assets/videos/cfg-workflow.mp4.asset.json";
import webmAsset from "@/assets/videos/cfg-workflow.webm.asset.json";
import posterAsset from "@/assets/videos/cfg-workflow-poster.jpg.asset.json";

export function Workflow({ lang }: { lang: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const copy = WORKFLOW[lang] ?? WORKFLOW["en"];
  if (!copy) return null;

  const play = async () => {
    const player = video.current;
    if (!player) return;
    try {
      await player.play();
      setStarted(true);
    } catch {
      setStarted(true);
    }
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
        <video
          ref={video}
          poster={publishedAssetUrl(posterAsset.url)}
          controls={started}
          playsInline
          preload="none"
          aria-label={copy.title}
          onPlay={() => setStarted(true)}
          className="h-full w-full object-contain"
        >
          <source src={publishedAssetUrl(webmAsset.url)} type="video/webm" />
          <source src={publishedAssetUrl(videoAsset.url)} type="video/mp4" />
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
      </div>
    </section>
  );
}
