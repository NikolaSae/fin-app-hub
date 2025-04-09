// app/page.tsx
import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-bold text-white drop-shadow-sm">Fin-App-Hub</h1>
        <p className="text-white text-lg">Finansijski izvestaji, reklamacije, parking...</p>
        <div>
          <LoginButton mode="modal" asChild>
            <Button variant={"secondary"}>Prijava</Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
