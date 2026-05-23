'use client'

import { useState, useTransition } from 'react'
import { Plus, Copy, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createApiKey } from './actions'

export function NewKeyButton() {
  const [rawKey, setRawKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    startTransition(async () => {
      const result = await createApiKey('My API Key')
      setRawKey(result.rawKey)
    })
  }

  function handleCopy() {
    if (!rawKey) return
    navigator.clipboard.writeText(rawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleCreate} disabled={isPending || !!rawKey}>
        <Plus className="h-4 w-4" />
        {isPending ? 'Generating...' : 'Generate API Key'}
      </Button>

      {rawKey && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-amber-900">
                Copy this key now — it won&apos;t be shown again
              </p>
              <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-white px-3 py-2">
                <code className="flex-1 break-all font-mono text-xs text-slate-700">{rawKey}</code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
