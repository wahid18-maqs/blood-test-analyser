import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Providers from "./providers";

export const metadata = { title: "Blood Test Analyser" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-slate-800 antialiased">
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
