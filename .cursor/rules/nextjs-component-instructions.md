--- 
globs: **/*.js,**/*.jsx,**/*.ts,**/*.tsx
---

# Instructions for Next.js v15 Component Handling in Cursor

## Overview

When generating code for a Next.js v15 SaaS application, follow these best practices to ensure optimal performance, security, and maintainability. Adhere to the latest Next.js v15 documentation (https://nextjs.org/docs) and BetterAuth documentation (https://www.better-auth.com/docs).

## Guidelines

1. **Default to Server Components**:
   - Always make `page.tsx` files server components unless client-side interactivity is explicitly required.
   - Use server components for data fetching, rendering static content, and sensitive logic (e.g., database queries, BetterAuth authentication).

2. **When to Use `"use client"`**:
   - Only mark components with `"use client"` if they require client-side interactivity (e.g., `useState`, `useEffect`, or event handlers like `onClick`).
   - Avoid marking entire `page.tsx` files as client components. Instead, isolate interactivity in separate client components.

3. **File Structure**:
   - Organize routes in the `app/` directory using Next.js’s file-based routing (e.g., `app/[route]/page.tsx`).
   - Place server-side logic in `page.tsx` or server-only utilities (e.g., `lib/server-utils.ts`).
   - Create a `components/` folder within the route or a shared `components/` directory for reusable components.
   - Example:
     ```plaintext
     app/
     ├── dashboard/
     │   ├── page.tsx              // Server component: data fetching, layout
     │   ├── components/
     │       ├── InteractiveForm.tsx // Client component: "use client" for interactivity
     │       ├── StaticContent.tsx   // Server component: no interactivity
     ├── api/
     │   ├── auth/                 // BetterAuth routes (server-side)
     ├── layout.tsx                // Server component: shared layout
     ```

4. **Security Best Practices**:
   - Keep sensitive logic (e.g., API keys, database queries, BetterAuth session handling) in server components or server actions.
   - Never expose sensitive data in client components. Use environment variables for secrets.
   - For BetterAuth, handle authentication (e.g., session checks, sign-in) in server components or server actions.

5. **Handling Mixed Components**:
   - In `page.tsx`, fetch data server-side and pass it as props to client components.
   - Example:

     ```tsx
     // app/dashboard/page.tsx (Server Component)
     import { getUserData } from '@/lib/server-utils'
     import InteractiveForm from './components/InteractiveForm'

     export default async function DashboardPage() {
       const userData = await getUserData()
       return (
         <div>
           <h1>Dashboard</h1>
           <InteractiveForm initialData={userData} />
         </div>
       )
     }
     ```

     ```tsx
     // app/dashboard/components/InteractiveForm.tsx (Client Component)
     'use client'

     import { useState } from 'react'

     export default function InteractiveForm({ initialData }) {
       const [formData, setFormData] = useState(initialData)
       return <form>...</form>
     }
     ```

6. **Performance Optimization**:
   - Minimize `"use client"` usage to reduce client-side bundle size.
   - Use dynamic imports (e.g., `dynamic` with `ssr: false`) for client-only components when server-side rendering isn’t needed.
   - Prefer server actions for form submissions or mutations to keep logic server-side.

7. **Code Generation Rules**:
   - When writing code, ensure `page.tsx` remains a server component unless explicitly stated otherwise.
   - Move client-side logic to separate components in `components/` and mark them with `"use client"`.
   - For BetterAuth, generate server-side authentication logic (e.g., session checks) in `page.tsx` or server actions.
   - If context is missing (e.g., specific route details or existing code), prompt: "Please provide the relevant code files or clarify the route structure for more tailored code."
   - Reference past conversations to ensure consistency with agreed-upon patterns or structures.

8. **Additional Notes**:
   - Do not generate visual styling (e.g., CSS, Tailwind) as the user handles the frontend design.
   - Ensure all code follows Next.js v15 and BetterAuth best practices, prioritizing security and scalability for a SaaS application.
