"use client";

import { useState, ReactElement, cloneElement } from "react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  trigger: ReactElement; // must be a React element (like <button>)
}

export function ConfirmDialog({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  trigger,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger (inject onClick) */}
       {cloneElement(trigger, {
        onClick: (e: any) => {
          e.preventDefault();
          trigger.props.onClick?.(e); // ✅ preserve original onClick
          setOpen(true);
        },
      })}

 
      {/* Overlay + Bottom Sheet */}
      {open && (
        <div
        style={{marginTop:"100px", border:"1px solid orange"}}
          className="fixed inset-0 z-150 flex focus-glowC  flex-col justify-end bg-card  w-200 text-card"
          onClick={() => setOpen(false)} // click outside to close
        >
          <div
                 style={{border:"1px solid orange", width:"200px"}}

            className="bg-card sidebar-ring rounded-t-2xl shadow-lg p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            <h2 className="text-lg font-semibold mb-2 text-center  text-orange-400">{title}</h2>
            <p className="text-sm  mb-6 text-center text-foreground">{description}</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : confirmText}
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="w-full px-4 py-3 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(10px);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.25s ease-out;
        }
      `}</style>

      {/* <div style={{background: "red",  width:"1000px", height:"1000px"}}>

      </div> */}
    </>
  );
}
