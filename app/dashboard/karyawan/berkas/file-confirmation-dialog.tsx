"use client";

import { useState } from "react";

type FileConfirmationDialogProps = {
  fileName: string;
  categoryKey: string;
  isNewUpload?: boolean;
  newFile?: File;
  onClose?: () => void;
  onSuccess?: () => void;
  uploadId?: number;
};

export function FileConfirmationDialog({
  uploadId,
  fileName,
  categoryKey,
  isNewUpload = false,
  newFile,
  onClose,
  onSuccess,
}: FileConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(isNewUpload); // Auto-open for new uploads
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(action: string) {
    setIsSubmitting(true);
    try {
      if (isNewUpload && newFile) {
        // Handle new file upload
        if (action === "submit") {
          const uploadFormData = new FormData();
          uploadFormData.append("category", categoryKey);
          uploadFormData.append("title", fileName);
          uploadFormData.append("file", newFile);

          const uploadResponse = await fetch("/api/karyawan/upload", {
            method: "POST",
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const data = await uploadResponse.json();
            throw new Error(data?.error || "Gagal mengunggah berkas");
          }

          const uploadData = await uploadResponse.json();
          const submitFormData = new FormData();
          submitFormData.append("action", "submit");
          submitFormData.append("uploadId", String(uploadData.id));

          const submitResponse = await fetch("/api/karyawan/upload", {
            method: "POST",
            body: submitFormData,
          });

          if (!submitResponse.ok) {
            throw new Error("Gagal mengirim berkas");
          }

          if (onSuccess) {
            onSuccess();
          }
        } else if (action === "replace") {
          // Just close dialog and let user pick another file
          if (onClose) {
            onClose();
          }
        }
        // "delete" doesn't need to do anything for new uploads
      } else {
        // Handle existing file actions
        const formData = new FormData();
        formData.append("action", action);
        formData.append("uploadId", String(uploadId));

        const response = await fetch("/api/karyawan/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Gagal memproses berkas");
        }

        window.location.href = "/dashboard/karyawan/berkas";
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }

  // For existing files, show button to open dialog
  if (!isNewUpload) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center rounded-lg bg-[#346538] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d5a30]"
        >
          Apakah data sudah benar?
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 p-4">
            <div className="w-full max-w-sm rounded-lg border border-[#e5e7eb] bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-[#111111]">
                Konfirmasi Data
              </h3>
              <p className="mb-4 text-sm text-[#6b7280]">
                File: <span className="font-medium">{fileName}</span>
              </p>
              <p className="mb-6 text-sm text-[#6b7280]">
                Apakah data file ini sudah benar dan siap untuk dikirim?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleSubmit("submit")}
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#346538] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d5a30] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Mengirim..." : "Ya, Kirim File"}
                </button>
                <button
                  onClick={() => handleSubmit("delete")}
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-red-300 bg-[#fdebec] px-4 py-2 text-sm font-medium text-[#9f2f2d] hover:bg-[#fdebec] disabled:cursor-not-allowed disabled:bg-[#fdebec]"
                >
                  Tidak, Hapus File
                </button>
                <button
                  onClick={() => handleSubmit("replace")}
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[#e8d9a8] bg-[#fbf3db] px-4 py-2 text-sm font-medium text-[#956400] hover:bg-[#fbf3db] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Ganti File
                </button>
                <button
                  onClick={() => !isSubmitting && setIsOpen(false)}
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-4 py-2 text-sm font-medium text-[#111111] hover:bg-[#f8f9fa] disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // For new uploads, show auto-opened dialog
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[#e5e7eb] bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#111111]">
              Konfirmasi Data
            </h3>
            <p className="mb-4 text-sm text-[#6b7280]">
              File: <span className="font-medium">{fileName}</span>
            </p>
            <p className="mb-6 text-sm text-[#6b7280]">
              Apakah data file ini sudah benar dan siap untuk dikirim?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSubmit("submit")}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#346538] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d5a30] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Mengirim..." : "Ya, Kirim File"}
              </button>
              <button
                onClick={() => handleSubmit("replace")}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg border border-[#e8d9a8] bg-[#fbf3db] px-4 py-2 text-sm font-medium text-[#956400] hover:bg-[#fbf3db] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Ganti File
              </button>
              <button
                onClick={() => !isSubmitting && handleClose()}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-4 py-2 text-sm font-medium text-[#111111] hover:bg-[#f8f9fa] disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
