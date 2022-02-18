import { Link, Form } from 'remix';
import type { Joke } from '@prisma/client';

export function JokeDisplay({
  joke,
  isOwner,
  canDelete = true,
}: {
  joke: Pick<Joke, 'content' | 'name'>;
  isOwner: boolean;
  canDelete?: boolean;
}) {
  return (
    <div>
      <br />
      <h3 className="jokes-joke">{joke.name}</h3>
      <h6>{joke.content}</h6>
      {isOwner ? (
        <Form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button" disabled={!canDelete}>
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
}
