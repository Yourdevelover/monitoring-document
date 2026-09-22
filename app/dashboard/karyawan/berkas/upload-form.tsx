"use client";

import { FormEvent, useState } from "react";
import { FileConfirmationDialog } from "./file-confirmation-dialog";

type UploadFormProps = {
  categoryKey: "DATA_A" | "DATA_B" | "DATA_C";
  categoryLabel: string;
  isDisabled?: boolean;
};

export function UploadForm({ categoryKey, categoryLabel, isDisabled = false }: UploadFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!selectedFile) {
      setError("Silakan pilih file terlebih dahulu.");
      return;
    }

    setError(null);
    setShowDialog(true);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }

  function handleDialogClose() {
    setShowDialog(false);
  }

  function handleUploadSuccess() {
    setShowDialog(false);
    setSelectedFile(null);
    window.location.href = "/dashboard/karyawan/berkas";
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input type="hidden" name="category" value={categoryKey} />
        <input type="hidden" name="title" value={categoryLabel} />

        <label className="block text-sm font-medium text-slate-700">
          Pilih file
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            disabled={isDisabled}
            className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            required
          />
        </label>

        {selectedFile && (
          <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            File dipilih: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isDisabled || !selectedFile}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          Submit
        </button>
      </form>

      {showDialog && selectedFile && (
        <FileConfirmationDialog
          fileName={selectedFile.name}
          categoryKey={categoryKey}
          isNewUpload={true}
          newFile={selectedFile}
          onClose={handleDialogClose}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}
