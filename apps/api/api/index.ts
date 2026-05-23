import type { IncomingMessage, ServerResponse } from 'node:http'
import app from '../src/app.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const host = req.headers.host ?? 'localhost'
  const url = `https://${host}${req.url}`

  let body: Buffer | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      req.on('data', (chunk: Buffer) => chunks.push(chunk))
      req.on('end', () => resolve(Buffer.concat(chunks)))
      req.on('error', reject)
    })
  }

  const webReq = new Request(url, {
    method: req.method ?? 'GET',
    headers: Object.entries(req.headers).reduce<Record<string, string>>((h, [k, v]) => {
      if (v != null) h[k] = Array.isArray(v) ? v.join(', ') : v
      return h
    }, {}),
    ...(body ? { body } : {}),
  })

  const webRes = await app.fetch(webReq)
  res.statusCode = webRes.status
  webRes.headers.forEach((v, k) => res.setHeader(k, v))
  res.end(Buffer.from(await webRes.arrayBuffer()))
}
