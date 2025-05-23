
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAuthMethods() {
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();

  const signUp = async (email: string, password: string, username: string) => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username
          }
        } 
      });
      
      if (error) {
        toast({
          title: "Ошибка регистрации",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Успешная регистрация",
        description: "Пожалуйста, проверьте вашу почту для подтверждения.",
      });
      
      return { error: null };
    } catch (error) {
      console.error("Error in signUp:", error);
      return { error };
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Ошибка входа",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в DevTalk!",
      });
      
      return { error: null };
    } catch (error) {
      console.error("Error in signIn:", error);
      return { error };
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        toast({
          title: "Ошибка входа через Google",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in signInWithGoogle:", error);
      toast({
        title: "Ошибка входа через Google",
        description: "Не удалось выполнить вход через Google",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Ошибка выхода",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    authLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };
}
