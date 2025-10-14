import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function NutritionChart({ nutrition }) {
  if (!nutrition) return null;

  const { protein, carbs, fat, calories } = nutrition;

  const macroData = [
    { name: 'Protein', value: protein || 0 },
    { name: 'Carbs', value: carbs || 0 },
    { name: 'Fat', value: fat || 0 }
  ].filter(item => item.value > 0);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Nutrition Facts
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" gutterBottom>
            Calories: <strong>{calories || 'N/A'}</strong>
          </Typography>
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              Protein: <strong>{protein ? `${protein}g` : 'N/A'}</strong>
            </Typography>
            <Typography variant="body2">
              Carbohydrates: <strong>{carbs ? `${carbs}g` : 'N/A'}</strong>
            </Typography>
            <Typography variant="body2">
              Fat: <strong>{fat ? `${fat}g` : 'N/A'}</strong>
            </Typography>
            {nutrition.fiber !== undefined && (
              <Typography variant="body2">
                Fiber: <strong>{nutrition.fiber}g</strong>
              </Typography>
            )}
            {nutrition.sugar !== undefined && (
              <Typography variant="body2">
                Sugar: <strong>{nutrition.sugar}g</strong>
              </Typography>
            )}
            {nutrition.sodium !== undefined && (
              <Typography variant="body2">
                Sodium: <strong>{Math.round(nutrition.sodium)}mg</strong>
              </Typography>
            )}
          </Box>
        </Box>

        {macroData.length > 0 && macroData.some(item => item.value > 0) && (
          <Box sx={{ width: '100%', height: 200, maxWidth: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}g`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
      
      {nutrition.source && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Source: {nutrition.source}
        </Typography>
      )}
    </Paper>
  );
}

export default NutritionChart;