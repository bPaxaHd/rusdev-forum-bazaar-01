
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TopicCard from "@/components/TopicCard";
import CreateTopicDialog from "@/components/CreateTopicDialog";
import { MessageCircle, Search, Filter, Monitor, Database, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TopicData {
  id: string; // Changed from number to string to match Supabase UUID format
  title: string;
  content: string;
  user_id: string;
  category: string; // Changed from union type to string
  created_at: string;
  updated_at: string;
  likes: number;
  views: number;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
  comments?: { id: string }[];
}

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "frontend" | "backend" | "fullstack">("all");
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  
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
            profiles:user_id(username, avatar_url),
            comments:comments(id)
          `)
          .order('created_at', { ascending: false });
          
        if (activeFilter !== "all") {
          query = query.eq('category', activeFilter);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Ошибка при загрузке тем:", error);
          return;
        }
        
        // Преобразуем данные в формат, который ожидает TopicCard
        const formattedTopics = data.map(topic => ({
          ...topic,
          profile: topic.profiles,
          comments: topic.comments || []
        }));
        
        setTopics(formattedTopics as TopicData[]);
      } catch (error) {
        console.error("Ошибка при загрузке тем:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopics();
    
    // Подписываемся на изменения в таблице topics
    const subscription = supabase
      .channel('public:topics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, (payload) => {
        fetchTopics();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [activeFilter]);

  // Функция для преобразования темы в формат для компонента TopicCard
  const mapTopicToCardProps = (topic: TopicData) => {
    const preview = topic.content.length > 150 
      ? topic.content.substring(0, 150) + '...'
      : topic.content;
      
    // Cast category to the specific type for the TopicCard component
    const typedCategory = topic.category as "frontend" | "backend" | "fullstack";
      
    return {
      id: topic.id, // Use the UUID directly
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
      tags: [typedCategory], // Добавляем базовый тег из категории
      lastActivity: topic.updated_at || topic.created_at,
      category: typedCategory
    };
  };
  
  // Фильтрация тем по поисковому запросу
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = searchQuery
      ? topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        topic.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
                         
    return matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-secondary/50 py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-3">
              Форум разработчиков
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Обсуждения и вопросы
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Задавайте вопросы, делитесь опытом и участвуйте в дискуссиях с русскоязычными разработчиками.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <CreateTopicDialog />
              
              <div className="relative flex-grow">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-10 h-10 w-full" 
                  placeholder="Поиск по темам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forum Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="w-full md:w-1/4">
              <div className="card-glass p-6 sticky top-24">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Filter size={16} />
                  Фильтры
                </h3>
                
                <div className="space-y-2">
                  <Button 
                    variant={activeFilter === "all" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveFilter("all")}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Все темы
                  </Button>
                  <Button 
                    variant={activeFilter === "frontend" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveFilter("frontend")}
                  >
                    <Monitor size={16} className="mr-2" />
                    Frontend
                  </Button>
                  <Button 
                    variant={activeFilter === "backend" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveFilter("backend")}
                  >
                    <Database size={16} className="mr-2" />
                    Backend
                  </Button>
                  <Button 
                    variant={activeFilter === "fullstack" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveFilter("fullstack")}
                  >
                    <Layers size={16} className="mr-2" />
                    Fullstack
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border/50">
                  <h3 className="font-medium mb-3">Популярные теги</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      React
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      JavaScript
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      Node.js
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      Python
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      API
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      TypeScript
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-3/4">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-medium">
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
                    <div key={index} className="p-6 rounded-lg border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Skeleton className="h-4 w-20 mb-2" />
                          <Skeleton className="h-6 w-64 mb-2" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full mb-6" />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
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
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground mb-4">Темы не найдены</p>
                  <CreateTopicDialog />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Forum;
