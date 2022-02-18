// Resource Routes
import { LoaderFunction } from 'remix';

// here we are returning a response and remix will turn this into a json
// we can do anything
export const loader: LoaderFunction = () =>
  // ({ stuff: 'hi' });
  new Response('whatever', { headers: { 'Content-Type': 'text-plain' } });
// new Response('whatever', { headers: { 'Content-Type': 'application/pdf' } });
// new Response('whatever', { headers: { 'Content-Type': 'text/javascript' } });

// anything that a server can send yo a client, anything. rss feed with escaped dot
