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
      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <input type="hidden" name="category" value={categoryKey} />
        <input type="hidden" name="title" value={categoryLabel} />

        <label className="block text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">
          Pilih file
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            disabled={isDisabled}
            className="mt-1 block w-full rounded-md border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[13px] text-[#111111] file:mr-2 file:rounded file:border-0 file:bg-[#111111] file:px-2 file:py-1 file:text-[11px] file:font-medium file:text-white disabled:cursor-not-allowed disabled:bg-[#f8f9fa] disabled:text-[#6b7280]"
            required
          />
        </label>

        {selectedFile && (
          <p className="rounded-md bg-[#e1f3fe] px-2.5 py-1.5 text-xs font-medium text-[#1f6c9f]">Dipilih: {selectedFile.name}</p>
        )}

        {error ? <p className="rounded-md bg-[#fdebec] px-2.5 py-1.5 text-xs font-medium text-[#9f2f2d]">{error}</p> : null}

        <button
          type="submit"
          disabled={isDisabled || !selectedFile}
          className="inline-flex w-full items-center justify-center rounded-md bg-[#111111] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
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
