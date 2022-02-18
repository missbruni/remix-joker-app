import { ActionFunction, LoaderFunction, redirect } from 'remix';
import { logout } from '~/utils/session.server';

export const action: ActionFunction = async ({ request }) => logout(request);
// if you don't have a component exported "view" remix understands it as a resource route.
// which means it understands to only hit the loader directly and create the GET
export const loader: LoaderFunction = async () => redirect('/');
