# Excellence Library

The web application uses Next.js for the interface and the `EnglishDigitalLibrary` tenant in `dryApi` for authentication, catalogue data, user activity, and administration.

## Local setup

1. Start `dryApi` with its normal MongoDB and JWT configuration.
2. Configure Cloudinary credentials in the API environment. Library PDFs are uploaded as authenticated raw assets; covers are stored as images.
3. From `D:\Alvine\dryApi`, run `npm run seed:library-categories` once to create the English category tree.
4. Run `npm run seed:library-books` to add six public-domain starter titles with official Project Gutenberg reading links. Both seed commands are safe to rerun; existing books are left unchanged.
5. In this project, copy `.env.example` to `.env.local` and set `DRY_API_URL` to the API origin. For local development this is normally `http://localhost:5000`.
6. Install the frontend dependencies with `pnpm install`, then start it with `pnpm dev`.

The API mounts this tenant at `/api/v1/englishdigitallibrary`. Its feature routes are mounted separately:

- `/categories` — category tree and category administration.
- `/books` — catalogue, book management, private PDF access, and cover uploads.
- `/favorites` — the signed-in user's favorites.
- `/reading` — the signed-in user's reading progress.
- `/statistics` — real home and administrator statistics.
- `/user` — the DRY API's existing authentication and profile routes.

## Accounts and roles

New registrations receive the `user` role through the DRY API. To provision the first administrator, register that account through the website, then run `npm run promote:library-admin -- person@example.com` from `dryApi`. Only `admin` can approve English validation, approve distribution rights, assign roles, and publish books. Administrators can promote another account to `librarian`; librarians can prepare books and categories.

## Document review and rights

PDFs are kept in authenticated Cloudinary storage and are not public until the API grants access. This deployment currently places every uploaded PDF in **Manual Review** because `dryApi` does not include a language-detection package. An administrator must review the document's language and distribution rights before publishing it. The API requires both approvals and either a stored PDF or an approved external reading source.

The starter collection links to the corresponding official Project Gutenberg ebook pages instead of copying those files into the library. The source pages state their public-domain status in the United States and ask readers elsewhere to check local copyright rules.

## Configuration notes

- Set the API's CORS allow-list to the frontend origin when the frontend calls the API directly. The current Next.js server actions and server components call the API server-side.
- Do not put JWT or Cloudinary secrets in frontend environment variables.
- The API's MongoDB tenant configuration must include `EnglishDigitalLibrary`.
- Existing standalone MongoDB models and sessions were removed from the frontend path; the DRY API tenant is now the data source.
