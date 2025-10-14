import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import {
  ExpandMore,
  LocalGroceryStore,
  Restaurant,
  Whatshot
} from '@mui/icons-material';

function MealPlan({ mealPlan }) {
  if (!mealPlan) return null;

  const { weekly_plan, shopping_list, total_calories, average_daily_calories, diet_preference } = mealPlan;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  const getMealColor = (mealType) => {
    switch (mealType) {
      case 'Breakfast': return '#FFD700';
      case 'Lunch': return '#87CEEB';
      case 'Dinner': return '#FF6347';
      default: return '#CCCCCC';
    }
  };

  return (
    <Box>
      {/* Summary Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h5" gutterBottom>
          🍽️ Your Weekly Meal Plan
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Whatshot sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">{average_daily_calories}</Typography>
              <Typography variant="body2">Avg Calories/Day</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">21</Typography>
              <Typography variant="body2">Total Meals</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <LocalGroceryStore sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">{shopping_list.length}</Typography>
              <Typography variant="body2">Items to Buy</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mb: 1 }}>🌱</Typography>
              <Typography variant="h6">{diet_preference || 'Any'}</Typography>
              <Typography variant="body2">Diet Preference</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Weekly Plan */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📅 Weekly Schedule
            </Typography>
            {days.map(day => (
              <Accordion key={day} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {day}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {mealTypes.map(mealType => {
                      const meal = weekly_plan[day]?.[mealType];
                      return (
                        <Grid item xs={12} key={mealType}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              borderLeft: `4px solid ${getMealColor(mealType)}`,
                              bgcolor: meal ? 'background.paper' : 'grey.50'
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: getMealColor(mealType), fontWeight: 'bold' }}>
                                  {mealType}
                                </Typography>
                                {meal && (
                                  <Chip 
                                    label={`${meal.calories} cal`} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              
                              {meal ? (
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {meal.recipe.title}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Cooking: {meal.recipe.cooking_time} min • {meal.recipe.difficulty}
                                  </Typography>
                                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {meal.recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                                      <Chip
                                        key={idx}
                                        label={typeof ingredient === 'object' ? ingredient.name : ingredient}
                                        size="small"
                                        variant="outlined"
                                      />
                                    ))}
                                    {meal.recipe.ingredients.length > 3 && (
                                      <Chip
                                        label={`+${meal.recipe.ingredients.length - 3} more`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                  No meal planned
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* Shopping List */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalGroceryStore sx={{ mr: 1 }} />
              Shopping List ({shopping_list.length} items)
            </Typography>
            
            {shopping_list.length > 0 ? (
              <Box>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {shopping_list.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          border: '2px solid',
                          borderColor: 'primary.main',
                          borderRadius: '50%',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="caption" color="primary.main">
                          {index + 1}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{item}</Typography>
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'success.dark' }}>
                    💡 Tip: You already have the main ingredients! Only need to buy {shopping_list.length} additional items.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  🎉 Great! You have all ingredients needed for this meal plan.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MealPlan;