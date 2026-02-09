"use client";

interface SuccessMessageProps {
  onReset: () => void;
}

export default function SuccessMessage({ onReset }: SuccessMessageProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
      {/* Animated checkmark */}
      <div className="success-checkmark mb-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text mb-3">
        Bedankt voor het invullen!
      </h2>
      <p className="text-text-muted mb-8 max-w-md mx-auto">
        Uw evaluatieformulier is succesvol verzonden. We nemen zo snel mogelijk
        contact met u op.
      </p>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Nieuw formulier invullen
      </button>
    </div>
  );
}
