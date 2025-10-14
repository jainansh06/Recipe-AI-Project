import React, { useState, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Button
} from '@mui/material';
import {
  Restaurant,
  Psychology,
  CalendarMonth
} from '@mui/icons-material';
import axios from 'axios';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';

const API_BASE = 'http://localhost:5000/api';

function App() {
  // Use useRef to store state that won't trigger re-renders
  const appStateRef = useRef({
    loading: false,
    recipes: [],
    generatedRecipe: null,
    mealPlan: null,
    error: '',
    activeTab: 0
  });

  // Local state just to trigger re-renders
  const [renderTrigger, setRenderTrigger] = useState(0);

  const updateAppState = useCallback((updates) => {
    // Update the ref
    Object.assign(appStateRef.current, updates);
    // Force a re-render
    setRenderTrigger(prev => prev + 1);
  }, []);

  const handleSearch = async (ingredients, dietFilter) => {
    updateAppState({ 
      loading: true, 
      error: '',
      recipes: []
    });

    try {
      const response = await axios.post(`${API_BASE}/recipes`, {
        ingredients,
        diet_filter: dietFilter
      });
      
      let recipesData = [];
      
      // Handle response data properly
      if (response.data && typeof response.data === 'object') {
        recipesData = response.data.recipes || [];
      }
      
      updateAppState({
        recipes: recipesData,
        generatedRecipe: null,
        mealPlan: null,
        activeTab: 0,
        loading: false
      });

    } catch (err) {
      console.error("Search error:", err);
      updateAppState({
        error: 'Failed to fetch recipes. Please try again.',
        recipes: [],
        loading: false
      });
    }
  };

  const handleGenerate = async (ingredients, dietFilter, cuisine) => {
    updateAppState({ loading: true, error: '' });
    
    try {
      const response = await axios.post(`${API_BASE}/generate-recipe`, {
        ingredients,
        diet: dietFilter,
        cuisine
      });
      
      updateAppState({
        generatedRecipe: response.data.recipe,
        recipes: [],
        mealPlan: null,
        activeTab: 1,
        loading: false
      });
    } catch (err) {
      updateAppState({
        error: 'Failed to generate recipe.',
        loading: false
      });
    }
  };

  const handleMealPlan = async (ingredients, dietPreference) => {
    updateAppState({ loading: true, error: '' });
    
    try {
      const response = await axios.post(`${API_BASE}/meal-plan`, {
        ingredients,
        diet_preference: dietPreference
      });
      
      updateAppState({
        mealPlan: response.data,
        recipes: [],
        generatedRecipe: null,
        activeTab: 2,
        loading: false
      });
    } catch (err) {
      updateAppState({
        error: 'Failed to generate meal plan.',
        loading: false
      });
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      await axios.post(`${API_BASE}/save-recipe`, { recipe });
      alert('Recipe saved successfully!');
    } catch (err) {
      updateAppState({ error: 'Failed to save recipe.' });
    }
  };

  // Get current state from ref
  const { loading, recipes, generatedRecipe, mealPlan, error, activeTab } = appStateRef.current;

  const renderTabContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Searching for recipes...</Typography>
        </Box>
      );
    }

    switch (activeTab) {
      case 0: // Search Results
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Found Recipes ({recipes.length})
            </Typography>
            
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id || `recipe-${index}-${renderTrigger}`}
                  recipe={recipe}
                  onSaveRecipe={handleSaveRecipe}
                />
              ))
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No recipes found. Try adding ingredients like "paneer", "chicken", or "rice"!
                </Typography>
              </Paper>
            )}
          </Box>
        );
      
      case 1: // Generated Recipe
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              AI Generated Recipe
            </Typography>
            {generatedRecipe ? (
              <RecipeCard
                recipe={generatedRecipe}
                onSaveRecipe={handleSaveRecipe}
              />
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No AI recipe generated yet. Use the "Generate New Recipe" button!
                </Typography>
              </Paper>
            )}
          </Box>
        );
      
      case 2: // Meal Plan
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Weekly Meal Plan
      </Typography>
      {mealPlan ? (
        <Box>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Shopping List ({mealPlan.shopping_list?.length || 0} items)
            </Typography>
            {mealPlan.shopping_list && mealPlan.shopping_list.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {mealPlan.shopping_list.map((item, index) => (
                  <Paper 
                    key={index} 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: 'primary.main', 
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 'medium'
                    }}
                  >
                    {item}
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper sx={{ p: 2, backgroundColor: 'success.light', color: 'white' }}>
                <Typography>
                  🎉 Great! You have all the ingredients needed for this week's meals!
                </Typography>
              </Paper>
            )}
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Your Weekly Plan
          </Typography>
          {mealPlan.weekly_plan && Object.keys(mealPlan.weekly_plan).length > 0 ? (
            Object.entries(mealPlan.weekly_plan).map(([day, meals]) => (
              <Paper key={day} sx={{ p: 3, mb: 2, border: '1px solid', borderColor: 'primary.light' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {day}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(meals).map(([mealType, recipe]) => (
                    <Box key={mealType} sx={{ 
                      p: 2, 
                      backgroundColor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        {mealType}:
                      </Typography>
                      {recipe ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {recipe.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Cooking time: {recipe.cooking_time} min • Difficulty: {recipe.difficulty}
                          </Typography>
                          {recipe.similarity_score && (
                            <Typography variant="caption" color="success.main">
                              Match: {Math.round(recipe.similarity_score * 100)}% with your ingredients
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          No recipe selected
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No meal plan generated. Try adding more ingredients!
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No meal plan generated yet. Add ingredients and click "Generate Meal Plan"!
          </Typography>
        </Paper>
      )}
    </Box>
  );
      
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Restaurant sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PantryAI - Smart Recipe Assistant
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => updateAppState({ error: '' })}>
            {error}
          </Alert>
        )}

        <IngredientInput
          onSearch={handleSearch}
          onGenerate={handleGenerate}
          onMealPlan={handleMealPlan}
          loading={loading}
        />

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => updateAppState({ activeTab: newValue })}
            variant="fullWidth"
          >
            <Tab icon={<Restaurant />} label={`Recipe Search (${recipes.length})`} />
            <Tab icon={<Psychology />} label="AI Generator" />
            <Tab icon={<CalendarMonth />} label="Meal Plan" />
          </Tabs>
        </Paper>

        {renderTabContent()}
      </Container>
    </div>
  );
}

export default App;