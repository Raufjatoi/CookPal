
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Clock, Utensils } from 'lucide-react';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string;
  difficulty?: string;
}

interface Conversation {
  id: string;
  ingredients: string;
  recipe: Recipe;
  timestamp: Date;
}

interface ConversationHistoryProps {
  conversations: Conversation[];
  onLoadConversation: (conversation: Conversation) => void;
  onClose: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ 
  conversations, 
  onLoadConversation, 
  onClose 
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="mb-8 shadow-xl border-amber-200 animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-amber-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Conversations
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-amber-600 hover:text-amber-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-amber-600">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No previous conversations yet.</p>
              <p className="text-sm">Start cooking to see your recipe history!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id} 
                  className="border-amber-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onLoadConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-amber-800 truncate">
                        {conversation.recipe.title}
                      </h4>
                      <span className="text-xs text-amber-600 whitespace-nowrap ml-2">
                        {formatDate(conversation.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-amber-600 mb-2">
                      <strong>Ingredients:</strong> {conversation.ingredients}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        {conversation.recipe.ingredients.length} ingredients
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadConversation(conversation);
                        }}
                      >
                        Load Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationHistory;
