import openai
import os
import json
from dotenv import load_dotenv

load_dotenv()

class GPTRecipeGenerator:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if self.api_key:
            openai.api_key = self.api_key
            self.available = True
        else:
            self.available = False
            print("OpenAI API key not found. Using fallback recipe generation.")
    
    def generate_recipe(self, ingredients, diet_restrictions="", cuisine_type=""):
        """Generate a recipe using GPT API or fallback"""
        
        if self.available and self.api_key:
            try:
                return self._generate_with_gpt(ingredients, diet_restrictions, cuisine_type)
            except Exception as e:
                print(f"GPT API failed: {e}. Using fallback.")
        
        return self._generate_fallback_recipe(ingredients, diet_restrictions, cuisine_type)
    
    def _generate_with_gpt(self, ingredients, diet_restrictions, cuisine_type):
        """Generate recipe using GPT API"""
        prompt = self._build_prompt(ingredients, diet_restrictions, cuisine_type)
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a creative chef that generates practical, delicious recipes. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        recipe_text = response.choices[0].message.content
        return self._parse_recipe_response(recipe_text, ingredients)
    
    def _build_prompt(self, ingredients, diet_restrictions, cuisine_type):
        prompt = f"""
        Create a detailed, practical recipe using primarily these ingredients: {', '.join(ingredients)}.
        """
        
        if diet_restrictions:
            prompt += f"Dietary restrictions: {diet_restrictions}. "
        
        if cuisine_type:
            prompt += f"Cuisine style: {cuisine_type}. "
        
        prompt += """
        Please provide the response in this exact JSON format:
        {
            "title": "Creative recipe name",
            "ingredients": [
                {"name": "ingredient1", "amount": "quantity and unit"},
                {"name": "ingredient2", "amount": "quantity and unit"}
            ],
            "instructions": ["Step 1...", "Step 2..."],
            "cooking_time": 30,
            "difficulty": "easy/medium/hard",
            "servings": 2,
            "tips": "Helpful cooking tips",
            "dietary_tags": ["tag1", "tag2"]
        }
        
        Make sure the recipe is practical and uses common cooking techniques.
        Include the original ingredients in the recipe.
        """
        
        return prompt
    
    def _parse_recipe_response(self, recipe_text, original_ingredients):
     """Parse GPT response into structured recipe"""
     try:
         # Try to extract JSON from response
         start_idx = recipe_text.find('{')
         end_idx = recipe_text.rfind('}') + 1
         if start_idx != -1 and end_idx != -1:
             json_str = recipe_text[start_idx:end_idx]
             recipe_data = json.loads(json_str)
            
             # Normalize ingredients format
             normalized_ingredients = []
             for ing in recipe_data.get('ingredients', []):
                 if isinstance(ing, dict) and 'name' in ing:
                     # Format as "amount name"
                     if ing.get('amount'):
                         normalized_ingredients.append(f"{ing['amount']} {ing['name']}")
                     else:
                         normalized_ingredients.append(ing['name'])
                 elif isinstance(ing, str):
                     normalized_ingredients.append(ing)
            
             # Ensure original ingredients are included
             for orig_ing in original_ingredients:
                 if orig_ing.lower() not in [ing.lower() for ing in normalized_ingredients]:
                     normalized_ingredients.append(orig_ing)
            
             recipe_data['ingredients'] = normalized_ingredients
             recipe_data['source'] = 'gpt'
             return recipe_data
        
     except (json.JSONDecodeError, KeyError) as e:
         print(f"Failed to parse GPT response: {e}")
    
     return self._generate_fallback_recipe(original_ingredients, "", "")
    
    def _generate_fallback_recipe(self, ingredients, diet_restrictions, cuisine_type):
        """Generate a simple recipe without GPT"""
        base_title = f"{cuisine_type.capitalize() + ' ' if cuisine_type else ''}{' '.join(ingredients[:2]).title()} Special"
        
        return {
            "title": base_title,
            "ingredients": [{"name": ing, "amount": "as needed"} for ing in ingredients],
            "instructions": [
                f"Prepare all your ingredients: {', '.join(ingredients)}",
                "Heat oil in a pan over medium heat",
                f"Start by cooking {ingredients[0] if ingredients else 'main ingredient'}",
                "Add remaining ingredients and cook until done",
                "Season to taste and serve hot"
            ],
            "cooking_time": 25,
            "difficulty": "easy",
            "servings": 2,
            "tips": "Adjust spices according to your taste preference!",
            "dietary_tags": ["custom-recipe"],
            "source": "fallback"
        }