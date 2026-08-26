import { verifySession } from './lib/session.mjs';

export default async (req) => {
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
        return Response.json({ authenticated: false }, { status: 500 });
    }

    const session = verifySession(req.headers.get('cookie'), sessionSecret);
    if (!session) {
        return Response.json({ authenticated: false }, { status: 200 });
    }

    return Response.json({ authenticated: true, email: session.email }, { status: 200 });
};
