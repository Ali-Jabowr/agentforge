import { auth } from '@clerk/nextjs/server'
import { db } from '@agentforge/db'
import { Badge } from '@/components/ui/badge'

const statusVariant: Record<string, 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  COMPLETED: 'success',
  FAILED: 'destructive',
  RUNNING: 'warning',
  PENDING: 'secondary',
  AWAITING_APPROVAL: 'outline',
}

export default async function RunsPage() {
  const { userId: clerkId } = await auth()

  const user = await db.user.findUnique({ where: { clerkId: clerkId! } })

  const runs = user
    ? await db.run.findMany({
        where: { project: { userId: user.id } },
        orderBy: { startedAt: 'desc' },
        take: 50,
      })
    : []

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Runs</h1>
        <p className="mt-1 text-sm text-slate-500">Every agent run tracked by your API key</p>
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-500">No runs yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Run <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">examples/hello-world</code> to see your first trace appear here
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Started</th>
                <th className="px-4 py-3 font-medium text-slate-600">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{run.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[run.status] ?? 'secondary'}>
                      {run.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(run.startedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{run.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
