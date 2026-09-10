import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { PageLayout } from "./components/layout/PageLayout";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { ToastProvider } from "./components/ui/ToastProvider";
import { TransactionProvider } from "./components/ui/TransactionProvider";
import { wagmiConfig } from "./config/wagmi";
import { StakingPage } from "./pages/StakingPage";
import "./index.css";

const queryClient = new QueryClient();

/* RainbowKit's own modals. The trigger is ours (components/layout/WalletButton),
 * but the connect / account / chain dialogs are RainbowKit's DOM — these are the
 * knobs that reach them, topped up by the `--rk-*` overrides in index.css. */
const rainbowTheme = darkTheme({
  accentColor: "#2FD4B6",
  accentColorForeground: "#041220",
  borderRadius: "small",
  overlayBlur: "small",
});

export function App() {
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {/* `locale` is pinned rather than left to RainbowKit's default, which
              reads navigator.language — that is what renders the modals in
              Portuguese on a pt-BR browser while the rest of the app is English. */}
          <RainbowKitProvider
            theme={rainbowTheme}
            locale="en-US"
            modalSize="compact"
            appInfo={{ appName: "Brabo Staking" }}
          >
            <ToastProvider>
              <TransactionProvider>
                <PageLayout>
                  <StakingPage />
                </PageLayout>
              </TransactionProvider>
            </ToastProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}
