# 📝 Buyer Lead Management App

This is a mini full-stack application for managing buyer leads. It is built to demonstrate a robust and scalable architecture for capturing, organizing, and interacting with lead data, complete with validation, search, and CSV import/export functionalities.

## 🚀 Features

  * **Lead Management**: Create, view, edit, and manage buyer leads.
  * **Intelligent Search & Filtering**: Efficiently search leads by name, phone, or email. Filter results by city, property type, status, and timeline. All filters are synchronized with the URL for shareable links.
  * **Data Integrity**: Comprehensive validation using **Zod** on both the client and server.
  * **CSV Import/Export**: Bulk import up to 200 leads at a time with row-level error reporting. Export filtered lead lists to a CSV file.
  * **Secure Authentication**: Simple and secure password-less magic link authentication via Supabase.
  * **Optimistic Concurrency**: Prevents data overwrites with a version-based concurrency check on lead edits.
  * **Audit Trail**: Tracks and displays the last 5 changes for each lead.
  * **Unit Testing**: Includes a unit test for a core validation function.
  * **Rate Limiting**: Protects against abuse with a basic rate limit on write operations.
  * **Accessibility**: Basic accessibility features like form labels and keyboard focus are implemented.

## 🛠️ Tech Stack

  * **Framework**: Next.js 14 (App Router)
  * **Language**: TypeScript
  * **Database**: PostgreSQL via Supabase
  * **ORM**: Drizzle ORM
  * **Validation**: Zod
  * **Authentication**: Supabase Auth
  * **Styling**: Tailwind CSS (for simplicity and speed)

-----

## ⚙️ Setup & Installation

### Prerequisites

  * Node.js 18+ and npm
  * A Supabase account and project

### Steps

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd buyer-lead-app
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file and add your Supabase credentials. You can find these in your Supabase project dashboard under `Settings > API` and `Settings > Database`.

    ```env
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

    # Database Connection
    DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/[YOUR_DB]?sslmode=disable
    ```

4.  **Run database migrations**:
    The schema is defined using Drizzle. Use the following command to push the schema to your Supabase database.

    ```bash
    npm run db:push
    ```

    *(Note: If the `db:push` command requires you to first generate a migration file, you can run `npm run db:generate` followed by `npm run db:migrate`.)*

5.  **Start the development server**:

    ```bash
    npm run dev
    ```

    Open your browser to [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the application.

-----

## 🏗️ Design Notes

### Validation

Validation is a critical component of this app. The **Zod schemas** are defined in `src/lib/validations/`. These same schemas are used for both **client-side validation** with React Hook Form and **server-side validation** in the Next.js API routes and server actions. This approach ensures data integrity and prevents invalid data from ever reaching the database, regardless of the request source.

### Server-Side Rendering (SSR)

The main `/buyers` list page uses SSR for its initial render. The initial data (leads, pagination, filters) is fetched on the server, resulting in a fast, crawlable page. Subsequent search and filter operations are handled on the client side to provide a dynamic user experience without full page reloads.

### Data Ownership & Security

Ownership is enforced using the `ownerId` column on the `buyers` table.

  * **Authentication**: The Supabase client on the server checks the user's session from a cookie to get the current user's ID.
  * **CRUD Operations**: Before any edit or delete operation, the server checks if the user's ID matches the `ownerId` of the lead. If there is a mismatch, the request is rejected. This provides a robust, server-level check that cannot be bypassed on the client.

-----

## ✅ Deliverables Status

This project successfully implements all the "must" deliverables and a few "nice-to-haves" as specified in the assignment.

### **Completed**

  * **Pages & Flows**:
      * `/buyers/new`: Create lead form with full validation and `buyer_history` entry.
      * `/buyers`: SSR list with pagination (10 items), URL-synced filters, and a debounced search.
      * `/buyers/[id]`: View/Edit page with concurrency check and the last 5 history entries.
  * **Data Operations**:
      * CSV Import (max 200 rows) with per-row validation and an error table. Imports are done within a single database transaction.
      * CSV Export of the current filtered list.
  * **Ownership & Auth**:
      * Simple magic link authentication is functional.
      * Users can only edit/delete their own leads, enforced by checking the `ownerId` on the server.
  * **Quality Bar**:
      * **Unit Tests**: Includes a unit test for the budget validation logic (`budgetMax >= budgetMin`).
      * **Rate Limiting**: A basic rate limiter is implemented on the `create` and `update` API routes.
      * **Error Handling**: A simple error boundary and empty state messages are implemented to handle unexpected issues and display an empty table when no leads match the filters.


## Project Structure

```
src/
├── app/                   
│   ├── auth/              
│   ├── buyers/            
│   └── api/               
├── components/            
│   ├── ui/                
│   └── providers/        
├── lib/                  
│   ├── db/               
│   ├── supabase/          
│   └── validations/      
└── __tests__/             
```


## Security Features

- Magic link authentication (no passwords)
- Row-level security via ownership checks
- Rate limiting (10 requests per minute)
- Input validation and sanitization
- Optimistic concurrency control
- CSRF protection via Supabase

## Performance Optimizations

- Server-side rendering for initial load
- Debounced search (300ms)
- Pagination (10 items per page)
- Optimized database queries
- Lazy loading of components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
Created by Dinakar Sai Reddy Lingala..!

