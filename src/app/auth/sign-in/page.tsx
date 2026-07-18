import { LoginForm, AuthLayout } from "@/features/auth"
import { useDocumentTitle } from "@/hooks/use-document-title"

export default function LoginPage() {
  useDocumentTitle("Sign In")
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
