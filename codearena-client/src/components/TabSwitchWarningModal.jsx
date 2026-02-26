/**
 * ═══════════════════════════════════════════════════════════════════
 * TabSwitchWarningModal — Warning/DQ UI Component
 * ═══════════════════════════════════════════════════════════════════
 *
 * Displays warning modals when tab-switch violations are detected.
 * Visually escalates from warning → final warning → disqualification.
 *
 * Props:
 *   - show: boolean — whether to display the modal
 *   - warnings: number — current violation count
 *   - maxWarnings: number — max before DQ (3)
 *   - message: string — server-provided warning text
 *   - isDisqualified: boolean — has the player been DQ'd
 *   - onDismiss: () => void — callback to close (not available when DQ'd)
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, XCircle, ShieldAlert, ShieldX } from 'lucide-react';

export default function TabSwitchWarningModal({
  show,
  warnings,
  maxWarnings,
  message,
  isDisqualified,
  onDismiss,
}) {
  const audioRef = useRef(null);

  // Play alert sound on modal show
  useEffect(() => {
    if (!show) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isDisqualified) {
        // Low, ominous tone for DQ
        osc.frequency.value = 200;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (warnings >= maxWarnings - 1) {
        // Urgent double-beep for final warning
        osc.frequency.value = 800;
        gain.gain.value = 0.2;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 1000;
          gain2.gain.value = 0.2;
          osc2.start();
          osc2.stop(ctx.currentTime + 0.15);
        }, 200);
      } else {
        // Single warning beep
        osc.frequency.value = 600;
        gain.gain.value = 0.15;
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // AudioContext not available — fail silently
    }
  }, [show, warnings, isDisqualified, maxWarnings]);

  if (!show) return null;

  // ── Visual escalation based on severity ──
  const isFinalWarning = warnings >= maxWarnings - 1 && !isDisqualified;

  const bgColor = isDisqualified
    ? 'from-red-950 to-red-900'
    : isFinalWarning
      ? 'from-orange-950 to-red-950'
      : 'from-yellow-950 to-orange-950';

  const borderColor = isDisqualified
    ? 'border-red-500'
    : isFinalWarning
      ? 'border-orange-500'
      : 'border-yellow-500';

  const iconColor = isDisqualified
    ? 'text-red-400'
    : isFinalWarning
      ? 'text-orange-400'
      : 'text-yellow-400';

  const Icon = isDisqualified ? ShieldX : isFinalWarning ? ShieldAlert : AlertTriangle;

  const title = isDisqualified
    ? 'DISQUALIFIED'
    : isFinalWarning
      ? '⚠️ FINAL WARNING'
      : '⚠️ TAB SWITCH DETECTED';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isDisqualified
            ? 'bg-red-950/90 backdrop-blur-xl'
            : 'bg-black/70 backdrop-blur-md'
        }`}
      />

      {/* Modal */}
      <div
        className={`
          relative max-w-md w-full mx-4 rounded-2xl border-2 ${borderColor}
          bg-gradient-to-b ${bgColor} shadow-2xl overflow-hidden
          animate-[tabswitch-bounce_0.4s_ease-out]
        `}
      >
        {/* Pulsing border glow */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-30 ${
            isDisqualified ? 'animate-pulse' : ''
          }`}
          style={{
            boxShadow: isDisqualified
              ? '0 0 60px rgba(239, 68, 68, 0.5), inset 0 0 60px rgba(239, 68, 68, 0.1)'
              : isFinalWarning
                ? '0 0 40px rgba(249, 115, 22, 0.4)'
                : '0 0 30px rgba(234, 179, 8, 0.3)',
          }}
        />

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Icon */}
          <div className={`mx-auto mb-5 ${isDisqualified ? 'animate-bounce' : ''}`}>
            <div
              className={`
                w-20 h-20 mx-auto rounded-2xl rotate-12 flex items-center justify-center
                ${isDisqualified
                  ? 'bg-red-500/20 border-2 border-red-500/50'
                  : isFinalWarning
                    ? 'bg-orange-500/20 border-2 border-orange-500/50'
                    : 'bg-yellow-500/20 border-2 border-yellow-500/50'
                }
              `}
            >
              <div className="-rotate-12">
                <Icon size={40} className={iconColor} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2
            className={`text-2xl font-black tracking-tight mb-3 ${
              isDisqualified ? 'text-red-400' : isFinalWarning ? 'text-orange-400' : 'text-yellow-400'
            }`}
          >
            {title}
          </h2>

          {/* Message */}
          <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed max-w-xs mx-auto">
            {message || 'Tab switching is not allowed during BLIND coding mode.'}
          </p>

          {/* Warning Counter */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3">
              {Array.from({ length: maxWarnings }).map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
                    border-2 transition-all duration-300
                    ${i < warnings
                      ? isDisqualified
                        ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40'
                        : 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/40'
                      : 'bg-slate-800/50 border-slate-700 text-slate-600'
                    }
                  `}
                >
                  {i < warnings ? <XCircle size={18} /> : i + 1}
                </div>
              ))}
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-3 uppercase tracking-wider">
              Violations: {warnings} / {maxWarnings}
            </p>
          </div>

          {/* Action buttons */}
          {isDisqualified ? (
            <div className="space-y-3">
              <p className="text-red-400/80 text-xs font-bold uppercase tracking-widest animate-pulse">
                You have been removed from this competition
              </p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wider"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <button
              onClick={onDismiss}
              className={`
                w-full py-3 font-bold rounded-xl transition-all text-sm uppercase tracking-wider
                ${isFinalWarning
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }
              `}
            >
              {isFinalWarning ? 'I Understand — This is My Last Chance' : 'Continue Coding'}
            </button>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes tabswitch-bounce {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          60% { transform: scale(1.03) translateY(-5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
