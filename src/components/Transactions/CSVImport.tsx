import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { SpendingCategory } from "@/db/database"
import { importTransactions } from "@/hooks/useBudget"
import { autoCategorizeTransaction, formatKES, getTodayIsoDate, normalizeImportedDate, parseAmount } from "@/lib/finance"
import { AnimatePresence, motion } from "motion/react"
import Papa from "papaparse"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"

interface CSVImportProps {
  categories: SpendingCategory[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CsvRow = Record<string, string>

function guessColumn(headers: string[], options: string[]) {
  return headers.find((header) => options.some((option) => header.toLowerCase().includes(option))) ?? headers[0] ?? ""
}

export default function CSVImport({ categories, open, onOpenChange }: CSVImportProps) {
  const [rows, setRows] = useState<CsvRow[]>([])
  const [fileName, setFileName] = useState("")
  const [mapping, setMapping] = useState({ date: "", description: "", amount: "" })
  const [importing, setImporting] = useState(false)

  const headers = useMemo(() => Object.keys(rows[0] ?? {}), [rows])

  const previewRows = useMemo(() => {
    return rows.slice(0, 8).map((row) => {
      const description = row[mapping.description] ?? ""
      const amount = parseAmount(row[mapping.amount] ?? "")
      const categoryId = autoCategorizeTransaction(description, categories)
      return {
        date: normalizeImportedDate(row[mapping.date] ?? getTodayIsoDate()),
        description,
        amount,
        categoryId,
      }
    })
  }, [categories, mapping.amount, mapping.date, mapping.description, rows])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedRows = result.data.filter((row) => Object.values(row).some((value) => value?.trim()))
        const parsedHeaders = Object.keys(parsedRows[0] ?? {})
        setRows(parsedRows)
        setFileName(file.name)
        setMapping({
          date: guessColumn(parsedHeaders, ["date", "time", "posted"]),
          description: guessColumn(parsedHeaders, ["description", "details", "narration", "merchant"]),
          amount: guessColumn(parsedHeaders, ["amount", "debit", "value"]),
        })
      },
      error: () => {
        toast.error("Unable to parse CSV")
      },
    })
  }

  const handleImport = async () => {
    const payload = rows
      .map((row) => {
        const description = row[mapping.description] ?? "Imported transaction"
        const amount = parseAmount(row[mapping.amount] ?? "")
        return {
          date: normalizeImportedDate(row[mapping.date] ?? getTodayIsoDate()),
          description,
          amount,
          categoryId: autoCategorizeTransaction(description, categories),
          isRecurring: false,
        }
      })
      .filter((row) => row.amount > 0 && row.categoryId)

    if (payload.length === 0) {
      toast.error("No rows to import")
      return
    }

    setImporting(true)

    try {
      await importTransactions(payload)
      toast.success(`${payload.length} transactions imported`)
      onOpenChange(false)
      setRows([])
      setFileName("")
    } catch {
      toast.error("Import failed")
    } finally {
      setImporting(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button type="button" className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onOpenChange(false)} />
          <motion.div className="fixed inset-x-4 top-1/2 z-50 mx-auto w-full max-w-4xl -translate-y-1/2" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <Card className="max-h-[85vh] overflow-hidden border-border/70 bg-card/95 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/70">
                <CardTitle>Import CSV</CardTitle>
                <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-5 overflow-y-auto p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">File</label>
                  <Input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
                  {fileName ? <p className="text-sm text-muted-foreground">{fileName}</p> : null}
                </div>

                {headers.length > 0 ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Select value={mapping.date} onChange={(event) => setMapping((current) => ({ ...current, date: event.target.value }))}>
                          {headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Select value={mapping.description} onChange={(event) => setMapping((current) => ({ ...current, description: event.target.value }))}>
                          {headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Select value={mapping.amount} onChange={(event) => setMapping((current) => ({ ...current, amount: event.target.value }))}>
                          {headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Preview</h3>
                        <span className="text-sm text-muted-foreground">{rows.length} rows</span>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-border/70">
                        <div className="grid grid-cols-[120px,1fr,120px,140px] gap-3 border-b border-border/70 bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <span>Date</span>
                          <span>Description</span>
                          <span>Amount</span>
                          <span>Category</span>
                        </div>
                        <div className="divide-y divide-border/70">
                          {previewRows.map((row, index) => (
                            <div key={`${row.description}-${index}`} className="grid grid-cols-[120px,1fr,120px,140px] gap-3 px-4 py-3 text-sm">
                              <span>{row.date}</span>
                              <span className="truncate">{row.description}</span>
                              <span className="tabular-nums">{formatKES(row.amount)}</span>
                              <span>{categories.find((category) => category.id === row.categoryId)?.name ?? "Unassigned"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleImport} disabled={importing || rows.length === 0}>
                    Import
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
