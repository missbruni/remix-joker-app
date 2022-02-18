import { db } from './db.server';
import bcrypt from 'bcryptjs';
import { createCookieSessionStorage, redirect } from 'remix';

type LoginType = { username: string; password: string };

export async function register({ username, password }: LoginType) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { username, passwordHash },
  });
  return user;
}

export async function login({ username, password }: LoginType) {
  const existingUser = await db.user.findFirst({ where: { username } });
  if (!existingUser) return null;

  const passwordsMatch = await bcrypt.compare(password, existingUser.passwordHash);

  if (!passwordsMatch) return null;

  return existingUser;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('Must environment variable SESSION_SECRET');
}

const storage = createCookieSessionStorage({
  cookie: {
    // on https only
    secure: true,
    // also http only so js cannot access it, so FE cant access it, even if you had a js attack
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: '/',
    name: 'RJ_session',
    secrets: [sessionSecret],
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();

  session.set('userId', userId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');

  if (typeof userId !== 'string') {
    return null;
  }

  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);

  if (!userId) {
    const params = new URLSearchParams([['redirectTo', redirectTo]]);
    // when you throw here it stops the execution
    // Remix puts this call on a try catch, if the error is a response, the error gets handled
    // we see is a redirect and remix treats as a redirect
    throw redirect(`/login?${params}`);
  }

  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  return db.user.findUnique({ where: { id: userId } });
}

export async function logout(request: Request) {
  const session = await getUserSession(request);

  return redirect(`/jokes`, {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
}
