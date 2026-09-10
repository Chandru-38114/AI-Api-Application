import DashboardShell from "@/components/DashboardShell";

/**
 * Root page – intentionally a Server Component.
 * All interactivity is delegated to <DashboardShell>, which is a
 * Client Component. This keeps the page lean and tree-shakeable.
 */
export default function Page() {
  return <DashboardShell />;
}
