from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import numpy as np
import re

class RecipeMatcher:
    def __init__(self, recipes_df):
        self.recipes_df = recipes_df
        self.vectorizer = TfidfVectorizer(stop_words='english', lowercase=True, min_df=1)
        self._fit_vectors()
        self._fit_clusters()
    
    def _fit_vectors(self):
        """Create TF-IDF vectors for ingredient matching"""
        try:
            # Combine ingredients into strings for TF-IDF
            ingredient_texts = []
            for ingredients in self.recipes_df['ingredients']:
                if isinstance(ingredients, list):
                    ingredient_texts.append(' '.join(map(str, ingredients)).lower())
                else:
                    ingredient_texts.append(str(ingredients).lower())
            
            self.ingredient_vectors = self.vectorizer.fit_transform(ingredient_texts)
            print(f"TF-IDF vectors created for {len(ingredient_texts)} recipes")
        except Exception as e:
            print(f"Error in TF-IDF fitting: {e}")
            self.ingredient_vectors = None
    
    def _fit_clusters(self):
        """Cluster recipes for better organization"""
        try:
            if len(self.recipes_df) >= 3 and self.ingredient_vectors is not None:
                n_clusters = min(5, len(self.recipes_df))
                self.cluster_model = KMeans(n_clusters=n_clusters, random_state=42)
                self.recipe_clusters = self.cluster_model.fit_predict(self.ingredient_vectors)
                print(f"Recipes clustered into {n_clusters} groups")
            else:
                self.cluster_model = None
                self.recipe_clusters = None
        except Exception as e:
            print(f"Error in clustering: {e}")
            self.cluster_model = None
            self.recipe_clusters = None
    
    def preprocess_ingredients(self, user_ingredients):
        """Clean and preprocess user ingredients"""
        processed = []
        for ingredient in user_ingredients:
            # Remove extra spaces and convert to lowercase
            clean_ing = re.sub(r'\s+', ' ', str(ingredient).strip().lower())
            processed.append(clean_ing)
        return processed
    
    def find_similar_recipes(self, user_ingredients, top_n=5, diet_filter=None):
        """Find recipes similar to user's ingredients"""
        try:
            if self.ingredient_vectors is None or len(self.recipes_df) == 0:
                print("No recipes available for matching")
                return self._get_fallback_recipes()
            
            # Preprocess user ingredients
            user_ingredients = self.preprocess_ingredients(user_ingredients)
            user_text = ' '.join(user_ingredients)
            
            # Transform user input
            user_vector = self.vectorizer.transform([user_text])
            
            # Calculate similarities
            similarities = cosine_similarity(user_vector, self.ingredient_vectors)
            similar_indices = similarities.argsort()[0][-top_n:][::-1]
            
            # Get similar recipes
            results = []
            for idx in similar_indices:
                if idx < len(self.recipes_df):
                    recipe = self.recipes_df.iloc[idx].to_dict()
                    recipe['similarity_score'] = float(similarities[0][idx])
                    results.append(recipe)
            
            # Apply diet filter if specified
            if diet_filter:
                results = self._filter_by_diet(results, diet_filter)
            
            print(f"Found {len(results)} matching recipes")
            return results
            
        except Exception as e:
            print(f"Error in recipe matching: {e}")
            return self._get_fallback_recipes()
    
    def _filter_by_diet(self, recipes, diet):
        """Filter recipes by dietary restrictions"""
        diet_filters = {
            "vegetarian": ["chicken", "beef", "pork", "fish", "mutton", "lamb", "meat", "seafood"],
            "vegan": ["chicken", "beef", "pork", "fish", "mutton", "lamb", "meat", "seafood", "eggs", "milk", "cheese", "butter", "cream", "yogurt", "ghee"],
            "gluten-free": ["wheat", "bread", "pasta", "flour", "maida", "semolina"]
        }
        
        if diet.lower() in diet_filters:
            filtered_recipes = []
            forbidden_ingredients = diet_filters[diet.lower()]
            
            for recipe in recipes:
                recipe_ingredients = ' '.join(map(str, recipe.get('ingredients', []))).lower()
                has_forbidden = any(ingredient in recipe_ingredients for ingredient in forbidden_ingredients)
                
                if not has_forbidden:
                    filtered_recipes.append(recipe)
            
            return filtered_recipes
        
        return recipes
    
    def get_recipe_clusters(self):
        """Get recipes grouped by clusters"""
        if self.cluster_model is None:
            return {"error": "Not enough recipes for clustering"}
        
        try:
            clusters = {}
            for i, cluster_id in enumerate(self.recipe_clusters):
                if i < len(self.recipes_df):
                    if cluster_id not in clusters:
                        clusters[cluster_id] = []
                    clusters[cluster_id].append(self.recipes_df.iloc[i].to_dict())
            
            return clusters
        except Exception as e:
            return {"error": f"Clustering error: {str(e)}"}
    
    def _get_fallback_recipes(self):
        """Return some sample recipes if matching fails"""
        print("Using fallback recipes")
        if len(self.recipes_df) > 0:
            # Return first few recipes as fallback
            return self.recipes_df.head(3).to_dict('records')
        else:
            # Ultimate fallback
            return [
                {
                    "id": 999,
                    "title": "Mixed Vegetable Delight",
                    "ingredients": ["mixed vegetables", "oil", "salt", "basic spices"],
                    "instructions": ["Heat oil in pan", "Add vegetables and stir fry", "Season with salt and spices", "Serve hot"],
                    "cooking_time": 20,
                    "difficulty": "easy",
                    "dietary_tags": ["vegetarian", "vegan"]
                }
            ]

class CookingTimePredictor:
    def __init__(self):
        # Comprehensive ingredient time mapping
        self.ingredient_times = {
            # Meats
            'chicken': 20, 'beef': 25, 'pork': 22, 'fish': 15, 'mutton': 40, 'lamb': 35,
            'prawn': 8, 'shrimp': 8, 'crab': 15, 'eggs': 8,
            
            # Grains & Carbs
            'rice': 20, 'pasta': 12, 'noodles': 10, 'potatoes': 25, 'sweet potato': 30,
            'bread': 5, 'quinoa': 15, 'oats': 10,
            
            # Vegetables
            'carrots': 10, 'broccoli': 8, 'cauliflower': 10, 'spinach': 3, 'cabbage': 12,
            'onion': 8, 'garlic': 5, 'ginger': 5, 'tomatoes': 8, 'bell peppers': 8,
            'mushrooms': 10, 'zucchini': 8, 'eggplant': 15, 'okra': 12, 'beans': 15,
            'peas': 8, 'corn': 10, 'lettuce': 2,
            
            # Legumes
            'lentils': 30, 'beans': 25, 'chickpeas': 35, 'tofu': 10, 'paneer': 8,
            
            # Dairy
            'cheese': 5, 'milk': 2, 'cream': 3, 'yogurt': 2, 'butter': 2
        }
    
    def predict_time(self, ingredients, difficulty='medium'):
        """Predict cooking time based on ingredients and difficulty"""
        base_time = 10  # Base prep time
        
        for ingredient in ingredients:
            ingredient_lower = str(ingredient).lower()
            for key, time in self.ingredient_times.items():
                if key in ingredient_lower:
                    base_time += time
                    break
        
        # Adjust for difficulty
        time_multipliers = {
            'easy': 0.8,
            'medium': 1.0,
            'hard': 1.3
        }
        
        adjusted_time = base_time * time_multipliers.get(difficulty, 1.0)
        
        # Cap between 15-120 minutes
        return min(120, max(15, int(adjusted_time)))