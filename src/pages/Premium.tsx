import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import PremiumDesktop from "@/components/PremiumDesktop";
import PremiumFeatures from "@/components/PremiumFeatures";
import SupportChat from "@/components/SupportChat";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
const Premium = () => {
  const [showChat, setShowChat] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const {
    user
  } = useAuth();
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        if (user) {
          // Получаем профиль пользователя
          const {
            data,
            error
          } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          if (error) {
            console.error("Ошибка при загрузке профиля:", error);
            return;
          }
          setUserProfile(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [user]);
  const handleChatClick = () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Пожалуйста, войдите в аккаунт, чтобы использовать чат поддержки",
        variant: "destructive"
      });
      return;
    }
    if (!userProfile) {
      toast({
        title: "Загрузка профиля",
        description: "Пожалуйста, подождите, идет загрузка вашего профиля"
      });
      return;
    }
    setShowChat(true);
  };
  const isPremiumUser = userProfile && userProfile.subscription_type && userProfile.subscription_type !== "free";
  return <div className="container mx-auto py-6 sm:py-8 bg-grid-pattern min-h-screen px-4 sm:px-6">
      <h1 className="page-title bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        Подписки DevTalk
      </h1>
      
      {isPremiumUser && <div className="mb-6 sm:mb-8 p-4 md:p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-purple-100 dark:border-gray-600 flex flex-col md:flex-row justify-between items-center shadow-md animate-fade-in">
          <div className="w-full md:w-auto">
            <h2 className="text-lg md:text-xl font-semibold text-purple-700 dark:text-purple-300 text-center md:text-left">
              У вас активна подписка: {userProfile?.subscription_type}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1 text-center md:text-left">
              Спасибо за поддержку нашего проекта! Если у вас возникли вопросы, используйте чат поддержки.
            </p>
          </div>
          <Button onClick={handleChatClick} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white mt-4 md:mt-0 transform transition-transform duration-300 hover:scale-105 w-full md:w-auto">
            <MessageCircle className="mr-2 h-4 w-4" />
            Чат поддержки
          </Button>
        </div>}
      
      <div className="rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.01] mb-8 sm:mb-12">
        <PremiumDesktop />
      </div>
      
      

      {/* Для мобильных устройств используем Sheet */}
      {isMobile ? <Sheet open={showChat} onOpenChange={setShowChat}>
          <SheetContent side="bottom" className="p-0 h-[80vh] max-h-[90vh] overflow-hidden rounded-t-xl">
            {userProfile && <SupportChat userId={userProfile.id} onClose={() => setShowChat(false)} />}
          </SheetContent>
        </Sheet> : (/* Для десктопа используем Dialog */
    <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
            {userProfile && <SupportChat userId={userProfile.id} onClose={() => setShowChat(false)} />}
          </DialogContent>
        </Dialog>)}
    </div>;
};
export default Premium;