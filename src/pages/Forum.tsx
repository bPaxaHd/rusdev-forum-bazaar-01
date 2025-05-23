import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TopicCard from "@/components/TopicCard";
import CreateTopicDialog from "@/components/CreateTopicDialog";
import PremiumTopicDialog from "@/components/PremiumTopicDialog";
import { MessageCircle, Search, Filter, Monitor, Database, Layers, Sparkles, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { initDb } from "@/utils/db-helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ProfileResponse } from "@/types/auth";

interface TopicData {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category: string;
  created_at: string;
  updated_at: string;
  likes: number;
  views: number;
  is_premium?: boolean;
  profile?: ProfileResponse;
  profiles?: ProfileResponse;
  comments?: { id: string }[];
}

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "frontend" | "backend" | "fullstack">("all");
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [premiumTopics, setPremiumTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"regular" | "premium">("regular");
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    initDb().then(success => {
      console.log("DB initialization status:", success ? "success" : "failed");
    });
  }, []);
  
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("topics")
          .select(`
            id, 
            title, 
            content, 
            user_id, 
            category, 
            created_at, 
            updated_at, 
            likes, 
            views,
            is_premium,
            profiles:user_id(username, avatar_url, subscription_type),
            comments:comments(id)
          `)
          .eq('is_premium', false)
          .order('created_at', { ascending: false });
          
        if (activeFilter !== "all") {
          query = query.eq('category', activeFilter);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Ошибка при загрузке тем:", error);
          return;
        }
        
        if (!data) {
          setTopics([]);
          return;
        }
        
        const formattedTopics = data.map(topic => ({
          ...topic,
          profile: {
            username: topic.profiles?.[0]?.username || "Unknown",
            avatar_url: topic.profiles?.[0]?.avatar_url,
            subscription_type: topic.profiles?.[0]?.subscription_type
          },
          profiles: topic.profiles?.[0],
          comments: topic.comments || []
        })) as TopicData[];
        
        setTopics(formattedTopics);
      } catch (error) {
        console.error("Ошибка при загрузке тем:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchPremiumTopics = async () => {
      try {
        setPremiumLoading(true);
        
        let query = supabase
          .from("topics")
          .select(`
            id, 
            title, 
            content, 
            user_id, 
            category, 
            created_at, 
            updated_at, 
            likes, 
            views,
            is_premium,
            profiles:user_id(username, avatar_url, subscription_type),
            comments:comments(id)
          `)
          .eq('is_premium', true)
          .order('created_at', { ascending: false });
          
        if (activeFilter !== "all") {
          query = query.eq('category', activeFilter);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Ошибка при загрузке премиум тем:", error);
          return;
        }
        
        if (!data) {
          setPremiumTopics([]);
          return;
        }
        
        const formattedTopics = data.map(topic => ({
          ...topic,
          profile: {
            username: topic.profiles?.[0]?.username || "Unknown",
            avatar_url: topic.profiles?.[0]?.avatar_url,
            subscription_type: topic.profiles?.[0]?.subscription_type
          },
          profiles: topic.profiles?.[0],
          comments: topic.comments || []
        })) as TopicData[];
        
        setPremiumTopics(formattedTopics);
      } catch (error) {
        console.error("Ошибка при загрузке премиум тем:", error);
      } finally {
        setPremiumLoading(false);
      }
    };
    
    fetchTopics();
    fetchPremiumTopics();
    
    const subscription = supabase
      .channel('public:topics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, (payload) => {
        const newTopic = payload.new as TopicData;
        if (newTopic.is_premium) {
          fetchPremiumTopics();
        } else {
          fetchTopics();
        }
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [activeFilter]);

  const mapTopicToCardProps = (topic: TopicData) => {
    const preview = topic.content.length > 150 
      ? topic.content.substring(0, 150) + '...'
      : topic.content;
      
    const typedCategory = topic.category as "frontend" | "backend" | "fullstack";
      
    return {
      id: topic.id,
      title: topic.title,
      preview: preview,
      author: topic.profile?.username || "Неизвестный пользователь",
      authorRole: typedCategory === "frontend" 
        ? "Frontend разработчик" 
        : typedCategory === "backend" 
          ? "Backend разработчик" 
          : "Fullstack разработчик",
      authorAvatar: topic.profile?.avatar_url || "",
      repliesCount: topic.comments?.length || 0,
      likesCount: topic.likes || 0,
      viewsCount: topic.views || 0,
      tags: [typedCategory, ...(topic.is_premium ? ["premium"] : [])],
      lastActivity: topic.updated_at || topic.created_at,
      category: typedCategory,
      isPremium: topic.is_premium,
      sponsorLevel: topic.profile?.subscription_type as 'premium' | 'business' | 'sponsor' | undefined
    };
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = searchQuery
      ? topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        topic.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
                         
    return matchesSearch;
  });
  
  const filteredPremiumTopics = premiumTopics.filter(topic => {
    const matchesSearch = searchQuery
      ? topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        topic.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
                         
    return matchesSearch;
  });
  
  const hasPremiumAccess = user ? true : false;

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-200 dark:bg-blue-900 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full filter blur-3xl opacity-30"></div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
              <Sparkles size={14} className="mr-1" /> Форум разработчиков
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300">
              Обсуждения и вопросы
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Задавайте вопросы, делитесь опытом и участвуйте в дискуссиях с русскоязычными разработчиками.
            </p>
            
            <Tabs defaultValue="regular" className="mb-6" onValueChange={(value) => setActiveTab(value as "regular" | "premium")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="regular">Обычный форум</TabsTrigger>
                <TabsTrigger value="premium" className="flex items-center gap-1">
                  <Crown size={14} className="text-amber-500" />
                  Премиум помощь
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="regular" className="mt-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <CreateTopicDialog />
                  
                  <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-10 h-10 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-blue-100 dark:border-gray-700 focus-visible:ring-blue-500" 
                      placeholder="Поиск по темам..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="premium" className="mt-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <PremiumTopicDialog />
                  
                  <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-10 h-10 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-100 dark:border-amber-700 focus-visible:ring-amber-500" 
                      placeholder="Поиск по премиум темам..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <Crown size={16} />
                    <p className="text-sm">
                      Премиум помощь - это приоритетные темы, которые обрабатываются в первую очередь нашими экспертами.
                      {!hasPremiumAccess && " Доступно только для пользователей с премиум подпиской."}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/4">
              <div className="card-glass p-6 sticky top-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-blue-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Filter size={16} />
                  Фильтры
                </h3>
                
                <div className="space-y-2">
                  <Button 
                    variant={activeFilter === "all" ? "default" : "ghost"} 
                    className={`w-full justify-start ${activeFilter === "all" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                    onClick={() => setActiveFilter("all")}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Все темы
                  </Button>
                  <Button 
                    variant={activeFilter === "frontend" ? "default" : "ghost"} 
                    className={`w-full justify-start ${activeFilter === "frontend" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                    onClick={() => setActiveFilter("frontend")}
                  >
                    <Monitor size={16} className="mr-2" />
                    Frontend
                  </Button>
                  <Button 
                    variant={activeFilter === "backend" ? "default" : "ghost"} 
                    className={`w-full justify-start ${activeFilter === "backend" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                    onClick={() => setActiveFilter("backend")}
                  >
                    <Database size={16} className="mr-2" />
                    Backend
                  </Button>
                  <Button 
                    variant={activeFilter === "fullstack" ? "default" : "ghost"} 
                    className={`w-full justify-start ${activeFilter === "fullstack" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                    onClick={() => setActiveFilter("fullstack")}
                  >
                    <Layers size={16} className="mr-2" />
                    Fullstack
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-blue-100 dark:border-gray-700">
                  <h3 className="font-medium mb-3 text-blue-700 dark:text-blue-300">Популярные теги</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300">
                      React
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300">
                      JavaScript
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300">
                      Node.js
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300">
                      Python
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300">
                      API
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300">
                      TypeScript
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-3/4">
              {activeTab === "regular" ? (
                <>
                  <div className="mb-6 flex items-center justify-between bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-lg border border-blue-100 dark:border-gray-700">
                    <h2 className="text-xl font-medium text-blue-700 dark:text-blue-300">
                      {activeFilter === "all" 
                        ? "Все темы" 
                        : activeFilter === "frontend" 
                          ? "Frontend темы" 
                          : activeFilter === "backend" 
                            ? "Backend темы" 
                            : "Fullstack темы"}
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      {filteredTopics.length} {filteredTopics.length === 1 ? "тема" : filteredTopics.length > 1 && filteredTopics.length < 5 ? "темы" : "тем"}
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="p-6 rounded-lg border border-blue-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <Skeleton className="h-4 w-20 mb-2 bg-blue-100 dark:bg-gray-700" />
                              <Skeleton className="h-6 w-64 mb-2 bg-blue-100 dark:bg-gray-700" />
                            </div>
                            <Skeleton className="h-4 w-16 bg-blue-100 dark:bg-gray-700" />
                          </div>
                          <Skeleton className="h-4 w-full mb-6 bg-blue-100 dark:bg-gray-700" />
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-8 rounded-full bg-blue-100 dark:bg-gray-700" />
                              <div>
                                <Skeleton className="h-4 w-20 mb-1 bg-blue-100 dark:bg-gray-700" />
                                <Skeleton className="h-3 w-24 bg-blue-100 dark:bg-gray-700" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Skeleton className="h-4 w-8 bg-blue-100 dark:bg-gray-700" />
                              <Skeleton className="h-4 w-8 bg-blue-100 dark:bg-gray-700" />
                              <Skeleton className="h-4 w-8 bg-blue-100 dark:bg-gray-700" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredTopics.length > 0 ? (
                    <div className="space-y-4">
                      {filteredTopics.map((topic) => (
                        <TopicCard key={topic.id} {...mapTopicToCardProps(topic)} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg border-blue-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                      <p className="text-muted-foreground mb-4">Темы не найдены</p>
                      <CreateTopicDialog />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                    <h2 className="text-xl font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <Crown size={18} />
                      Премиум помощь
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      {filteredPremiumTopics.length} {filteredPremiumTopics.length === 1 ? "тема" : filteredPremiumTopics.length > 1 && filteredPremiumTopics.length < 5 ? "темы" : "тем"}
                    </div>
                  </div>
                  
                  {premiumLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="p-6 rounded-lg border border-amber-200 dark:border-amber-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <Skeleton className="h-4 w-20 mb-2 bg-amber-100 dark:bg-amber-700/50" />
                              <Skeleton className="h-6 w-64 mb-2 bg-amber-100 dark:bg-amber-700/50" />
                            </div>
                            <Skeleton className="h-4 w-16 bg-amber-100 dark:bg-amber-700/50" />
                          </div>
                          <Skeleton className="h-4 w-full mb-6 bg-amber-100 dark:bg-amber-700/50" />
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-700/50" />
                              <div>
                                <Skeleton className="h-4 w-20 mb-1 bg-amber-100 dark:bg-amber-700/50" />
                                <Skeleton className="h-3 w-24 bg-amber-100 dark:bg-amber-700/50" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Skeleton className="h-4 w-8 bg-amber-100 dark:bg-amber-700/50" />
                              <Skeleton className="h-4 w-8 bg-amber-100 dark:bg-amber-700/50" />
                              <Skeleton className="h-4 w-8 bg-amber-100 dark:bg-amber-700/50" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : hasPremiumAccess ? (
                    filteredPremiumTopics.length > 0 ? (
                      <div className="space-y-4">
                        {filteredPremiumTopics.map((topic) => (
                          <TopicCard key={topic.id} {...mapTopicToCardProps(topic)} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg border-amber-200 dark:border-amber-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                        <p className="text-muted-foreground mb-4">Премиум темы не найдены</p>
                        <PremiumTopicDialog />
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 border rounded-lg border-amber-200 dark:border-amber-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                      <Crown size={48} className="mx-auto mb-4 text-amber-500" />
                      <h3 className="text-xl font-medium mb-2">Доступно только для премиум пользователей</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Получите приоритетную помощь от экспертов, задавая вопросы в разделе премиум-поддержки
                      </p>
                      <Button asChild className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                        <a href="/premium">Узнать о премиум-подписке</a>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Forum;
