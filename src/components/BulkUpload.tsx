"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";
import { UploadCloud, Download, AlertCircle, CheckCircle2, Loader2, TableProperties } from "lucide-react";

interface UploadError {
  row: number;
  message: string;
}

const EXPECTED_HEADERS = [
  "supplier_code",
  "supplier_name",
  "email_primary",
  "email_secondary",
  "email_escalation",
  "contact_person",
  "contact_number",
  "country_of_origin",
  "shipping_location",
];

export default function BulkUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  const handleDownloadTemplate = () => {
    const csvContent = EXPECTED_HEADERS.join(",") + "\n" + 
      "SUP-SAMPLE,Sample Supplier,primary@sample.com,secondary@sample.com,escalation@sample.com,John Doe,+1 234 567 890,United States,New York Hub";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "supplier_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);
    setSuccessMsg("");

    try {
      const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
      let rawData: any[] = [];

      if (isExcel) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      } else if (file.name.endsWith(".csv")) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: "greedy" });
        rawData = result.data;
      } else {
        setErrors([{ row: 0, message: "Invalid file format. Please upload a .csv or .xlsx file." }]);
        setIsProcessing(false);
        return;
      }

      if (rawData.length === 0) {
        setErrors([{ row: 0, message: "File is empty." }]);
        setIsProcessing(false);
        return;
      }

      // Check headers (case sensitive)
      const fileHeaders = Object.keys(rawData[0]);
      const missingHeaders = EXPECTED_HEADERS.filter(h => !fileHeaders.includes(h));
      if (missingHeaders.length > 0) {
        setErrors([{ row: 0, message: `Missing required columns: ${missingHeaders.join(", ")}. Please use the exact template headers.` }]);
        setIsProcessing(false);
        return;
      }

      // Validation Rules
      const currentErrors: UploadError[] = [];
      const validRows: any[] = [];
      const seenSupplierCodes = new Set<string>();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;

      rawData.forEach((row, index) => {
        const rowNum = index + 2; // Assuming 1 row header
        
        const code = String(row.supplier_code || "").trim();
        const name = String(row.supplier_name || "").trim();
        
        // Ensure required fields are not empty
        if (!code) currentErrors.push({ row: rowNum, message: "Missing supplier_code." });
        if (!name) currentErrors.push({ row: rowNum, message: "Missing supplier_name." });

        if (code) {
          if (seenSupplierCodes.has(code.toLowerCase())) {
            currentErrors.push({ row: rowNum, message: `Duplicate supplier_code '${code}' within the file itself.` });
          }
          seenSupplierCodes.add(code.toLowerCase());
        }

        // Validate emails
        ["email_primary", "email_secondary", "email_escalation"].forEach(field => {
          const val = String(row[field] || "").trim();
          if (val && !emailRegex.test(val)) {
            currentErrors.push({ row: rowNum, message: `Invalid email format in ${field}.` });
          }
        });

        // Validate contact number
        const phone = String(row.contact_number || "").trim();
        if (phone && !phoneRegex.test(phone)) {
           currentErrors.push({ row: rowNum, message: "Contact number must be numeric (allows spaces, +, -, ())." });
        }

        // If no errors for this specific row so far, schedule it for valid batch
        if (currentErrors.length === 0 || currentErrors[currentErrors.length - 1]?.row !== rowNum) {
          validRows.push({
            supplier_code: code.toUpperCase(),
            supplier_name: name,
            email_primary: String(row.email_primary || "").trim() || null,
            email_secondary: String(row.email_secondary || "").trim() || null,
            email_escalation: String(row.email_escalation || "").trim() || null,
            contact_person: String(row.contact_person || "").trim() || null,
            contact_number: phone || null,
            country_of_origin: String(row.country_of_origin || "").trim() || null,
            shipping_location: String(row.shipping_location || "").trim() || null,
          });
        }
      });

      // Strict Mode: Block upload if ANY formatting errors occurred
      if (currentErrors.length > 0) {
        setErrors(currentErrors);
        setIsProcessing(false);
        return;
      }

      // Check DB Uniqueness efficiently via chunked 'IN' clauses or single batch
      if (validRows.length > 0) {
        const codesArray = validRows.map(r => r.supplier_code);
        
        // Supabase URL string limits apply to IN queries, limit to ~1000 items
        const { data: existingCodes, error: fetchError } = await supabase
          .from("suppliers")
          .select("supplier_code")
          .in("supplier_code", codesArray);

        if (fetchError) {
          setErrors([{ row: 0, message: "Failed to verify database for duplicates against live Supabase instance." }]);
          setIsProcessing(false);
          return;
        }

        if (existingCodes && existingCodes.length > 0) {
          existingCodes.forEach(exist => {
             // Look back up the row number in original validRows array
             const matchIndex = validRows.findIndex(r => r.supplier_code.toLowerCase() === exist.supplier_code.toLowerCase());
             const rowNum = matchIndex >= 0 ? matchIndex + 2 : 0;
             currentErrors.push({ row: rowNum, message: `Supplier code '${exist.supplier_code}' already exists in database.`});
          });
        }
      }

      if (currentErrors.length > 0) {
        setErrors(currentErrors);
        setIsProcessing(false);
        return;
      }

      // Fully valid -> Proceed to Bulk Insert (Upsert or Insert)
      if (validRows.length > 0) {
        const { error: insertError } = await supabase.from("suppliers").insert(validRows);

        if (insertError) {
          setErrors([{ row: 0, message: "Bulk insertion failed: " + insertError.message }]);
          setIsProcessing(false);
          return;
        }

        setSuccessMsg(`Successfully imported ${validRows.length} supplier${validRows.length === 1 ? '' : 's'}!`);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setErrors([{ row: 0, message: "No valid rows found to process." }]);
      }

    } catch (err: any) {
      console.error("Upload process error:", err);
      setErrors([{ row: 0, message: err.message || "An unexpected error occurred while parsing the file." }]);
    }
    
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    e.target.value = ''; // Reset input so same file can be selected again
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
      <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <TableProperties className="w-5 h-5 text-accent" />
          Bulk Upload Suppliers
        </h2>
        <button
          onClick={handleDownloadTemplate}
          type="button"
          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg transition-colors border border-primary/20 hover:bg-primary/20"
        >
          <Download className="w-4 h-4" />
          Download Sample Template
        </button>
      </div>

      <div className="p-6">
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          htmlFor="file-upload"
          className={`relative block border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
          }`}
        >
          <input
            id="file-upload"
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleChange}
            className="hidden"
            disabled={isProcessing}
          />
          <UploadCloud className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? "text-primary" : "text-gray-400"}`} />
          <p className="text-gray-700 dark:text-gray-200 font-medium mb-1">
            Drag & drop your file here, or click to select
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Supports .CSV and .XLSX files (Strict Column Validation Enabled)
          </p>
          
          {isProcessing && (
            <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Validating & Importing...</p>
            </div>
          )}
        </label>

        {successMsg && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">{successMsg}</p>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-6 border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
             <div className="bg-red-50 dark:bg-red-900/30 px-5 py-4 border-b border-red-200 dark:border-red-900/50">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  Upload rejected: {errors.length} error{errors.length > 1 ? 's' : ''} found
                </div>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 pl-7">
                  Please fix the structural and duplicate errors below and re-upload.
                </p>
             </div>
             <div className="max-h-[300px] overflow-y-auto bg-white dark:bg-gray-800">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-5 py-3 w-20 text-center font-semibold">Row</th>
                      <th className="px-5 py-3 font-semibold">Validation Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {errors.map((err, i) => (
                      <tr key={i} className="hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
                        <td className="px-5 py-3 text-center font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/20 border-r border-gray-100 dark:border-gray-800">
                           {err.row > 0 ? err.row : '-'}
                        </td>
                        <td className="px-5 py-3 text-red-600 dark:text-red-400/90 font-medium">
                          {err.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
