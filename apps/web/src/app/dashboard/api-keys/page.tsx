import { auth } from '@clerk/nextjs/server'
import { db } from '@agentforge/db'
import { NewKeyButton } from './new-key-button'

function formatDate(date: Date | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function ApiKeysPage() {
  const { userId: clerkId } = await auth()

  const user = await db.user.findUnique({ where: { clerkId: clerkId! } })

  const apiKeys = user
    ? await db.apiKey.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">API Keys</h1>
          <p className="mt-1 text-sm text-slate-500">
            Keys authenticate your SDK. Each key is stored hashed — copy it when created.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <NewKeyButton />

        {apiKeys.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Key prefix</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Created</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Last used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{key.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {key.keyPrefix}...
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(key.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(key.lastUsedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {apiKeys.length === 0 && (
          <p className="text-sm text-slate-400">No keys yet — generate one above to get started.</p>
        )}
      </div>
    </div>
  )
}
