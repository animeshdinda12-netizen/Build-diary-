import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useApp();

  if (!confirmModal || !confirmModal.isOpen) return null;

  return (
    <div 
      id="confirm-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeConfirmModal}
    >
      <div 
        id="confirm-modal-content"
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${confirmModal.isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {confirmModal.isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-lg font-bold text-neutral-100">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-neutral-400">Action confirmation</p>
            </div>
          </div>
          <button
            id="confirm-modal-close"
            onClick={closeConfirmModal}
            className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800/80 text-sm text-neutral-300 leading-relaxed">
          {confirmModal.message}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={closeConfirmModal}
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700/80 rounded-xl border border-neutral-700/50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-modal-action-btn"
            type="button"
            onClick={() => {
              confirmModal.onConfirm();
              closeConfirmModal();
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-lg ${
              confirmModal.isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/30'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-950/30'
            }`}
          >
            {confirmModal.confirmLabel || (confirmModal.isDestructive ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
