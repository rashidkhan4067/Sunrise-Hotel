import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormLabel } from "@/components/ui/form"
import { Loader2 } from "lucide-react"

interface OtpVerifyFormProps {
  title: string
  description: string
  code: string
  setCode: (code: string) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  submitting: boolean
  submitLabel?: string
  backLabel?: string
}

export function OtpVerifyForm({
  title,
  description,
  code,
  setCode,
  onSubmit,
  onBack,
  submitting,
  submitLabel = "Verify Code",
  backLabel = "Back"
}: OtpVerifyFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold font-heading">{title}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {description}
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <FormLabel htmlFor="verification-code">Verification Code</FormLabel>
          <Input
            id="verification-code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center tracking-widest text-lg font-semibold"
            maxLength={6}
            required
            disabled={submitting}
          />
        </div>
        <Button
          type="submit"
          className="w-full cursor-pointer py-5"
          disabled={submitting}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full cursor-pointer"
          onClick={onBack}
          disabled={submitting}
        >
          {backLabel}
        </Button>
      </form>
    </div>
  )
}
