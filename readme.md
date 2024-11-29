# Scatter Plot Visualization with Animated Transitions

This project is a data visualization web app that generates a scatter plot to visualize relationships between different planetary attributes, such as distance from Earth, planetary radius, temperature, and discovery year. The scatter plot allows users to interactively change axes and attributes, and smoothly animates data transitions to provide an engaging user experience.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Customization](#customization)
- [Credits](#credits)

## Overview
The scatter plot visualization project helps users understand the relationship between planetary features by displaying interactive points on a chart. The data points move smoothly when the user selects different attributes for the axes or changes the coloring scheme, making the transitions easy to track visually.

The main features include:
- Smooth transitions of data points when changing attributes.
- Interactive tooltips showing detailed information about each data point.
- Dynamic color coding based on various attributes, such as discovery year or temperature.
- An informative legend, positioned at the top right, that describes the color scale used.

## Features
- **Dynamic Scatter Plot**: Displays a scatter plot with configurable x and y axes, which users can change dynamically.
- **Smooth Transitions**: Data points smoothly transition from old to new positions whenever the selected attributes are changed.
- **Color-Coded Points**: Points are color-coded based on a selected attribute, with continuous attributes like temperature displayed using a gradient.
- **Interactive Tooltips**: When hovering over a data point, a tooltip displays relevant information like planet name, temperature, distance from Earth, and discovery method.
- **Legend for Color Attributes**: A color legend, positioned at the top right of the chart, describes the attribute used for color coding.

## Technologies Used
- **D3.js**: For rendering and animating the scatter plot, as well as handling the transitions and interactions.
- **JavaScript**: The core language for the logic and interaction on the page.
- **HTML/CSS**: For structuring and styling the webpage.

## Setup Instructions
To run this project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd scatter-plot-visualization
   ```

2. **Install Dependencies**:
   Ensure you have a local server setup (e.g., use VS Code's Live Server extension or Python's SimpleHTTPServer).

3. **Run the Project**:
   Start a local server in the project directory to view the scatter plot in a web browser.
   ```bash
   # For Python 3
   python -m http.server
   ```
   Then open your browser at `http://localhost:8000`.

## Usage
- **Select Attributes**: Use the dropdown menus provided to select the x-axis and y-axis attributes.
- **Interactive Points**: Hover over the points to see detailed information about the corresponding planet.
- **Change Coloring Scheme**: Select a different attribute for coloring the points to explore relationships.

### Notes
- **Legend Positioning**: The legend is rendered at the top right of the chart for clear reference to the attribute used for color.
- **Axis Transition**: When you change an attribute, the points on the chart will move from their old positions to the new ones smoothly to enhance visualization continuity.

## Customization
You can easily customize the scatter plot visualization to adapt it to your dataset or adjust the styling:
- **Data Source**: Replace the dataset in the JavaScript code to visualize different data.
- **Attributes**: Modify `xAttribute`, `yAttribute`, and `colorAttribute` dropdowns to work with different fields of your data.
- **Styling**: Update the CSS to change the appearance of the scatter plot, tooltips, and other elements.

## Credits
- **D3.js**: A powerful library for creating interactive visualizations.
- **OpenAI Assistance**: Guidance and suggestions provided to develop interactive features and enhance visualization.

