from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
import math
from recipe_loader import load_recipes, save_recipe
from matching_engine import RecipeMatcher, CookingTimePredictor
from gpt_generator import GPTRecipeGenerator
from nutrition_analyzer import NutritionAnalyzer, MealPlanner
import os

app = Flask(__name__)
from flask_cors import CORS

# Replace your existing CORS setup with this:
if os.environ.get('FLASK_ENV') == 'production':
    # In production, allow only your Vercel domain
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "https://recipe-ai-project.vercel.app/"
            ]
        }
    })
else:
    # In development, allow localhost
    CORS(app)

# Initialize components
print("Loading recipes...")
recipes_df = load_recipes()
print(f"Loaded {len(recipes_df)} recipes")

print("Initializing recipe matcher...")
matcher = RecipeMatcher(recipes_df)

print("Initializing other services...")
cooking_predictor = CookingTimePredictor()
gpt_generator = GPTRecipeGenerator()
nutrition_analyzer = NutritionAnalyzer()
meal_planner = MealPlanner(matcher)

print("All services initialized!")

@app.route('/')
def home():
    return jsonify({
        "message": "PantryAI API is running!",
        "endpoints": {
            "/api/recipes": "POST - Find recipes by ingredients",
            "/api/generate-recipe": "POST - Generate new recipe with AI",
            "/api/analyze-nutrition": "POST - Analyze recipe nutrition",
            "/api/meal-plan": "POST - Generate weekly meal plan",
            "/api/recipes": "GET - Get all recipes",
            "/api/clusters": "GET - Get recipe clusters"
        }
    })

@app.route('/api/recipes', methods=['GET'])
def get_all_recipes():
    """Get all available recipes"""
    recipes_list = recipes_df.to_dict('records')
    return jsonify({
        "recipes": recipes_list,
        "total": len(recipes_list)
    })

@app.route('/api/recipes', methods=['POST'])
def find_recipes():
    """Find recipes based on ingredients"""
    data = request.get_json()
    ingredients = data.get('ingredients', [])
    diet_filter = data.get('diet_filter')
    top_n = data.get('top_n', 5)
    
    print(f"Received search request: {ingredients}, diet: {diet_filter}")
    
    if not ingredients:
        return jsonify({"recipes": [], "error": "No ingredients provided"}), 400
    
    try:
        recipes = matcher.find_similar_recipes(ingredients, top_n, diet_filter)
        
        # Ensure proper JSON serialization
        recipes_list = []
        for recipe in recipes:
            # Handle any serialization issues
            recipe_dict = {}
            for key, value in recipe.items():
                # Convert NaN to None for JSON serialization
                if isinstance(value, float) and math.isnan(value):
                    recipe_dict[key] = None
                else:
                    recipe_dict[key] = value
            recipes_list.append(recipe_dict)
        
        print(f"Returning {len(recipes_list)} recipes")
        
        return jsonify({
            "recipes": recipes_list,
            "ingredients_searched": ingredients,
            "count": len(recipes_list)
        })
    except Exception as e:
        print(f"Error in recipe search: {e}")
        return jsonify({
            "recipes": [],
            "error": str(e),
            "ingredients_searched": ingredients,
            "count": 0
        }), 500

@app.route('/api/generate-recipe', methods=['POST'])
def generate_recipe():
    """Generate a new recipe using AI"""
    data = request.get_json()
    ingredients = data.get('ingredients', [])
    diet = data.get('diet', '')
    cuisine = data.get('cuisine', '')
    
    if not ingredients:
        return jsonify({"error": "No ingredients provided"}), 400
    
    try:
        # Generate recipe
        generated_recipe = gpt_generator.generate_recipe(ingredients, diet, cuisine)
        
        # Predict cooking time if not provided
        if 'cooking_time' not in generated_recipe:
            ingredient_names = [ing['name'] if isinstance(ing, dict) else ing for ing in generated_recipe.get('ingredients', [])]
            generated_recipe['cooking_time'] = cooking_predictor.predict_time(
                ingredient_names, 
                generated_recipe.get('difficulty', 'medium')
            )
        
        # Analyze nutrition
        nutrition_data = nutrition_analyzer.analyze_recipe(
            generated_recipe['title'],
            generated_recipe['ingredients'] if isinstance(generated_recipe['ingredients'][0], dict) else [{'name': ing, 'amount': '1 portion'} for ing in generated_recipe['ingredients']]
        )
        generated_recipe['nutrition'] = nutrition_data
        
        return jsonify({
            "recipe": generated_recipe,
            "ingredients_used": ingredients
        })
    except Exception as e:
        print(f"Error generating recipe: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-nutrition', methods=['POST'])
def analyze_nutrition():
    """Analyze nutrition for a recipe"""
    data = request.get_json()
    recipe_title = data.get('title', 'Generated Recipe')
    ingredients = data.get('ingredients', [])
    
    try:
        nutrition_data = nutrition_analyzer.analyze_recipe(recipe_title, ingredients)
        return jsonify({
            "nutrition": nutrition_data,
            "recipe_title": recipe_title
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/meal-plan', methods=['POST'])
def create_meal_plan():
    """Generate a weekly meal plan"""
    data = request.get_json()
    ingredients = data.get('ingredients', [])
    diet_preference = data.get('diet_preference')
    
    try:
        meal_plan = meal_planner.generate_weekly_plan(ingredients, diet_preference)
        return jsonify(meal_plan)
    except Exception as e:
        return jsonify({
            'weekly_plan': {},
            'shopping_list': [],
            'error': str(e)
        }), 500

@app.route('/api/clusters', methods=['GET'])
def get_clusters():
    """Get recipe clusters for discovery"""
    try:
        clusters = matcher.get_recipe_clusters()
        return jsonify(clusters)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-recipe', methods=['POST'])
def save_user_recipe():
    """Save a generated recipe"""
    data = request.get_json()
    recipe = data.get('recipe')
    
    if not recipe:
        return jsonify({"error": "No recipe provided"}), 400
    
    try:
        # Convert to standard format
        saved_recipe = {
            "title": recipe.get('title'),
            "ingredients": [ing['name'] if isinstance(ing, dict) else ing for ing in recipe.get('ingredients', [])],
            "instructions": recipe.get('instructions', []),
            "cooking_time": recipe.get('cooking_time', 30),
            "difficulty": recipe.get('difficulty', 'medium'),
            "dietary_tags": recipe.get('dietary_tags', [])
        }
        
        saved_recipe = save_recipe(saved_recipe)
        
        return jsonify({
            "message": "Recipe saved successfully",
            "recipe": saved_recipe
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "recipes_loaded": len(recipes_df)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 