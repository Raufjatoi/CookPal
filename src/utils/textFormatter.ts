import DOMPurify from 'dompurify';

export const formatRecipeText = (text: string): string => {
  if (!text) return '';
  
  // Ultra-aggressive cleaning - remove ALL JSON artifacts and metadata
  let cleaned = text
    // Remove ALL JSON syntax completely
    .replace(/[\[\]{}\"\'\\]/g, '')
    .replace(/[,;:]/g, ' ')
    // Remove ALL metadata fields completely
    .replace(/cooking\s*time[:\s]*[\d\-\s]*minutes?/gi, '')
    .replace(/difficulty[:\s]*(easy|medium|hard|beginner|intermediate|advanced)/gi, '')
    .replace(/prep\s*time[:\s]*[\d\-\s]*minutes?/gi, '')
    .replace(/serves?[:\s]*\d+/gi, '')
    .replace(/recipe[:\s]*/gi, '')
    .replace(/title[:\s]*/gi, '')
    .replace(/name[:\s]*/gi, '')
    .replace(/dish[:\s]*/gi, '')
    .replace(/meal[:\s]*/gi, '')
    .replace(/food[:\s]*/gi, '')
    // Remove field labels completely
    .replace(/^(title|name|recipe|ingredient|instruction|step|cookingtime|difficulty|servings|dish|meal|food)[:=\s]*/gi, '')
    // Remove numbers, bullets, dashes from start
    .replace(/^[\d\-\*\•\.\s\(\)]+/, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove trailing punctuation artifacts
    .replace(/[,\s]*$/, '')
    // Fix camelCase to spaced
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  // Only capitalize first letter if there's actual content
  if (cleaned && cleaned.length > 1) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  // Add period only for instructions, not ingredients or titles
  return DOMPurify.sanitize(cleaned);
};

export const formatCookingTime = (timeText: string): string => {
  if (!timeText) return '';
  
  // Extract ONLY the number for minutes
  const numbers = timeText.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    const minutes = numbers[0];
    return `${minutes} minutes`;
  }
  
  return 'Not specified';
};

export const formatIngredientList = (ingredients: string[]): string[] => {
  return ingredients
    .map(ingredient => {
      let formatted = ingredient
        // Remove ALL metadata completely
        .replace(/cooking\s*time.*/gi, '')
        .replace(/difficulty.*/gi, '')
        .replace(/serves?.*/gi, '')
        .replace(/prep\s*time.*/gi, '')
        .replace(/recipe.*/gi, '')
        .replace(/title.*/gi, '')
        .replace(/dish.*/gi, '')
        .replace(/meal.*/gi, '')
        // Remove ALL field labels
        .replace(/^(ingredient\s*\d*[:.]?\s*)/gi, '')
        .replace(/^(recipe|dish|meal|food|title|name)[:.\s]*/gi, '')
        .replace(/^(step|then|next|after|while|when|until).*/gi, '')
        // Remove JSON artifacts
        .replace(/[\[\]{}\"\'\\,;:]/g, '')
        .replace(/serves?\s*\d+/gi, '')
        .replace(/^\d+[\.\)\s]*/g, '')
        .replace(/^[\-\*\•\s]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Only return if it's actually an ingredient (not metadata)
      return formatted;
    })
    .filter(ingredient => 
      ingredient.length > 2 && 
      !ingredient.match(/^[\s\W]*$/) &&
      !ingredient.toLowerCase().includes('cooking') &&
      !ingredient.toLowerCase().includes('difficulty') &&
      !ingredient.toLowerCase().includes('serves') &&
      !ingredient.toLowerCase().includes('recipe') &&
      !ingredient.toLowerCase().includes('title') &&
      !ingredient.toLowerCase().includes('dish') &&
      !ingredient.toLowerCase().includes('meal') &&
      !ingredient.toLowerCase().includes('prep') &&
      !ingredient.toLowerCase().includes('time') &&
      !ingredient.toLowerCase().includes('easy') &&
      !ingredient.toLowerCase().includes('medium') &&
      !ingredient.toLowerCase().includes('hard')
    )
    .map(ingredient => {
      // Clean up measurements only
      return ingredient
        .replace(/(\d+)\s*(cup|cups|tbsp|tsp|oz|lb|lbs|g|kg|ml|l)/gi, '$1 $2')
        .replace(/\b(cup|cups|tbsp|tsp|oz|lb|lbs|g|kg|ml|l)\b/gi, (match) => match.toLowerCase());
    });
};

export const formatInstructionList = (instructions: string[]): string[] => {
  return instructions
    .map((instruction, index) => {
      let formatted = instruction
        // Remove ALL metadata
        .replace(/cooking\s*time.*/gi, '')
        .replace(/difficulty.*/gi, '')
        .replace(/serves?.*/gi, '')
        .replace(/prep\s*time.*/gi, '')
        .replace(/recipe.*/gi, '')
        .replace(/title.*/gi, '')
        .replace(/dish.*/gi, '')
        .replace(/meal.*/gi, '')
        // Remove step numbering
        .replace(/^step\s*\d+:?\s*/i, '')
        .replace(/^\d+[\.\)\s]*/g, '')
        // Remove JSON artifacts
        .replace(/[\[\]{}\"\'\\,;:]/g, ' ')
        .replace(/^[\-\*\•\s]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Ensure proper sentence ending
      if (formatted && !formatted.match(/[.!?]$/)) {
        formatted += '.';
      }
      
      return formatted;
    })
    .filter(instruction => 
      instruction.length > 5 && 
      !instruction.match(/^[\s\W]*$/) &&
      !instruction.toLowerCase().includes('cooking time') &&
      !instruction.toLowerCase().includes('difficulty') &&
      !instruction.toLowerCase().includes('serves') &&
      !instruction.toLowerCase().includes('prep time') &&
      !instruction.toLowerCase().includes('recipe') &&
      !instruction.toLowerCase().includes('title')
    );
};

export const formatTitle = (title: string): string => {
  if (!title) return 'Delicious Recipe';
  
  let formatted = title
    // Remove ALL metadata
    .replace(/cooking\s*time.*/gi, '')
    .replace(/difficulty.*/gi, '')
    .replace(/serves?.*/gi, '')
    .replace(/prep\s*time.*/gi, '')
    // Remove field labels
    .replace(/^(recipe|title|name|dish|meal|food)[:.\s]*/gi, '')
    // Remove JSON artifacts
    .replace(/[\[\]{}\"\'\\,;:]/g, '')
    .replace(/^\d+[\.\)\s]*/g, '')
    .replace(/^[\-\*\•\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Title case for actual dish name only
  if (formatted) {
    formatted = formatted.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    
    // Keep conjunctions lowercase
    formatted = formatted.replace(/\b(with|and|or|of|in|on|at|to|for|a|an|the)\b/gi, (match) => 
      match.toLowerCase()
    );
    
    // Always capitalize first word
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  
  return formatted || 'Delicious Recipe';
};
