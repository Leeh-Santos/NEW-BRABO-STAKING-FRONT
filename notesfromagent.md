Worth writing as a short brief instead of dumping files — the non-obvious gotchas from the Brabo migration that'll save the other agent time if it hits the same stack:
- wagmi v3 exists but RainbowKit 2.2.11 still needs wagmi@^2.9, pin explicitly
- Vite/Rolldown double-wraps some UMD packages' default exports (hit with vanta and react-countup) — needs mod.default ?? mod unwrap
- StrictMode double-invokes effects in dev — don't read "original" state from live DOM inside an effect (broke Typed.js port)
- useGSAP({ scope }) only matches descendants of the scope element — if animations target navbar/layout-level elements from a page component, run unscoped and rely on React Router unmounting inactive routes