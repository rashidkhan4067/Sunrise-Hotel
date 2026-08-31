import { ForgotPasswordForm, AuthLayout } from "@/features/auth"
import { useDocumentTitle } from "@/hooks/use-document-title"

export default function ForgotPasswordPage() {
  useDocumentTitle("Reset Password", "Reset your Sunrise Hotel account password securely.")
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}

