"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, RefreshCw, ShieldCheck, FileText, HardDrive, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface BackupFileItem {
  filename: string
  size_bytes: number
  created_at: string
}

interface BackupResponse {
  backups: BackupFileItem[]
}

export function SystemBackupTab() {
  const { getToken } = useAuth()
  const [backups, setBackups] = useState<BackupFileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  async function loadBackups() {
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      const res = await apiClient.get<BackupResponse>("reports/backup/", token)
      setBackups(res.backups || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBackups()
  }, [getToken])

  async function handleCreateBackup() {
    setCreating(true)
    try {
      const token = await getToken()
      if (!token) return
      const res = await apiClient.post<any>("reports/backup/", {}, token)
      toast.success(res.message || "Database snapshot generated!")
      loadBackups()
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate database snapshot")
    } finally {
      setCreating(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <Card className="border border-border/60 shadow-sm rounded-2xl bg-card">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
              <Database className="h-5 w-5 text-primary" />
              Automated System Backup & Snapshot Engine
            </CardTitle>
            <CardDescription className="text-xs">
              Generate full JSON database export snapshots and inspect system recovery files.
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateBackup}
            disabled={creating}
            className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-xs"
          >
            {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <HardDrive className="h-3.5 w-3.5" />}
            Generate Instant Snapshot
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Status Indicator */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-foreground">Automated System Snapshot Engine Active</p>
              <p className="text-muted-foreground text-[11px]">Database records are serialized and preserved in encrypted storage.</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold border-emerald-500/30 uppercase text-[9px]">
            Ready
          </Badge>
        </div>

        {/* Backups List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            Previous Database Snapshots ({backups.length})
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Loading snapshot backups...
            </div>
          ) : backups.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border/50 rounded-xl bg-muted/10 text-xs text-muted-foreground italic">
              No database snapshots generated yet. Click "Generate Instant Snapshot" above to create one.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {backups.map((item) => (
                <div
                  key={item.filename}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/20 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground font-mono">{item.filename}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        Created: {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {formatSize(item.size_bytes)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 p-4 bg-muted/20 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Snapshots stored in project `/backups/` directory
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={loadBackups}
          disabled={loading}
          className="text-xs h-8 cursor-pointer gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Snapshot List
        </Button>
      </CardFooter>
    </Card>
  )
}
