import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, MicOff, Speaker, RefreshCw, History, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RecipeDisplay from './RecipeDisplay';
import ConversationHistory from './ConversationHistory';
import VoiceInput from './VoiceInput';

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

const CookPal = () => {
  const [ingredients, setIngredients] = useState('');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recipeSource, setRecipeSource] = useState<'ai' | 'real'>('ai');
  const { toast } = useToast();

  // Load conversations from localStorage on component mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('cookpal-conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  // Save conversations to localStorage
  const saveConversation = (newConversation: Conversation) => {
    const updatedConversations = [newConversation, ...conversations.slice(0, 4)];
    setConversations(updatedConversations);
    localStorage.setItem('cookpal-conversations', JSON.stringify(updatedConversations));
  };

const apiKey = import.meta.env.VITE_GROQ_API;
  const generateAIRecipe = async (userIngredients: string): Promise<Recipe> => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a creative chef assistant.Generate one easy and quick recipe based on the given ingredients. Format your response as JSON with: title, ingredients (array), instructions (array), cookingTime(string), difficulty. no extra info please just what i tell.'
          },
          {
            role: 'user',
            content: `Suggest 1 recipe based on the following ingredients: ${userIngredients}. Make sure it's easy and quick to cook, and include steps and ingredients.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate recipe');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const recipe = JSON.parse(content);
      return recipe;
    } catch {
      // Fallback parsing if JSON is malformed
      const lines = content.split('\n').filter((line: string) => line.trim());
      return {
        title: lines[1] || 'Delicious Recipe',
        ingredients: lines.slice(2, 6).map((line: string) => line.replace(/^-\s*/, '')),
        instructions: lines.slice(6).map((line: string, index: number) => `${index + 1}. ${line.replace(/^\d+\.\s*/, '')}`),
        cookingTime: '20-30 minutes',
        difficulty: 'Easy'
      };
    }
  };

  const fetchRealRecipe = async (userIngredients: string): Promise<Recipe> => {
    // Extractin just the first few ingredients fn (for noe)
    const ingredientList = userIngredients.split(',').map(i => i.trim()).slice(0, 2).join(',');
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientList}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch real recipe');
    }

    const data = await response.json();
    if (!data.meals || data.meals.length === 0) {
      throw new Error('No recipes found for these ingredients');
    }

    const meal = data.meals[0];
    const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
    const detailData = await detailResponse.json();
    const mealDetail = detailData.meals[0];

    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = mealDetail[`strIngredient${i}`];
      const measure = mealDetail[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure} ${ingredient}`.trim());
      }
    }

    const instructions = mealDetail.strInstructions.split(/\r?\n/).filter((step: string) => step.trim().length > 0);

    return {
      title: mealDetail.strMeal,
      ingredients,
      instructions,
      cookingTime: '30-45 minutes',
      difficulty: 'Medium'
    };
  };

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      toast({
        title: "Please enter ingredients",
        description: "Add some ingredients to generate a recipe",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let recipe: Recipe;
      
      if (recipeSource === 'ai') {
        recipe = await generateAIRecipe(ingredients);
      } else {
        recipe = await fetchRealRecipe(ingredients);
      }

      setCurrentRecipe(recipe);

      // Save to conversation history
      const newConversation: Conversation = {
        id: Date.now().toString(),
        ingredients,
        recipe,
        timestamp: new Date()
      };
      saveConversation(newConversation);

      toast({
        title: "Recipe generated!",
        description: "Your delicious recipe is ready to cook",
      });
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "Error generating recipe",
        description: "Please try again or check your ingredients",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setIngredients(transcript);
    setIsListening(false);
  };

  const loadFromHistory = (conversation: Conversation) => {
    setIngredients(conversation.ingredients);
    setCurrentRecipe(conversation.recipe);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center shadow-lg">
              <Utensils className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-2">CookPal</h1>
          <p className="text-lg text-amber-700">Your Intelligent Fridge-to-Recipe AI Assistant</p>
        </div>

        {/* Main Input Card */}
        <Card className="mb-8 shadow-xl border-amber-200 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              What ingredients do you have?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter ingredients (e.g., chicken, tomatoes, onions)..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="flex-1 border-amber-300 focus:border-amber-500"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateRecipe()}
              />
              <VoiceInput 
                onTranscript={handleVoiceInput}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>

            <Tabs value={recipeSource} onValueChange={(value) => setRecipeSource(value as 'ai' | 'real')}>
              <TabsList className="grid w-full grid-cols-2 bg-amber-100">
                <TabsTrigger value="ai" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                  AI Recipes
                </TabsTrigger>
                <TabsTrigger value="real" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                  Real Recipes
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateRecipe}
                disabled={isLoading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Recipe'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <History className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Display */}
        {currentRecipe && (
          <RecipeDisplay 
            recipe={currentRecipe} 
            onRegenerate={handleGenerateRecipe}
            isLoading={isLoading}
          />
        )}

        {/* Conversation History */}
        {showHistory && (
          <ConversationHistory 
            conversations={conversations}
            onLoadConversation={loadFromHistory}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-amber-600">
          <p>
            ➤ by{' '}
            <a 
              href="https://raufjatoi.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold hover:text-amber-800 transition-colors underline"
            >
              Abdul Rauf Jatoi
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CookPal;
