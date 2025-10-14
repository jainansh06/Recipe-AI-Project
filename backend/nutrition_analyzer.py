import requests
import os
from dotenv import load_dotenv

load_dotenv()

class NutritionAnalyzer:
    def __init__(self):
        self.edamam_app_id = os.getenv('EDAMAM_APP_ID')
        self.edamam_app_key = os.getenv('EDAMAM_APP_KEY')
        self.available = bool(self.edamam_app_id and self.edamam_app_key)
    
    def analyze_recipe(self, recipe_title, ingredients):
        """Analyze nutrition using Edamam API or fallback estimation"""
        
        if self.available:
            nutrition_data = self._call_edamam_api(ingredients)
            if nutrition_data:
                return nutrition_data
        
        # Fallback to estimated nutrition
        return self._estimate_nutrition(ingredients)
    
    def _call_edamam_api(self, ingredients):
        """Call Edamam Nutrition Analysis API"""
        try:
            # Format ingredients for API
            ingredient_lines = []
            for ing in ingredients:
                if isinstance(ing, dict):
                    ingredient_lines.append(f"{ing.get('amount', '1 portion')} {ing.get('name', 'ingredient')}")
                else:
                    ingredient_lines.append(f"1 portion {ing}")
            
            url = "https://api.edamam.com/api/nutrition-details"
            params = {
                'app_id': self.edamam_app_id,
                'app_key': self.edamam_app_key
            }
            
            payload = {
                'title': "Generated Recipe",
                'ingr': ingredient_lines
            }
            
            response = requests.post(url, params=params, json=payload, timeout=10)
            
            if response.status_code == 200:
                return self._parse_edamam_response(response.json())
            else:
                print(f"Edamam API error: {response.status_code}")
                
        except Exception as e:
            print(f"Edamam API call failed: {e}")
        
        return None
    
    def _parse_edamam_response(self, data):
        """Parse Edamam API response"""
        try:
            total_nutrition = data.get('totalNutrients', {})
            
            return {
                "calories": data.get('calories', 0),
                "protein": total_nutrition.get('PROCNT', {}).get('quantity', 0),
                "carbs": total_nutrition.get('CHOCDF', {}).get('quantity', 0),
                "fat": total_nutrition.get('FAT', {}).get('quantity', 0),
                "fiber": total_nutrition.get('FIBTG', {}).get('quantity', 0),
                "sugar": total_nutrition.get('SUGAR', {}).get('quantity', 0),
                "sodium": total_nutrition.get('NA', {}).get('quantity', 0),
                "source": "edamam"
            }
        except Exception as e:
            print(f"Error parsing Edamam response: {e}")
            return None
    
    def _estimate_nutrition(self, ingredients):
        """Estimate nutrition based on common ingredients"""
        nutrition_map = {
            # Proteins
            'chicken': {'calories': 165, 'protein': 31, 'carbs': 0, 'fat': 3.6},
            'beef': {'calories': 250, 'protein': 26, 'carbs': 0, 'fat': 15},
            'fish': {'calories': 206, 'protein': 22, 'carbs': 0, 'fat': 12},
            'eggs': {'calories': 72, 'protein': 6, 'carbs': 0.4, 'fat': 5},
            'paneer': {'calories': 265, 'protein': 18, 'carbs': 2, 'fat': 20},
            'tofu': {'calories': 76, 'protein': 8, 'carbs': 2, 'fat': 4},
            
            # Grains
            'rice': {'calories': 130, 'protein': 2.7, 'carbs': 28, 'fat': 0.3},
            'pasta': {'calories': 131, 'protein': 5, 'carbs': 25, 'fat': 1},
            'bread': {'calories': 265, 'protein': 9, 'carbs': 49, 'fat': 3},
            
            # Vegetables
            'tomatoes': {'calories': 18, 'protein': 0.9, 'carbs': 3.9, 'fat': 0.2},
            'onion': {'calories': 40, 'protein': 1.1, 'carbs': 9, 'fat': 0.1},
            'potatoes': {'calories': 77, 'protein': 2, 'carbs': 17, 'fat': 0.1},
            'carrots': {'calories': 41, 'protein': 0.9, 'carbs': 10, 'fat': 0.2},
            'spinach': {'calories': 23, 'protein': 2.9, 'carbs': 3.6, 'fat': 0.4},
            'broccoli': {'calories': 34, 'protein': 2.8, 'carbs': 7, 'fat': 0.4},
            
            # Dairy
            'milk': {'calories': 42, 'protein': 3.4, 'carbs': 5, 'fat': 1},
            'cheese': {'calories': 113, 'protein': 7, 'carbs': 0.9, 'fat': 9},
            'butter': {'calories': 717, 'protein': 0.9, 'carbs': 0.1, 'fat': 81},
            'cream': {'calories': 345, 'protein': 2.1, 'carbs': 2.9, 'fat': 37},
            
            # Legumes
            'lentils': {'calories': 116, 'protein': 9, 'carbs': 20, 'fat': 0.4},
            'beans': {'calories': 132, 'protein': 9, 'carbs': 24, 'fat': 0.5},
            'chickpeas': {'calories': 139, 'protein': 7, 'carbs': 23, 'fat': 2},
        }
        
        total = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
        ingredient_count = 0
        
        for ingredient in ingredients:
            ing_name = str(ingredient['name'] if isinstance(ingredient, dict) else ingredient).lower()
            for key, nutrition in nutrition_map.items():
                if key in ing_name:
                    total['calories'] += nutrition['calories']
                    total['protein'] += nutrition['protein']
                    total['carbs'] += nutrition['carbs']
                    total['fat'] += nutrition['fat']
                    ingredient_count += 1
                    break
        
        # Add base calories for oil/seasonings if few ingredients matched
        if ingredient_count < 2:
            total['calories'] += 200
            total['protein'] += 8
            total['carbs'] += 15
            total['fat'] += 10
        
        total['source'] = "estimated"
        return total

