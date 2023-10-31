# Linear Regression

## Introduction

Linear regression is a supervised machine learning algorithm used for **predicting a continuous target variable (label) based on one or more predictor variables (features)**. The core idea is to find the line that best fits the data points.

---

## Key Concepts

### What is Regression? (important)

Regression is a type of predictive modeling technique that aims to predict the target variable based on the given predictor variables. It's essentially trying to find the **"relationship" between the variables**.

---

### Equation of a Line (important)

The equation of a line is given by \( y = mx + c \), where:

- \( y \) is the target variable you're trying to predict
- \( x \) is the feature variable you are using to predict \( y \)
- \( m \) is the slope of the line (shows how \( y \) changes for a one-unit change in \( x \))
- \( c \) is the y-intercept (value of \( y \) when \( x = 0 \))

In multiple linear regression, this extends to:
![Alt text](../../assets/linear-eq-1.png)

---

### Cost Function (important)

The cost function measures how well the line fits the data points. The goal is to minimize this function. A common cost function is Mean Squared Error (MSE).

## ![Alt text](../../assets/linear-reg-cost-function.png)

### Gradient Descent (important)

Gradient Descent is an optimization algorithm to minimize the cost function. It iteratively adjusts the values of \( m \) and \( c \) to find the minimum MSE.

---

## Practical Examples

### Simple Linear Regression in Python (important)

Here's a quick code snippet using Python's `sklearn` library to perform simple linear regression.

```python
from sklearn.linear_model import LinearRegression
import numpy as np

# Sample data
X = np.array([1, 2, 3, 4, 5]).reshape(-1, 1)
y = np.array([2, 4, 3, 3, 5])

# Initialize and fit the model
model = LinearRegression()
model.fit(X, y)

# Make predictions
predictions = model.predict([[6]])

print(f'Prediction for x=6 is {predictions[0]}')
```

In this example, the model learns the best-fit line based on the `X` and `y` data and makes a prediction for when \( x = 6 \).

---

## Summary of Key Takeaways

1. **What is Regression**: Regression aims to predict the target variable based on predictor variables.
2. **Equation of a Line**: \( y = mx + c \) represents a line in simple linear regression.
3. **Cost Function**: The goal is to minimize this function (usually MSE) to find the best-fit line.
4. **Gradient Descent**: An optimization algorithm to minimize the cost function.

---

## Further Resources

1. [Introduction to Statistical Learning (Text)](http://faculty.marshall.usc.edu/gareth-james/ISL/)
2. [Andrew Ng's Machine Learning Course (Video)](https://www.coursera.org/learn/machine-learning)

I hope this presentation has provided you with a clear and comprehensive understanding of linear regression. Feel free to ask for further clarification on any point.
