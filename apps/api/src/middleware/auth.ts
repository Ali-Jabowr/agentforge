import { verifyToken } from "@clerk/backend";
import type { Context, Next } from "hono";

export async function requireAuth(c: Context, next: Next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.slice(7);

    try{
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY!,
            jwtKey: process.env.CLERK_JWT_KEY,
        });

        c.set('userId', payload.sub);
        await next();
    } catch (e) {
        console.error('Auth error:', e)
        return c.json({ error: 'Unauthorized' }, 401);
    }
}