import { StoreProvider } from "@/lib/store"
import { SentinelApp } from "@/components/sentinel-app"

export default function Page() {
  return (
    <StoreProvider>
      <SentinelApp />
    </StoreProvider>
  )
}
