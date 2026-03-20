"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FileQuestion, Loader2, CheckCircle2, Clock, Check } from "lucide-react";

interface MissingSupplier {
  id: string;
  search_query: string;
  supplier_code: string | null;
  supplier_name: string | null;
  status: "pending" | "completed";
  created_at: string;
}

export default function MissingSuppliersPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [missing, setMissing] = useState<MissingSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem("adminSession");
      if (session !== "active") {
        router.replace("/admin/login");
      } else {
        setIsVerifying(false);
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (!isVerifying) {
      fetchMissing();
    }
  }, [isVerifying]);

  const fetchMissing = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("missing_suppliers")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setMissing(data);
    setIsLoading(false);
  };

  const markResolved = async (id: string) => {
    const { error } = await supabase
      .from("missing_suppliers")
      .update({ status: "completed" })
      .eq("id", id);
      
    if (!error) {
      setMissing((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "completed" } : item))
      );
    }
  };

  if (isVerifying) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const pendingCount = missing.filter(m => m.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 relative">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-5">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          Missing Supplier Requests
          {pendingCount > 0 && (
             <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
               {pendingCount} Pending
             </span>
          )}
        </h1>
        <p className="text-gray-500 mt-2">
          Queries automatically logged when users encounter a "No Result" state. Add them into the directory to resolve.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : missing.length === 0 ? (
          <div className="p-16 text-center">
             <FileQuestion className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All caught up!</h3>
             <p className="text-gray-500 mt-1">There are no missing supplier queries logged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                 <tr>
                   <th className="px-6 py-4">Search Query</th>
                   <th className="px-6 py-4">AI Guessed As</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                 {missing.map(item => (
                   <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                     <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        "{item.search_query}"
                        <div className="text-xs text-gray-400 font-normal mt-1">
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        {item.supplier_code ? (
                           <span className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-md font-mono">
                             Code: {item.supplier_code}
                           </span>
                        ) : (
                           <span className="text-gray-600 dark:text-gray-300">
                             Name: {item.supplier_name}
                           </span>
                        )}
                     </td>
                     <td className="px-6 py-4">
                        {item.status === 'pending' ? (
                          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="w-4 h-4" /> Pending
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Completed
                          </span>
                        )}
                     </td>
                     <td className="px-6 py-4 text-right space-x-3">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => markResolved(item.id)}
                            className="inline-flex items-center gap-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:border-green-500 hover:text-green-600 transition-colors shadow-sm"
                          >
                           <Check className="w-4 h-4" /> Mark Resolved
                          </button>
                        )}
                        <button
                          onClick={() => router.push('/admin/dashboard')}
                          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                          Add Supplier
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
