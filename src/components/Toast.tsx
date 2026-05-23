import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500 to-green-600',
      borderColor: 'border-green-400',
      iconColor: 'text-white',
    },
    error: {
      icon: XCircle,
      bgColor: 'from-red-500 to-red-600',
      borderColor: 'border-red-400',
      iconColor: 'text-white',
    },
    info: {
      icon: AlertCircle,
      bgColor: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-400',
      iconColor: 'text-white',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`fixed top-4 right-4 z-[9999] max-w-md w-full bg-gradient-to-r ${bgColor} text-white rounded-2xl shadow-2xl border-2 ${borderColor} overflow-hidden`}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-semibold leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="h-1 bg-white/30"
      />
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <div key={toast.id} style={{ marginTop: index > 0 ? '1rem' : 0 }}>
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => onRemove(toast.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Toast;
