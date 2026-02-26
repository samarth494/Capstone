/**
 * ═══════════════════════════════════════════════════════════════════
 * useTabSwitchDetection — Frontend Detection Hook
 * ═══════════════════════════════════════════════════════════════════
 *
 * Detects tab switches / window blur / visibility changes
 * and emits socket events to the server for authoritative handling.
 *
 * This hook does NOT enforce anything — it only DETECTS and REPORTS.
 * All enforcement (counting, warnings, DQ) happens server-side.
 *
 * DETECTION METHODS:
 *   1. Page Visibility API (document.visibilitychange)
 *   2. Window blur/focus events
 *
 * ACTIVATION CONDITIONS (all must be true):
 *   - isBlindMode === true
 *   - isActive === true (competition has started, not ended)
 *   - Not already disqualified
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from "react";

const MAX_WARNINGS = 3;

export default function useTabSwitchDetection({
  socket,
  eventId,
  userId,
  isBlindMode = false,
  isActive = false,
}) {
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isDisqualified, setIsDisqualified] = useState(false);

  // Use a ref to prevent duplicate emissions within a short window.
  // The visibilitychange and blur events can fire nearly simultaneously.
  const lastEmitRef = useRef(0);
  const DEBOUNCE_MS = 1000; // Minimum ms between emissions

  // Whether detection should be active
  const shouldDetect = isBlindMode && isActive && !isDisqualified;

  // ── EMIT TAB SWITCH EVENT ──
  const emitTabSwitch = useCallback(() => {
    if (!socket || !eventId || !userId || !shouldDetect) return;

    const now = Date.now();
    if (now - lastEmitRef.current < DEBOUNCE_MS) return; // Debounce
    lastEmitRef.current = now;

    console.log("[TabSwitch] Tab switch detected — emitting to server...");
    socket.emit("tab-switch-detected", { eventId, userId });
  }, [socket, eventId, userId, shouldDetect]);

  // ── LISTEN FOR SERVER RESPONSES ──
  useEffect(() => {
    if (!socket) return;

    const handleWarning = ({ warnings: w, maxWarnings, message }) => {
      console.log(`[TabSwitch] Server warning: ${w}/${maxWarnings}`);
      setWarnings(w);
      setWarningMessage(message);
      setShowWarningModal(true);
    };

    const handleDisqualification = ({ warnings: w, message }) => {
      console.log(`[TabSwitch] DISQUALIFIED: ${message}`);
      setWarnings(w);
      setWarningMessage(message);
      setIsDisqualified(true);
      setShowWarningModal(true);
    };

    socket.on("tabswitch:warning", handleWarning);
    socket.on("tabswitch:disqualified", handleDisqualification);

    return () => {
      socket.off("tabswitch:warning", handleWarning);
      socket.off("tabswitch:disqualified", handleDisqualification);
    };
  }, [socket]);

  // ── REGISTER DETECTION LISTENERS ──
  useEffect(() => {
    if (!shouldDetect) return;

    // 1. Page Visibility API
    const handleVisibilityChange = () => {
      if (document.hidden) {
        emitTabSwitch();
      }
    };

    // 2. Window blur (covers Alt+Tab, task switcher, etc.)
    const handleBlur = () => {
      emitTabSwitch();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    console.log(
      "[TabSwitch] Detection activated (BLIND mode, competition active)",
    );

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      console.log("[TabSwitch] Detection deactivated");
    };
  }, [shouldDetect, emitTabSwitch]);

  // ── DISMISS WARNING MODAL ──
  const dismissWarning = useCallback(() => {
    if (!isDisqualified) {
      setShowWarningModal(false);
    }
    // DQ modal stays visible — cannot dismiss
  }, [isDisqualified]);

  return {
    warnings,
    maxWarnings: MAX_WARNINGS,
    showWarningModal,
    warningMessage,
    isDisqualified,
    dismissWarning,
  };
}
