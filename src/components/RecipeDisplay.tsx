
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Speaker, RefreshCw, Clock, ChefHat, Users, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatRecipeText, formatIngredientList, formatInstructionList, formatTitle, formatCookingTime } from '@/utils/textFormatter';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string;
  difficulty?: string;
  servings?: string;
}

interface RecipeDisplayProps {
  recipe: Recipe;
  onRegenerate: () => void;
  isLoading: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onRegenerate, isLoading }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speakRecipe = async () => {
    setIsSpeaking(true);
    
    try {
      const formattedIngredients = formatIngredientList(recipe.ingredients);
      const formattedInstructions = formatInstructionList(recipe.instructions);
      const cleanTitle = formatTitle(recipe.title);
      
      // Prepare clean text for speech
      const recipeText = `
        Recipe: ${cleanTitle}.
        Cooking time: ${recipe.cookingTime || 'Not specified'}.
        Difficulty: ${recipe.difficulty || 'Not specified'}.
        
        Ingredients needed: ${formattedIngredients.join(', ')}.
        
        Cooking instructions: ${formattedInstructions.join(' ')}
      `;

      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/nPczCjzI2devNBz1zQrb', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLAB_API,
        },
        body: JSON.stringify({
          text: recipeText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
            speed: 0.9
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        throw new Error('Audio playback failed');
      };

      await audio.play();
      
      toast({
        title: "Playing recipe",
        description: "Listen to your recipe instructions",
      });
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech not available",
        description: "Unable to play audio at the moment",
        variant: "destructive"
      });
    }
  };

  const formattedIngredients = formatIngredientList(recipe.ingredients);
  const formattedInstructions = formatInstructionList(recipe.instructions);
  const cleanTitle = formatTitle(recipe.title);

  return (
    <Card className="mb-8 shadow-2xl border-amber-200 animate-slide-up bg-gradient-to-br from-white to-amber-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-3xl font-bold text-amber-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            {cleanTitle}
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {recipe.cookingTime && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-3 py-1">
                <Clock className="w-4 h-4 mr-2" />
                {formatCookingTime(recipe.cookingTime)}
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge variant="outline" className="border-amber-400 text-amber-800 px-3 py-1">
                <Timer className="w-4 h-4 mr-2" />
                {formatRecipeText(recipe.difficulty)}
              </Badge>
            )}
            {recipe.servings && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
                <Users className="w-4 h-4 mr-2" />
                {formatRecipeText(recipe.servings)}
              </Badge>
            )}
          </div>
        </div>
        <Separator className="mt-4 bg-amber-200" />
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Ingredients Section */}
        <div className="bg-white rounded-lg p-6 border border-amber-100 shadow-sm">
          <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">📋</span>
            </div>
            Ingredients
          </h3>
          <div className="grid gap-3">
            {formattedIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-center group hover:bg-amber-50 p-2 rounded-md transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-white text-sm font-semibold">✓</span>
                </div>
                <span className="text-amber-800 font-medium leading-relaxed">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="bg-white rounded-lg p-6 border border-amber-100 shadow-sm">
          <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">👩‍🍳</span>
            </div>
            Cooking Instructions
          </h3>
          <div className="space-y-4">
            {formattedInstructions.map((instruction, index) => (
              <div key={index} className="flex group hover:bg-amber-50 p-3 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-amber-800 leading-relaxed font-medium">{instruction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 flex-wrap">
          <Button
            onClick={speakRecipe}
            disabled={isSpeaking}
            variant="outline"
            size="lg"
            className="border-2 border-amber-300 text-amber-700 hover:bg-amber-50 flex-1 min-w-48"
          >
            <Speaker className={`w-5 h-5 mr-2 ${isSpeaking ? 'animate-pulse' : ''}`} />
            {isSpeaking ? 'Speaking Recipe...' : 'Listen to Recipe'}
          </Button>
          <Button
            onClick={onRegenerate}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white flex-1 min-w-48 shadow-lg"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Generate New Recipe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeDisplay;
