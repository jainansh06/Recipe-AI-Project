import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  AccessTime,
  Restaurant,
  Whatshot
} from '@mui/icons-material';
import NutritionChart from './NutritionChart';

function RecipeCard({ recipe, onSaveRecipe }) {
  const [expanded, setExpanded] = useState(false);

  const handleSave = () => {
    if (onSaveRecipe) {
      onSaveRecipe(recipe);
    }
  };

  // Safe data handling for ingredients - handle both strings and objects
  const getIngredients = () => {
    if (!recipe || !recipe.ingredients) return [];
    
    if (Array.isArray(recipe.ingredients)) {
      // Convert objects to strings if needed
      return recipe.ingredients.map(ing => {
        if (typeof ing === 'string') {
          return ing;
        } else if (typeof ing === 'object' && ing !== null) {
          // Handle both {name, amount} and other object formats
          if (ing.name && ing.amount) {
            return `${ing.amount} ${ing.name}`;
          } else if (ing.name) {
            return ing.name;
          } else {
            return JSON.stringify(ing); // Fallback
          }
        }
        return String(ing); // Convert anything else to string
      });
    }
    return [];
  };

  const getInstructions = () => {
    if (!recipe || !recipe.instructions) return ['No instructions available.'];
    if (Array.isArray(recipe.instructions)) {
      return recipe.instructions;
    }
    if (typeof recipe.instructions === 'string') {
      return recipe.instructions.split('\n').filter(step => step.trim());
    }
    return ['No instructions available.'];
  };

  const ingredients = getIngredients();
  const instructions = getInstructions();

  if (!recipe) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography color="textSecondary">
            Recipe data not available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
            {recipe.title || 'Untitled Recipe'}
          </Typography>
          
          {recipe.source === 'fallback' || recipe.source === 'gpt' ? (
            <Chip 
              label={recipe.source === 'gpt' ? "AI Generated" : "Custom Recipe"} 
              color="secondary" 
              size="small" 
            />
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 0.5, fontSize: 18 }} />
            <Typography variant="body2">
              {recipe.cooking_time || 30} min
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Restaurant sx={{ mr: 0.5, fontSize: 18 }} />
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {recipe.difficulty || 'medium'}
            </Typography>
          </Box>
          
          {recipe.servings && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Whatshot sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">
                Serves {recipe.servings}
              </Typography>
            </Box>
          )}
        </Box>

        {recipe.similarity_score !== undefined && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Match: {Math.round(recipe.similarity_score * 100)}%
          </Typography>
        )}

        {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {recipe.dietary_tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Ingredients & Instructions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ingredients:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ingredients.map((ingredient, index) => (
                  <Chip
                    key={index}
                    label={ingredient}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Instructions:
              </Typography>
              <Box component="ol" sx={{ pl: 2 }}>
                {instructions.map((step, index) => (
                  <Typography key={index} component="li" variant="body2" sx={{ mb: 1 }}>
                    {step}
                  </Typography>
                ))}
              </Box>
            </Box>

            {recipe.tips && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Tips:
                  </Typography>
                  <Typography variant="body2">
                    {recipe.tips}
                  </Typography>
                </Box>
              </>
            )}
          </AccordionDetails>
        </Accordion>

        {recipe.nutrition && (
          <Box sx={{ mt: 2 }}>
            <NutritionChart nutrition={recipe.nutrition} />
          </Box>
        )}

        {onSaveRecipe && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" size="small" onClick={handleSave}>
              Save Recipe
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default RecipeCard;