"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, PackageSearch } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { SupplierCard, Supplier } from "@/components/SupplierCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    const searchSuppliers = async () => {
      if (!debouncedQuery.trim()) {
        setSuppliers([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .or(`supplier_code.ilike.%${debouncedQuery}%,supplier_name.ilike.%${debouncedQuery}%`)
        .order("supplier_name", { ascending: true })
        .limit(20);

      if (error) {
        console.error("Error fetching suppliers:", error);
        setSuppliers([]);
      } else {
        setSuppliers(data || []);
      }

      setIsLoading(false);
    };

    searchSuppliers();
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col items-center px-4 py-12 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="w-full max-w-3xl text-center mb-10 mt-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 text-primary p-4 rounded-full">
            <PackageSearch className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Find Supplier Details
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Enter a supplier code or name to instantly access their complete contact and shipping information.
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl relative mb-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-accent transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 sm:text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
            placeholder="Search by Supplier Code or Name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Loader2 className="h-6 w-6 text-accent animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="w-full max-w-5xl">
        {hasSearched && !isLoading && suppliers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
            <Search className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No supplier found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              We couldn't find anything matching "{debouncedQuery}".
            </p>
          </div>
        )}

        {suppliers.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
              Search Results ({suppliers.length})
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {suppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
