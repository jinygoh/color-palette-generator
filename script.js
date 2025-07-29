/*
Author: Jules
Date: 2024-07-29
Description: This is the main JavaScript file for the Color Palette Generator application. It handles all the logic for generating random and harmony-based color palettes, as well as the interactive color picker.
*/

// Import the tinycolor library for color manipulation
import tinycolor from 'https://esm.sh/tinycolor2';

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    // Select existing elements from the DOM
    const randomPaletteBtn = document.getElementById('randomPaletteBtn'); // Button to generate a random palette
    const paletteDisplay = document.getElementById('paletteDisplay'); // Section to display the color palette
    const paletteDisplayTitle = document.getElementById('paletteDisplayTitle'); // Title of the palette display section

    // Select new elements for the interactive generator
    const baseColorInput = document.getElementById('baseColorInput'); // Input field for the base color in hex format
    const harmonyRuleSelect = document.getElementById('harmonyRuleSelect'); // Dropdown to select the harmony rule
    const generateHarmonyBtn = document.getElementById('generateHarmonyBtn'); // Button to generate the harmony palette

    // Select canvas elements for the color wheel
    const hueWheelCanvas = document.getElementById('hueWheelCanvas'); // Canvas for the hue wheel
    const slPickerCanvas = document.getElementById('slPickerCanvas'); // Canvas for the saturation/lightness picker
    const hueWheelCtx = hueWheelCanvas.getContext('2d'); // 2D rendering context for the hue wheel canvas
    const slPickerCtx = slPickerCanvas.getContext('2d'); // 2D rendering context for the saturation/lightness picker canvas

    const NUM_COLORS_PER_PALETTE = 5; // Default number of colors per palette

    // --- State for Color Picker ---
    let currentHue = 0; // Current hue value (0-360)
    let currentSaturation = 1; // Current saturation value (0-1)
    let currentLightness = 0.5; // Current lightness value (0-1)
    let isDraggingHue = false; // Flag to indicate if the user is dragging the hue marker
    let isDraggingSL = false; // Flag to indicate if the user is dragging the saturation/lightness marker

    // --- Canvas Drawing Utilities & Logic ---
    const HUE_WHEEL_RADIUS = hueWheelCanvas.width / 2; // Radius of the hue wheel
    const HUE_MARKER_RADIUS = 8; // Radius of the hue marker
    const SL_MARKER_RADIUS = 6; // Radius of the saturation/lightness marker
    const HARMONY_INDICATOR_RADIUS = 4; // Radius of the harmony indicators on the hue wheel

    /**
     * @function drawHueWheel
     * @description Draws the hue wheel on the canvas, including the hue marker and harmony indicators.
     * @param {string[]} [harmonyPaletteColors=[]] - An array of hex colors for the harmony palette.
     */
    function drawHueWheel(harmonyPaletteColors = []) {
        // Clear the canvas
        hueWheelCtx.clearRect(0, 0, hueWheelCanvas.width, hueWheelCanvas.height);
        // Get the center of the canvas
        const centerX = hueWheelCanvas.width / 2;
        const centerY = hueWheelCanvas.height / 2;
        // Set the radius and band thickness of the hue wheel
        const radius = HUE_WHEEL_RADIUS * 0.85;
        const bandThickness = HUE_WHEEL_RADIUS * 0.15 * 2;

        // Draw the hue wheel
        for (let angle = 0; angle < 360; angle += 1) {
            // Calculate the start and end angles in radians
            const startAngle = (angle - 1) * Math.PI / 180;
            const endAngle = angle * Math.PI / 180;
            // Begin a new path
            hueWheelCtx.beginPath();
            // Add an arc to the path
            hueWheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
            // Set the line width
            hueWheelCtx.lineWidth = bandThickness;
            // Set the stroke style to the corresponding hsl color
            hueWheelCtx.strokeStyle = `hsl(${angle}, 100%, 50%)`;
            // Stroke the path
            hueWheelCtx.stroke();
        }

        // Draw the hue marker
        const markerAngle = currentHue * Math.PI / 180;
        const markerX = centerX + Math.cos(markerAngle) * radius;
        const markerY = centerY + Math.sin(markerAngle) * radius;

        // Draw the marker circle
        hueWheelCtx.beginPath();
        hueWheelCtx.arc(markerX, markerY, HUE_MARKER_RADIUS, 0, 2 * Math.PI);
        hueWheelCtx.fillStyle = 'white';
        hueWheelCtx.fill();
        hueWheelCtx.strokeStyle = '#333';
        hueWheelCtx.lineWidth = 2;
        hueWheelCtx.stroke();

        // Draw harmony color indicators
        if (harmonyPaletteColors && harmonyPaletteColors.length > 0) {
            // Get the base color in hex format
            const baseColorHex = tinycolor({h: currentHue, s: currentSaturation, l: currentLightness}).toHexString();
            // Iterate over the harmony colors
            harmonyPaletteColors.forEach(hexColor => {
                // Don't draw an indicator for the base color
                if (hexColor.toLowerCase() === baseColorHex.toLowerCase()) return;

                // Create a tinycolor object from the hex color
                const color = tinycolor(hexColor);
                // Check if the color is valid
                if (color.isValid()) {
                    // Get the hsl representation of the color
                    const hsl = color.toHsl();
                    // Calculate the angle of the harmony color
                    const harmonyAngleRad = hsl.h * Math.PI / 180;
                    // Calculate the x and y coordinates of the indicator
                    const hX = centerX + Math.cos(harmonyAngleRad) * radius;
                    const hY = centerY + Math.sin(harmonyAngleRad) * radius;

                    // Draw the indicator circle
                    hueWheelCtx.beginPath();
                    hueWheelCtx.arc(hX, hY, HARMONY_INDICATOR_RADIUS, 0, 2 * Math.PI);
                    // Set the fill style based on the lightness for visibility
                    hueWheelCtx.fillStyle = hsl.l > 0.5 ? '#333' : '#fff';
                    hueWheelCtx.fill();
                    // Set the stroke style based on the lightness for visibility
                    hueWheelCtx.strokeStyle = hsl.l > 0.5 ? '#fff' : '#333';
                    hueWheelCtx.lineWidth = 1;
                    hueWheelCtx.stroke();
                }
            });
        }
    }

    /**
     * @function drawSLPicker
     * @description Draws the saturation/lightness picker on the canvas.
     */
    function drawSLPicker() {
        // Clear the canvas
        slPickerCtx.clearRect(0, 0, slPickerCanvas.width, slPickerCanvas.height);
        // Get the width and height of the canvas
        const width = slPickerCanvas.width;
        const height = slPickerCanvas.height;

        // Fill the canvas with the base hue
        slPickerCtx.fillStyle = `hsl(${currentHue}, 100%, 50%)`;
        slPickerCtx.fillRect(0, 0, width, height);

        // Create a saturation gradient (white to transparent)
        const satGradient = slPickerCtx.createLinearGradient(0, 0, width, 0);
        satGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        satGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        slPickerCtx.fillStyle = satGradient;
        slPickerCtx.fillRect(0, 0, width, height);

        // Create a lightness gradient (black to transparent)
        const lightGradient = slPickerCtx.createLinearGradient(0, 0, 0, height);
        lightGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        lightGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        slPickerCtx.fillStyle = lightGradient;
        slPickerCtx.fillRect(0, 0, width, height);

        // Draw the S/L marker
        const markerX = currentSaturation * width;
        const markerY = (1 - currentLightness) * height; // Invert lightness for y-coordinate

        // Draw the marker circle
        slPickerCtx.beginPath();
        slPickerCtx.arc(markerX, markerY, SL_MARKER_RADIUS, 0, 2 * Math.PI);
        // Set the fill color based on lightness for visibility
        const markerFillColor = currentLightness > 0.5 ? 'black' : 'white';
        slPickerCtx.fillStyle = markerFillColor;
        slPickerCtx.fill();
        // Set the stroke color based on lightness for visibility
        slPickerCtx.strokeStyle = currentLightness > 0.5 ? 'white' : 'black';
        slPickerCtx.lineWidth = 1.5;
        slPickerCtx.stroke();
    }

    // --- Existing Random Palette Functions ---

    /**
     * @function getRandomHexColor
     * @description Generates a random hex color.
     * @returns {string} A random hex color string.
     */
    function getRandomHexColor() {
        // Initialize the hex color string
        let hexColor = '#';
        // Define the hexadecimal characters
        const hexChars = '0123456789ABCDEF';
        // Generate a 6-character hex string
        for (let i = 0; i < 6; i++) {
            hexColor += hexChars[Math.floor(Math.random() * 16)];
        }
        // Return the hex color
        return hexColor;
    }

    /**
     * @function generatePalette
     * @description Generates a palette of random hex colors.
     * @returns {string[]} An array of random hex color strings.
     */
    function generatePalette() {
        // Initialize the colors array
        const colors = [];
        // Generate the specified number of random colors
        for (let i = 0; i < NUM_COLORS_PER_PALETTE; i++) {
            colors.push(getRandomHexColor());
        }
        // Return the array of colors
        return colors;
    }

    // --- Interactive Harmony Palette Functions ---

    /**
     * @function generateHarmonyPalette
     * @description Generates a harmony palette based on a base color and a harmony rule.
     * @param {string} baseColorValue - The base color in hex format.
     * @param {string} harmonyRule - The harmony rule to apply.
     * @returns {string[]|null} An array of hex color strings for the harmony palette, or null if the base color is invalid.
     */
    function generateHarmonyPalette(baseColorValue, harmonyRule) {
        // Create a tinycolor object from the base color
        const base = tinycolor(baseColorValue);
        // Check if the base color is valid
        if (!base.isValid()) {
            // Alert the user if the color is invalid
            alert("Invalid base color provided. Please enter a valid hex code (e.g., #3498db or 3498db).");
            // Return null
            return null;
        }

        // Initialize the harmony colors array
        let harmonyColors = [];

        // Generate the harmony palette based on the selected rule
        switch (harmonyRule) {
            case 'analogous':
                // Generate an analogous palette
                harmonyColors = base.analogous(NUM_COLORS_PER_PALETTE + 1).map(tc => tc.toHexString());
                harmonyColors = [base.toHexString(), ...harmonyColors.slice(1, NUM_COLORS_PER_PALETTE)];
                break;
            case 'monochromatic':
                // Generate a monochromatic palette
                harmonyColors = base.monochromatic(NUM_COLORS_PER_PALETTE).map(tc => tc.toHexString());
                break;
            case 'splitcomplement':
                // Generate a split complement palette
                const splitComps = base.splitcomplement().map(tc => tc.toHexString());
                harmonyColors = [splitComps[0]];
                harmonyColors.push(splitComps[1]);
                harmonyColors.push(tinycolor(splitComps[1]).lighten(15).toHexString());
                harmonyColors.push(splitComps[2]);
                harmonyColors.push(tinycolor(splitComps[2]).darken(15).toHexString());
                harmonyColors = harmonyColors.slice(0, NUM_COLORS_PER_PALETTE);
                break;
            case 'triad':
                // Generate a triad palette
                harmonyColors = base.triad().map(tc => tc.toHexString());
                if (harmonyColors.length < NUM_COLORS_PER_PALETTE && harmonyColors.length > 1) {
                    harmonyColors.push(tinycolor(harmonyColors[1]).lighten(20).toHexString());
                }
                if (harmonyColors.length < NUM_COLORS_PER_PALETTE && harmonyColors.length > 2) {
                    harmonyColors.push(tinycolor(harmonyColors[2]).darken(20).toHexString());
                }
                harmonyColors = harmonyColors.slice(0, NUM_COLORS_PER_PALETTE);
                break;
            case 'tetrad':
                // Generate a tetrad palette
                harmonyColors = base.tetrad().map(tc => tc.toHexString());
                if (harmonyColors.length < NUM_COLORS_PER_PALETTE) {
                    harmonyColors.push(tinycolor(harmonyColors[0]).lighten(20).toHexString());
                }
                harmonyColors = harmonyColors.slice(0, NUM_COLORS_PER_PALETTE);
                break;
            case 'complement':
                // Generate a complement palette
                const complementColor = base.complement().toHexString();
                harmonyColors = [
                    base.toHexString(),
                    base.clone().lighten(20).toHexString(),
                    complementColor,
                    tinycolor(complementColor).lighten(20).toHexString(),
                    base.clone().spin(30).desaturate(10).toHexString()
                ].slice(0, NUM_COLORS_PER_PALETTE);
                break;
            case 'shades':
                // Generate a shades palette
                harmonyColors = [
                    base.clone().darken(30).toHexString(),
                    base.clone().darken(15).toHexString(),
                    base.toHexString(),
                    base.clone().lighten(15).toHexString(),
                    base.clone().lighten(30).toHexString()
                ].slice(0, NUM_COLORS_PER_PALETTE);
                break;
            default:
                // Default to a single-color palette
                harmonyColors = [base.toHexString()];
        }
        // Return the harmony colors, ensuring all are valid hex strings
        return harmonyColors.map(color => tinycolor(color).toHexString());
    }


    // --- Generic Display Palette Function (Modified) ---

    /**
     * @function displayPalette
     * @description Displays a color palette in the UI.
     * @param {string[]} colors - An array of hex color strings.
     * @param {string} [title="Color Palette"] - The title of the palette.
     */
    function displayPalette(colors, title = "Color Palette") {
        // Clear the existing palette display
        paletteDisplay.innerHTML = '';

        // Create and append the palette title
        const paletteTitle = document.createElement('h2');
        paletteTitle.id = 'paletteDisplayTitle';
        paletteTitle.textContent = title;
        paletteDisplay.appendChild(paletteTitle);

        // Check if there are any colors to display
        if (!colors || colors.length === 0) {
            // Display a message if there are no colors
            const message = document.createElement('p');
            message.textContent = 'No colors to display or invalid input for harmony.';
            paletteDisplay.appendChild(message);
            return;
        }

        // Create a container for the palette
        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'palette';

        // Iterate over the colors and create swatches for each
        colors.forEach(colorString => {
            // Create a tinycolor object from the color string
            const tcColor = tinycolor(colorString);
            // Check if the color is valid
            if (!tcColor.isValid()) {
                // Log a warning if the color is invalid
                console.warn(`Invalid color string encountered: ${colorString}`);
                // Skip to the next color
                return;
            }
            // Get the hex string of the color
            const hex = tcColor.toHexString();

            // Create a container for the color swatch
            const swatchContainer = document.createElement('div');
            swatchContainer.className = 'color-swatch-container';

            // Create the color swatch element
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hex;
            swatch.title = `Copy ${hex}`;

            // Create the hex code element
            const hexCode = document.createElement('p');
            hexCode.className = 'hex-code';
            hexCode.textContent = hex;
            hexCode.title = `Copy ${hex}`;

            // Event listener for copying the hex code
            const copyColor = async () => {
                try {
                    // Copy the hex code to the clipboard
                    await navigator.clipboard.writeText(hex);
                    // Provide visual feedback to the user
                    const originalText = hexCode.textContent;
                    hexCode.textContent = 'Copied!';
                    swatch.style.borderColor = '#5cb85c';
                    setTimeout(() => {
                        hexCode.textContent = originalText;
                        swatch.style.borderColor = '#ccc';
                    }, 1000);
                } catch (err) {
                    // Log an error if copying fails
                    console.error('Failed to copy: ', err);
                    // Alert the user that copying failed
                    alert(`Failed to copy. You can manually copy: ${color}`);
                }
            };

            // Add event listeners to the swatch and hex code elements
            swatch.addEventListener('click', copyColor);
            hexCode.addEventListener('click', copyColor);

            // Append the swatch and hex code to the swatch container
            swatchContainer.appendChild(swatch);
            swatchContainer.appendChild(hexCode);
            // Append the swatch container to the palette container
            paletteContainer.appendChild(swatchContainer);
        });
        // Append the palette container to the palette display section
        paletteDisplay.appendChild(paletteContainer);
    }

    // --- Event Listeners ---

    // Event listener for the random palette button
    randomPaletteBtn.addEventListener('click', () => {
        // Generate a new random palette
        const newGeneratedPalette = generatePalette();
        // Display the new palette
        displayPalette(newGeneratedPalette, "Random Palette");
    });

    /**
     * @function handleGenerateHarmony
     * @description Handles the generation of the harmony palette.
     * @returns {string[]|null} The generated harmony palette.
     */
    function handleGenerateHarmony() {
        // Update the base color input from the current HSL state
        const colorFromPicker = tinycolor({ h: currentHue, s: currentSaturation, l: currentLightness });
        baseColorInput.value = colorFromPicker.toHexString();

        // Get the base color and harmony rule from the input fields
        const baseColor = baseColorInput.value;
        const harmonyRule = harmonyRuleSelect.value;
        const selectedRuleText = harmonyRuleSelect.options[harmonyRuleSelect.selectedIndex].text;

        // Generate the harmony palette
        const harmonyPalette = generateHarmonyPalette(baseColor, harmonyRule);
        // Display the harmony palette if it's valid
        if (harmonyPalette) {
            displayPalette(harmonyPalette, `${selectedRuleText} Harmony`);
        }
        // Return the generated palette
        return harmonyPalette;
    }

    // Event listener for the generate harmony button
    generateHarmonyBtn.addEventListener('click', () => {
        // Update the color from the picker
        updateColorFromPicker();
    });

    // Event listener for the harmony rule select dropdown
    harmonyRuleSelect.addEventListener('change', () => {
        // Update the color from the picker
        updateColorFromPicker();
    });

    // Event listener for the base color input field
    baseColorInput.addEventListener('input', () => {
        // Create a tinycolor object from the input value
        const color = tinycolor(baseColorInput.value);
        // Check if the color is valid
        if (color.isValid()) {
            // Get the HSL representation of the color
            const hsl = color.toHsl();
            // Update the current hue, saturation, and lightness
            currentHue = hsl.h;
            currentSaturation = hsl.s;
            currentLightness = hsl.l;
            // Update the color from the picker
            updateColorFromPicker();
        }
    });


    // --- Canvas Event Handling ---

    /**
     * @function updateColorFromPicker
     * @description Updates the color from the picker and redraws the UI.
     */
    function updateColorFromPicker() {
        // Generate the harmony palette and get the current palette
        const currentPalette = handleGenerateHarmony();
        // Redraw the hue wheel with harmony indicators
        drawHueWheel(currentPalette);
        // Redraw the S/L picker
        drawSLPicker();
    }

    // Event listener for the hue wheel canvas (mousedown)
    hueWheelCanvas.addEventListener('mousedown', (e) => {
        // Set the dragging flag to true
        isDraggingHue = true;
        // Get the position of the click
        const rect = hueWheelCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = hueWheelCanvas.width / 2;
        const centerY = hueWheelCanvas.height / 2;

        // Calculate the angle of the click
        const angleRad = Math.atan2(y - centerY, x - centerX);
        let angleDeg = angleRad * 180 / Math.PI;
        if (angleDeg < 0) angleDeg += 360;
        // Update the current hue
        currentHue = angleDeg;
        // Update the color from the picker
        updateColorFromPicker();
    });

    // Event listener for the hue wheel canvas (mousemove)
    hueWheelCanvas.addEventListener('mousemove', (e) => {
        // Check if the user is dragging
        if (isDraggingHue) {
            // Get the position of the mouse
            const rect = hueWheelCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = hueWheelCanvas.width / 2;
            const centerY = hueWheelCanvas.height / 2;

            // Calculate the angle of the mouse
            const angleRad = Math.atan2(y - centerY, x - centerX);
            let angleDeg = angleRad * 180 / Math.PI;
            if (angleDeg < 0) angleDeg += 360;
            // Update the current hue
            currentHue = angleDeg;
            // Update the color from the picker
            updateColorFromPicker();
        }
    });

    // Event listener for the S/L picker canvas (mousedown)
    slPickerCanvas.addEventListener('mousedown', (e) => {
        // Set the dragging flag to true
        isDraggingSL = true;
        // Get the position of the click
        const rect = slPickerCanvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Update the current saturation and lightness
        currentSaturation = Math.max(0, Math.min(1, x / slPickerCanvas.width));
        currentLightness = 1 - Math.max(0, Math.min(1, y / slPickerCanvas.height));
        // Update the color from the picker
        updateColorFromPicker();
    });

    // Event listener for the S/L picker canvas (mousemove)
    slPickerCanvas.addEventListener('mousemove', (e) => {
        // Check if the user is dragging
        if (isDraggingSL) {
            // Get the position of the mouse
            const rect = slPickerCanvas.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            // Update the current saturation and lightness
            currentSaturation = Math.max(0, Math.min(1, x / slPickerCanvas.width));
            currentLightness = 1 - Math.max(0, Math.min(1, y / slPickerCanvas.height));
            // Update the color from the picker
            updateColorFromPicker();
        }
    });

    // Global mouseup listener to stop dragging
    document.addEventListener('mouseup', () => {
        isDraggingHue = false;
        isDraggingSL = false;
    });


    // --- Initial Setup ---

    /**
     * @function initializeApp
     * @description Initializes the application.
     */
    function initializeApp() {
        // Get the initial color from the hex input
        const initialColor = tinycolor(baseColorInput.value);
        // Check if the color is valid
        if (initialColor.isValid()) {
            // Get the HSL representation of the color
            const hsl = initialColor.toHsl();
            // Set the initial hue, saturation, and lightness
            currentHue = hsl.h;
            currentSaturation = hsl.s;
            currentLightness = hsl.l;
        }

        // Generate and display the initial palette
        const initialPalette = handleGenerateHarmony();
        // Draw the hue wheel with indicators for the initial palette
        drawHueWheel(initialPalette);
        // Draw the S/L picker
        drawSLPicker();
    }

    // Initialize the application
    initializeApp();
});
