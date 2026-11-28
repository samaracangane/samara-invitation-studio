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

- New payment flows use TanStack server functions and public server routes, keeping historical provider orders readable; this keeps credentials server-only and avoids changing legacy purchases.
- Asaas charges are matched by order reference and confirmed transactionally in PostgreSQL; this prevents duplicate delivery and incorrect release on retries.
