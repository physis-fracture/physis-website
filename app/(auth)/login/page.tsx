import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col justify-center bg-background px-6 py-12 sm:px-12">
      <div className="mx-auto w-full max-w-sm">
        <Image
          src="/logo/Logo Physis.svg"
          alt="Physis"
          width={579}
          height={311}
          priority
          unoptimized
          className="w-40 mb-8"
        />
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-8">
          Masuk untuk mengakses sistem triase radiograf pediatrik
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
