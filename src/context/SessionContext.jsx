import { createContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState(null);
  const [sessionError, setSessionError] = useState(null);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);
    }
    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function handleSignUp(email, password, username) {
    setSessionLoading(true);
    setSessionError(null);
    setSessionMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, admin: true },
      },
    });

    if (error) setSessionError(error.message);
    else setSessionMessage("Registration successful!");

    setSessionLoading(false);
  }

  async function handleSignIn(email, password) {
    setSessionLoading(true);
    setSessionError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setSessionError(error.message);
    else setSession(data.session);
    setSessionLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        sessionLoading,
        sessionMessage,
        sessionError,
        handleSignUp,
        handleSignIn,
        handleSignOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
