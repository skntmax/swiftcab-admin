"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { SWC_KEYS } from "@constants";
import { AUTH_SESSION } from "@utils/authSessionConfig";
import { clearAuthSession, refreshAuthSession } from "@utils/authSession";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "click", "scroll", "touchstart"];
const LAST_ACTIVITY_KEY = "swc.lastActivity";

function hasAccessToken() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${SWC_KEYS.SWC_TOKEN}=`));
}

function readLastActivity() {
  const stored = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : Date.now();
}

export default function SessionGuard() {
  const [promptOpen, setPromptOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(AUTH_SESSION.idlePromptMs / 1000));
  const lastActivityRef = useRef(Date.now());
  const promptShownAtRef = useRef(0);
  const loggingOutRef = useRef(false);

  const logout = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setPromptOpen(false);
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    await clearAuthSession();
    window.location.href = "/";
  }, []);

  const markActivity = useCallback(() => {
    if (promptShownAtRef.current) return;
    const now = Date.now();
    lastActivityRef.current = now;
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  }, []);

  const continueSession = useCallback(() => {
    promptShownAtRef.current = 0;
    setPromptOpen(false);
    markActivity();
    void refreshAuthSession().catch(() => {
      void logout();
    });
  }, [logout, markActivity]);

  useEffect(() => {
    if (!hasAccessToken()) return undefined;
    lastActivityRef.current = readLastActivity();
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivityRef.current));

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });

    const idleTimer = window.setInterval(() => {
      if (!hasAccessToken()) return;
      const now = Date.now();
      if (!promptShownAtRef.current) {
        if (now - lastActivityRef.current >= AUTH_SESSION.idleMs) {
          promptShownAtRef.current = now;
          setSecondsLeft(Math.ceil(AUTH_SESSION.idlePromptMs / 1000));
          setPromptOpen(true);
        }
        return;
      }
      const remaining = AUTH_SESSION.idlePromptMs - (now - promptShownAtRef.current);
      setSecondsLeft(Math.max(0, Math.ceil(remaining / 1000)));
      if (remaining <= 0) {
        void logout();
      }
    }, 1000);

    const refreshTimer = window.setInterval(() => {
      if (!hasAccessToken() || promptShownAtRef.current) return;
      void refreshAuthSession().catch(() => {
        void logout();
      });
    }, AUTH_SESSION.refreshIntervalMs);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      window.clearInterval(idleTimer);
      window.clearInterval(refreshTimer);
    };
  }, [logout, markActivity]);

  if (!promptOpen) return null;

  return (
    <Dialog
      open={promptOpen}
      disableEscapeKeyDown
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-desc"
    >
      <DialogTitle id="session-timeout-title">Continue your session?</DialogTitle>
      <DialogContent>
        <Typography id="session-timeout-desc">
          You have been inactive. Choose continue to stay signed in, or you will be signed out in {secondsLeft}s.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => void logout()} color="inherit">
          Log out
        </Button>
        <Button onClick={continueSession} variant="contained" autoFocus>
          Continue session
        </Button>
      </DialogActions>
    </Dialog>
  );
}
