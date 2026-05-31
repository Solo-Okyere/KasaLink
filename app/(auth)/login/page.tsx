import { AuthForm } from "@/components/auth-form";
import { signInAction } from "@/lib/actions";

export default function LoginPage() {
  return <AuthForm mode="login" action={signInAction} />;
}
