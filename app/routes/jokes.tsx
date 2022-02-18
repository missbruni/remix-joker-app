import { Joke, User } from '@prisma/client';
import { LinksFunction, LoaderFunction, useLoaderData } from 'remix';
import { Outlet, Link } from 'remix';
import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';
import stylesUrl from '../styles/jokes.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: stylesUrl,
    },
  ];
};

type LoaderData = { jokes: Pick<Joke, 'id' | 'name'>[]; user: User | null };

// only runs on the server
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  // here because we return everything from each joke, you might think we could be
  // over fetching data, no need to graph ql. we can filter things out here if we want.
  // although we can do this with prisma if you dont have it, you can also just filter
  // your response on the server.
  const jokes = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  });

  const data: LoaderData = { jokes, user };
  return data;
};

export default function JokesRoute() {
  // no loading spinner, no use effects, nothing.
  const data = useLoaderData<LoaderData>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username},`}</span>
              {/* We use form here instead of btn onClick handler with POST and fetch because
              1: this would not trigger remix to reload all the loaders  
              2: btn that triggers data mutation can create race condition problems, even in regular react is not recommended,
              so you would have to set state somewhere, use effect would pick it up and handle it this race condition.
               Luckily we do not have to do that, this makes it simpler and more declarative.
               3: if we used a link instead that would do a GET, problem with this is that someone could add an image with an image "tag"
               GET /logout that would make the user log out and bug the site.Causing cross site request forgery. So that is why this is helpful. 
               And because remix only reload loaders on a action, this would look like I am logged in when I am not longer logged in. 
              */}
              <form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <h3>Jokes</h3>
            <ul>
              {data.jokes.map((joke) => (
                <li key={joke.id}>
                  <Link prefetch="intent" to={joke.id}>
                    {joke.name}
                  </Link>
                  {/* <Link to={joke.id}>{joke.name}</Link> */}
                </li>
              ))}
            </ul>
            {/* Links to "." allows you to refresh the page every time this being clicked */}

            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