class MealPlanner:
    def __init__(self, recipe_matcher):
        self.recipe_matcher = recipe_matcher
    
    def generate_weekly_plan(self, available_ingredients, diet_preference=None):
        """Generate a weekly meal plan"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        meal_types = ['Breakfast', 'Lunch', 'Dinner']
        
        plan = {}
        shopping_list = set()
        
        # Get available ingredients in lowercase for comparison
        available_ingredients_lower = [ing.lower() for ing in available_ingredients]
        
        for day in days:
            plan[day] = {}
            for meal_type in meal_types:
                # Get recipe suggestions based on available ingredients
                recipes = self.recipe_matcher.find_similar_recipes(
                    available_ingredients, 
                    top_n=3, 
                    diet_filter=diet_preference
                )
                
                if recipes:
                    selected_recipe = recipes[0]  # Pick the best match
                    plan[day][meal_type] = selected_recipe
                    
                    # Add missing ingredients to shopping list
                    recipe_ingredients = selected_recipe.get('ingredients', [])
                    
                    for ingredient in recipe_ingredients:
                        # Handle both string and object formats
                        if isinstance(ingredient, dict):
                            ing_name = ingredient.get('name', '')
                        else:
                            ing_name = str(ingredient)
                        
                        # Clean the ingredient name
                        ing_name_clean = self._clean_ingredient_name(ing_name)
                        
                        # Check if this ingredient is not in available ingredients
                        if (ing_name_clean and 
                            ing_name_clean not in available_ingredients_lower and
                            not self._is_basic_ingredient(ing_name_clean)):
                            shopping_list.add(ing_name)
        
        return {
            'weekly_plan': plan,
            'shopping_list': sorted(list(shopping_list))
        }
    
    def _clean_ingredient_name(self, ingredient_name):
        """Clean ingredient name for comparison"""
        if not ingredient_name:
            return ""
        
        # Convert to lowercase and remove extra spaces
        cleaned = ' '.join(str(ingredient_name).lower().split())
        
        # Remove common measurement words and quantities
        measurement_words = [
            'cup', 'cups', 'tsp', 'tbsp', 'teaspoon', 'tablespoon', 
            'gram', 'grams', 'kg', 'pound', 'pounds', 'lb', 'lbs',
            'ounce', 'ounces', 'oz', 'ml', 'liter', 'litre',
            'pinch', 'dash', 'to taste', 'as needed', 'some', 'few'
        ]
        
        # Remove numbers and measurement words
        words = cleaned.split()
        filtered_words = []
        
        for word in words:
            # Skip numbers and measurement words
            if (not word.replace('.', '').isdigit() and 
                word not in measurement_words):
                filtered_words.append(word)
        
        return ' '.join(filtered_words).strip()
    
    def _is_basic_ingredient(self, ingredient):
        """Check if ingredient is a basic pantry item that users likely have"""
        basic_ingredients = {
            'salt', 'pepper', 'water', 'oil', 'vegetable oil', 'olive oil',
            'sugar', 'flour', 'rice', 'butter', 'garlic', 'onion', 'ginger',
            'spices', 'turmeric', 'cumin', 'coriander', 'chili powder',
            'soy sauce', 'vinegar', 'baking powder', 'baking soda'
        }
        
        return ingredient in basic_ingredients