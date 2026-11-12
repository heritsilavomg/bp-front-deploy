import { Suspense } from "react"

// useSearchParams() in page.tsx requires a Suspense boundary for `next build` (same as /login).
export default function ResetPasswordTemplate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  )
}
