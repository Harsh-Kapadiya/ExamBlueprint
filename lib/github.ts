// Browser-side GitHub calls for the admin panel. File bytes go straight from the admin's browser
// to GitHub with the admin's own short-lived token, so they never pass through our server, whose
// request bodies are capped below 6 MB on Vercel (README C3).
import { BRANCH, REPO, type Catalog } from './rules.ts';

/** A file to write at `path`; `data: null` deletes it. */
export type Change = { path: string; data: Blob | string | null };

async function gh<T>(token: string, path: string, body?: unknown, method = body ? 'POST' : 'GET'): Promise<T> {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    method,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Your GitHub session has ended. Sign out, then sign in again.');
  if (!res.ok) throw new Error(`GitHub refused the request (${res.status}): ${(await res.json().catch(() => ({}))).message ?? res.statusText}`);
  return res.json();
}

const headSha = async (token: string) => (await gh<{ object: { sha: string } }>(token, `/git/ref/heads/${BRANCH}`)).object.sha;

const base64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** Live state of main: every file under Content/ with its size, and the catalog. */
export async function readRepo(token: string) {
  const sha = await headSha(token);
  // ponytail: one recursive tree call; GitHub truncates past 100,000 entries, far beyond this repo
  const { tree } = await gh<{ tree: { path: string; type: string; size?: number }[] }>(token, `/git/trees/${sha}?recursive=1`);
  const files = new Map(tree.filter((t) => t.type === 'blob' && t.path.startsWith('Content/')).map((t) => [t.path, t.size ?? 0]));
  const { content } = await gh<{ content: string }>(token, `/contents/Content/catalog.json?ref=${sha}`);
  const text = new TextDecoder().decode(Uint8Array.from(atob(content.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
  return { files, catalog: JSON.parse(text) as Catalog };
}

/**
 * Applies all changes as one commit on main (FR-A-04). Files upload one at a time; main moves only
 * at the very end, so a failure part-way leaves no partial commit behind.
 */
export async function commit(token: string, message: string, changes: Change[], progress?: (done: number) => void) {
  const parent = await headSha(token);
  const { tree: baseTree } = await gh<{ tree: { sha: string } }>(token, `/git/commits/${parent}`);
  const tree = [];
  for (const [i, c] of changes.entries()) {
    progress?.(i);
    const blob =
      c.data === null
        ? null
        : typeof c.data === 'string'
          ? { content: c.data, encoding: 'utf-8' }
          : { content: await base64(c.data), encoding: 'base64' };
    const sha = blob && (await gh<{ sha: string }>(token, '/git/blobs', blob)).sha;
    tree.push({ path: c.path, mode: '100644', type: 'blob', sha });
  }
  progress?.(changes.length);
  const { sha: treeSha } = await gh<{ sha: string }>(token, '/git/trees', { base_tree: baseTree.sha, tree });
  const made = await gh<{ sha: string; html_url: string }>(token, '/git/commits', { message, tree: treeSha, parents: [parent] });
  // Not forced: if someone else changed main meanwhile, GitHub refuses and nothing is lost.
  await gh(token, `/git/refs/heads/${BRANCH}`, { sha: made.sha }, 'PATCH');
  return made.html_url;
}
