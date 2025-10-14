import pandas as pd
import json
import os

def load_recipes():
    """Load recipes from JSON file"""
    try:
        with open('data/sample_recipes.json', 'r', encoding='utf-8') as f:
            recipes = json.load(f)
        print(f"Successfully loaded {len(recipes)} recipes from JSON file")
        return pd.DataFrame(recipes)
    except FileNotFoundError:
        print("Recipe file not found, creating sample data...")
        # Return comprehensive sample data if file doesn't exist
        sample_recipes = [
            {
                "id": 1,
                "title": "Quick Vegetable Stir Fry",
                "ingredients": ["mixed vegetables", "soy sauce", "garlic", "oil", "rice"],
                "instructions": ["Heat oil in pan", "Add garlic and stir-fry", "Add vegetables and cook", "Add soy sauce", "Serve with rice"],
                "cooking_time": 20,
                "difficulty": "easy",
                "dietary_tags": ["vegetarian", "vegan"],
                "cuisine": "asian"
            },
            {
                "id": 2,
                "title": "Classic Chicken Curry",
                "ingredients": ["chicken", "onion", "tomatoes", "spices", "oil", "rice"],
                "instructions": ["Heat oil and sauté onions", "Add chicken and brown", "Add tomatoes and spices", "Simmer until cooked", "Serve with rice"],
                "cooking_time": 40,
                "difficulty": "medium",
                "dietary_tags": ["non-vegetarian"],
                "cuisine": "indian"
            }
        ]
        return pd.DataFrame(sample_recipes)
    except Exception as e:
        print(f"Error loading recipes: {e}")
        return pd.DataFrame()

def save_recipe(new_recipe):
    """Save a new recipe to the JSON file"""
    try:
        with open('data/sample_recipes.json', 'r', encoding='utf-8') as f:
            recipes = json.load(f)
    except FileNotFoundError:
        recipes = []
    except Exception as e:
        print(f"Error reading recipe file: {e}")
        recipes = []
    
    # Assign new ID
    new_id = max([r['id'] for r in recipes]) + 1 if recipes else 1
    new_recipe['id'] = new_id
    recipes.append(new_recipe)
    
    try:
        with open('data/sample_recipes.json', 'w', encoding='utf-8') as f:
            json.dump(recipes, f, indent=2, ensure_ascii=False)
        print(f"Recipe saved with ID: {new_id}")
        return new_recipe
    except Exception as e:
        print(f"Error saving recipe: {e}")
        return None