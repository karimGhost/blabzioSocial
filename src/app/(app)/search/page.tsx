"use client";
import { Suspense } from "react";

import SearchResults from "@/components/search/SearchResults";

export default function SearchPage() {
   return (
    <Suspense fallback={<p className="p-4">Loading search...</p>}>
      <SearchResults />
    </Suspense>
  );
}
