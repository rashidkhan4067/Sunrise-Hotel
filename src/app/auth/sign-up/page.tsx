import { SignupForm, AuthLayout } from "@/features/auth"
import { useDocumentTitle } from "@/hooks/use-document-title"

export default function SignUpPage() {
  useDocumentTitle("Sign Up")
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  )
}
