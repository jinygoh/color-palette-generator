# Crash Course: Color Palette Generator

This document provides a crash course on how the Color Palette Generator application works.

## Project Overview

The Color Palette Generator is a web application that allows users to generate color palettes. It's built with HTML, CSS, and JavaScript, and it uses the TinyColor library for color manipulation.

The application has two main features:

1.  **Random Palette Generator**: Generates a palette of five random colors.
2.  **Interactive Harmony Generator**: Generates a palette based on a selected color and a harmony rule.

## File Structure

The project consists of the following files:

*   `index.html`: The main HTML file that defines the structure of the web page.
*   `style.css`: The CSS file that styles the application.
*   `script.js`: The JavaScript file that contains the application's logic.
*   `README.md`: A markdown file containing a brief overview of the project.
*   `CRASH_COURSE.md`: This file.

## How the Files Work Together

1.  **`index.html`**: This is the entry point of the application. It loads the `style.css` file for styling and the `script.js` file for functionality. The body of the HTML contains the elements that make up the user interface, such as buttons, input fields, and containers for the color palettes.

2.  **`style.css`**: This file is responsible for the visual appearance of the application. It defines the layout, colors, fonts, and other visual aspects of the user interface. It uses a dark theme and a responsive design that adapts to different screen sizes.

3.  **`script.js`**: This file contains all the logic of the application. It's a modular script that uses the TinyColor library for color calculations. Here's a breakdown of its key functionalities:
    *   **DOM Content Loaded**: The script waits for the HTML content to be fully loaded before it starts executing.
    *   **Element Selectors**: It selects the necessary HTML elements to interact with them.
    *   **State Management**: It maintains the state of the color picker, including the current hue, saturation, and lightness.
    *   **Canvas Drawing**: It uses the HTML5 Canvas API to draw the hue wheel and the saturation/lightness picker.
    *   **Color Generation**: It includes functions to generate random colors and color palettes based on harmony rules.
    *   **Palette Display**: It dynamically creates and displays the color palettes in the user interface.
    *   **Event Handling**: It listens for user events, such as button clicks, input changes, and mouse movements on the color pickers, and updates the application accordingly.
    *   **Clipboard Integration**: It allows users to copy color hex codes to the clipboard.
    *   **Initialization**: It initializes the application with a default color and palette.

## Key Concepts

*   **TinyColor**: A JavaScript library for color manipulation. It's used to create, convert, and manipulate colors, as well as to generate color harmonies.
*   **HTML5 Canvas**: A powerful feature of HTML5 that allows for dynamic, scriptable rendering of 2D shapes and bitmap images. It's used to create the interactive color pickers.
*   **Event-driven programming**: The application's logic is driven by user events, such as clicks and mouse movements. This is a common paradigm in web development.
*   **Responsive Design**: The use of CSS media queries to create a layout that adapts to different screen sizes, providing a good user experience on both desktop and mobile devices.

This crash course should give you a good starting point for understanding how the Color Palette Generator application works. For more detailed information, you can refer to the comments in the code.
