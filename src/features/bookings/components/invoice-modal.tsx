"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, FileText, CheckCircle2, AlertCircle, Building2, User, BedDouble } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { formatCurrency } from "@/utils/format"

interface InvoiceData {
  invoiceNumber: string
  hotelInfo: {
    name: string
    taxRate: number
    checkInTime: string
    checkOutTime: string
  }
  guestInfo: {
    fullName: string
    email: string
    phone: string
    documentNumber: string
  }
  bookingInfo: {
    bookingId: string
    roomNumber: string
    roomType: string
    checkIn: string
    checkOut: string
    status: string
  }
  folioItems: {
    id: number
    type: string
    description: string
    amount: number
    date: string
  }[]
  financialSummary: {
    totalCharges: number
    totalPayments: number
    balanceDue: number
    isPaid: boolean
  }
}

interface InvoiceModalProps {
  bookingId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceModal({ bookingId, open, onOpenChange }: InvoiceModalProps) {
  const { getToken } = useAuth()
  const [data, setData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !bookingId) return

    async function fetchInvoice() {
      setLoading(true)
      try {
        const token = await getToken()
        if (!token) return
        const res = await apiClient.get<InvoiceData>(`bookings/${bookingId}/invoice/`, token)
        setData(res)
      } catch (err) {
        console.error("Failed to fetch invoice:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [open, bookingId, getToken])

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <FileText className="h-5 w-5 text-primary" />
              <span>Official Guest Folio Receipt</span>
            </DialogTitle>
            <DialogDescription>
              Tax invoice receipt for stay reservations and charges.
            </DialogDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={loading || !data} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            Loading official folio invoice data...
          </div>
        ) : !data ? (
          <div className="py-12 text-center text-muted-foreground">
            Invoice details could not be loaded.
          </div>
        ) : (
          <div className="space-y-6 py-4 print:p-0 print:text-black">
            {/* Header & Invoice Number */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg text-foreground">{data.hotelInfo.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tax Rate: {data.hotelInfo.taxRate}% · Check-In: {data.hotelInfo.checkInTime} · Check-Out: {data.hotelInfo.checkOutTime}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">Invoice No</span>
                <p className="text-lg font-mono font-bold text-primary">{data.invoiceNumber}</p>
              </div>
            </div>

            {/* Guest & Booking Summary */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Guest Details
                </div>
                <p className="font-semibold text-foreground text-sm">{data.guestInfo.fullName}</p>
                <p className="text-xs text-muted-foreground">{data.guestInfo.email} · {data.guestInfo.phone}</p>
                <p className="text-xs text-muted-foreground">ID Doc: {data.guestInfo.documentNumber}</p>
              </div>

              <div className="p-4 rounded-xl border border-border/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <BedDouble className="h-3.5 w-3.5" />
                  Reservation Details
                </div>
                <p className="font-semibold text-foreground text-sm">Room {data.bookingInfo.roomNumber} ({data.bookingInfo.roomType})</p>
                <p className="text-xs text-muted-foreground">Dates: {data.bookingInfo.checkIn} to {data.bookingInfo.checkOut}</p>
                <div className="pt-1">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    Status: {data.bookingInfo.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Folio Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Itemized Billing Breakdown</h4>
              <div className="border border-border/50 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border/40 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Item Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {data.folioItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="p-3 font-mono text-muted-foreground whitespace-nowrap">{item.date}</td>
                        <td className="p-3 font-semibold">
                          <Badge variant="outline" className="text-[9px] uppercase">
                            {item.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-foreground">{item.description}</td>
                        <td className={`p-3 text-right font-mono font-bold ${item.type === 'PAYMENT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {data.financialSummary.isPaid ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                  <span className="font-bold text-foreground">
                    {data.financialSummary.isPaid ? "Payment Complete" : "Outstanding Balance Due"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total Charges: {formatCurrency(data.financialSummary.totalCharges)} · Total Payments: {formatCurrency(data.financialSummary.totalPayments)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Balance Due</span>
                <p className={`text-xl font-bold font-mono ${data.financialSummary.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(data.financialSummary.balanceDue)}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
