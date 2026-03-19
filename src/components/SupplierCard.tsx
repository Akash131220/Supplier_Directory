import { Copy, Mail, MapPin, Phone, User2 } from "lucide-react";
import { useState } from "react";

export interface Supplier {
  id: string;
  supplier_code: string;
  supplier_name: string;
  email_primary?: string | null;
  email_secondary?: string | null;
  email_escalation?: string | null;
  contact_person?: string | null;
  contact_number?: string | null;
  country_of_origin?: string | null;
  shipping_location?: string | null;
}

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {supplier.supplier_name}
          </h3>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:text-blue-400">
            {supplier.supplier_code}
          </span>
        </div>
        {(supplier.country_of_origin || supplier.shipping_location) && (
          <div className="text-right text-sm text-gray-500 flex flex-col items-end gap-1">
            {supplier.country_of_origin && (
              <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md">
                <MapPin className="w-3 h-3" /> {supplier.country_of_origin}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
              <User2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Contact Person
              </p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {supplier.contact_person || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
              <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Contact Number
              </p>
              {supplier.contact_number ? (
                <a
                  href={`tel:${supplier.contact_number}`}
                  className="text-gray-900 dark:text-gray-100 font-medium hover:text-accent transition-colors flex items-center gap-1 group"
                >
                  {supplier.contact_number}
                  <span className="opacity-0 group-hover:opacity-100 text-xs text-green-600 transition-opacity">
                    (Click to call)
                  </span>
                </a>
              ) : (
                <p className="text-gray-500">Not provided</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="w-full">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Email Addresses
              </p>
              <div className="space-y-2">
                {[
                  { label: "Primary", val: supplier.email_primary },
                  { label: "Secondary", val: supplier.email_secondary },
                  { label: "Escalation", val: supplier.email_escalation },
                ].map((email, idx) =>
                  email.val ? (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md text-sm border border-gray-100 dark:border-gray-800"
                    >
                      <div className="truncate pr-2">
                        <span className="text-xs text-gray-400 mr-2">{email.label}</span>
                        <a href={`mailto:${email.val}`} className="text-gray-900 dark:text-gray-200 hover:text-primary hover:underline">
                          {email.val}
                        </a>
                      </div>
                      <button
                        onClick={() => copyEmail(email.val!)}
                        className="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Copy email"
                      >
                        {copied ? <span className="text-xs text-green-500 font-medium">Copied!</span> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : null
                )}
                {!supplier.email_primary && !supplier.email_secondary && !supplier.email_escalation && (
                  <p className="text-gray-500 text-sm">No emails provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
