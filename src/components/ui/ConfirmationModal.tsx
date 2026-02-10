"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "info" | "warning";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "info"
}: ConfirmationModalProps) {
  const variantStyles = {
    danger: "bg-rose-500 hover:bg-rose-600 shadow-rose-900/20",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-900/20 text-black",
    info: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
  };

  const Icon = variant === "danger" ? ShieldAlert : (variant === "warning" ? AlertTriangle : ShieldAlert);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 flex items-center justify-center z-[201] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-2xl ${
                        variant === 'danger' ? 'bg-rose-500/10 text-rose-500' : 
                        variant === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <Dialog.Title className="text-xl font-black text-white leading-tight">
                        {title}
                      </Dialog.Title>
                    </div>

                    <Dialog.Description className="text-slate-400 text-sm leading-relaxed mb-8">
                      {description}
                    </Dialog.Description>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-colors border border-slate-700"
                      >
                        {cancelText}
                      </button>
                      <button
                        onClick={() => {
                          onConfirm();
                          onClose();
                        }}
                        className={`flex-1 px-6 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 ${variantStyles[variant]}`}
                      >
                        {confirmText}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
