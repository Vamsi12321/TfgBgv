export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "nodejs";

import ConsentClient from "./client";

export default function Page({ searchParams }) {
  return <ConsentClient searchParams={searchParams} />;
}
