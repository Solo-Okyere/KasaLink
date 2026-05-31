import { AuthForm } from "@/components/auth-form";
import { signUpAction } from "@/lib/actions";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signUpAction} />;
}
