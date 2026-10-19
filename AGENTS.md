<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep plan identities, base prices, and price formatting in `src/lib/pricing.ts` so the UI and concrete pricing tests share one source of truth.
- Use global CSS motion classes for VPN visuals and Discord, respecting reduced-motion preferences so animations remain accessible.
- Keep the uploaded workflow video in a dedicated presentation component with CDN asset pointers and localized copy so it does not add binary media or player state to the page module.
