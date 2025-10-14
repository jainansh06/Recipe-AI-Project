import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Clear } from '@mui/icons-material';

function IngredientInput({ onSearch, onGenerate, onMealPlan, loading }) {
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [dietFilter, setDietFilter] = useState('');
  const [cuisine, setCuisine] = useState('');

  const addIngredient = () => {
    if (ingredient.trim() && !ingredients.includes(ingredient.trim())) {
      setIngredients([...ingredients, ingredient.trim()]);
      setIngredient('');
    }
  };

  const removeIngredient = (ingToRemove) => {
    setIngredients(ingredients.filter(ing => ing !== ingToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const handleSearch = () => {
    if (ingredients.length > 0 && onSearch) {
      onSearch(ingredients, dietFilter);
    }
  };

  const handleGenerate = () => {
    if (ingredients.length > 0 && onGenerate) {
      onGenerate(ingredients, dietFilter, cuisine);
    }
  };

  const handleMealPlan = () => {
    if (ingredients.length > 0 && onMealPlan) {
      onMealPlan(ingredients, dietFilter);
    }
  };

  const clearAll = () => {
    setIngredients([]);
    setDietFilter('');
    setCuisine('');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        What's in your pantry?
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Add an ingredient"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
          placeholder="e.g., chicken, rice, tomatoes..."
        />
        <Button
          startIcon={<Add />}
          onClick={addIngredient}
          variant="outlined"
          size="small"
          disabled={!ingredient.trim()}
        >
          Add
        </Button>
      </Box>

      {ingredients.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Your ingredients:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ingredients.map((ing, index) => (
              <Chip
                key={index}
                label={ing}
                onDelete={() => removeIngredient(ing)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Diet</InputLabel>
          <Select
            value={dietFilter}
            label="Diet"
            onChange={(e) => setDietFilter(e.target.value)}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="vegetarian">Vegetarian</MenuItem>
            <MenuItem value="vegan">Vegan</MenuItem>
            <MenuItem value="gluten-free">Gluten-Free</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Cuisine</InputLabel>
          <Select
            value={cuisine}
            label="Cuisine"
            onChange={(e) => setCuisine(e.target.value)}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="indian">Indian</MenuItem>
            <MenuItem value="italian">Italian</MenuItem>
            <MenuItem value="mexican">Mexican</MenuItem>
            <MenuItem value="chinese">Chinese</MenuItem>
            <MenuItem value="thai">Thai</MenuItem>
            <MenuItem value="mediterranean">Mediterranean</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={ingredients.length === 0 || loading}
        >
          Find Recipes
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleGenerate}
          disabled={ingredients.length === 0 || loading}
        >
          Generate New Recipe
        </Button>

        <Button
          variant="outlined"
          onClick={handleMealPlan}
          disabled={ingredients.length === 0 || loading}
        >
          Generate Meal Plan
        </Button>
        
        <Button
          startIcon={<Clear />}
          onClick={clearAll}
          color="secondary"
          disabled={ingredients.length === 0 && !dietFilter && !cuisine}
        >
          Clear All
        </Button>
      </Box>

      {ingredients.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Add some ingredients to get started! Try common items like chicken, rice, tomatoes, onions, etc.
        </Typography>
      )}
    </Paper>
  );
}

export default IngredientInput;