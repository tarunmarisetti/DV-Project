// Global variables to store data and scales
let data;
let svg, width, height;
//color scale
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
d3.csv("Data_main.csv").then(data => {

    const reference = d3.select("#reference").property("value");
    const xAttribute = "sy_dist"; // Hardcode the X-axis attribute
    const yAttribute = d3.select("#y-axis").property("value");
    console.log("yAttribute",d3.select("#y-axis").property("value"));

    // Define default configurations and variables
    const sampleSize = 100;
    // Use a Set to store unique `(x, y)` combinations
    const uniquePoints = new Set();

    const sampledData = data
        .sort(() => 0.5 - Math.random()) // Randomize the dataset
        .filter(d => {
            const xValue = +d[xAttribute];
            const yValue = +d[yAttribute];

            // Create a unique key for the combination
            const uniqueKey = `${xValue}-${yValue}`;

            // Check if the combination already exists
            if (uniquePoints.has(uniqueKey)) {
                return false; // Skip this point if it's a duplicate
            }

            // Add the combination to the Set and include this point
            uniquePoints.add(uniqueKey);
            return true;
        })
        .slice(0, sampleSize); // Limit the final dataset to the sample size

    // console.log(sampledData)
    const earthAttributes = {
        x: {
            "Distance from Earth (parsecs)": "sy_dist"
        },
        y: {
            "Planet Radius (Earth Radii)": "pl_rade",
            "Planet Mass (Earth Masses)": "pl_bmasse",
            "Distance between the planet and its host star (AU)": "pl_orbsmax",
            "Insolation Flux (Earth Flux)": "pl_insol"
        },
        color: {
            "Temperature": "pl_eqt",
            "Discovery Method": "discoverymethod",
            "Discovery Year": "disc_year",
            "Host Star Type": "st_spectype"
        }
    };

    const jupiterAttributes = {
        x: {
            "Distance from Earth (parsecs)": "sy_dist",
        },
        y: {
            "Planet Radius (Jupiter Radii)": "pl_radj",
            "Planet Mass (Jupiter Masses)": "pl_bmassj",
            "Distance between the planet and its host star(AU)": "pl_orbsmax",
        },
        color: {
            "Temperature": "pl_eqt",
            "Discovery Method": "discoverymethod",
            "Discovery Year": "disc_year",
            "Host Star Type": "st_spectype"
        }
    };

    let selectedAttributes = earthAttributes;
    
    // Update dropdowns based on reference planet selection
    function updateDropdowns() {
        const reference = d3.select("#reference").property("value");
        selectedAttributes = reference === "Earth" ? earthAttributes : jupiterAttributes;

        updateAxisDropdown("#y-axis", selectedAttributes.y);
        updateAxisDropdown("#color", selectedAttributes.color);
        // console.log(selectedAttributes);

        drawChart();
    }

    function updateAxisDropdown(id, options) {
        const dropdown = d3.select(id);
        dropdown.selectAll("option").remove();
        Object.keys(options).forEach(key => {
            dropdown.append("option").attr("value", options[key]).text(key);
        });
    }
// Compute IQR and filter out outliers
function removeOutliers(data, attribute) {
    const values = data.map(d => +d[attribute]).filter(d => !isNaN(d)); // Extract valid numeric values
    const q1 = d3.quantile(values, 0.25);
    const q3 = d3.quantile(values, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter(d => {
        const value = +d[attribute];
        return value >= lowerBound && value <= upperBound; // Keep values within bounds
    });
}
function getYAttributeLabel(yAttribute) {
    // Search in earthAttributes.y and jupiterAttributes.y
    for (const [label, value] of Object.entries(earthAttributes.y)) {
        if (value === yAttribute) {
            return label;
        }
    }
    for (const [label, value] of Object.entries(jupiterAttributes.y)) {
        if (value === yAttribute) {
            return label;
        }
    }
    // Fallback if no match is found
    return yAttribute;
}

let previousXAttribute = reference;
let previousYAttribute = yAttribute; // Initialize previous attribute to track changes

// Draw chart based on current dropdown selections
function drawChart() {
    
    const refPlanet = d3.select("#reference").property("value");
    const xAttribute = "sy_dist"; // Hardcode the X-axis attribute
    const yAttribute = d3.select("#y-axis").property("value");
    const colorAttribute = d3.select("#color").property("value");
    console.log("yAttribute",yAttribute);

    // Increase width and height for a larger plot area
    // Set up dimensions and margins
    const margin = { top: 20, right: 150, bottom: 60, left: 70 };
    width = 1000 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    // Clear any existing SVG to redraw
    d3.select("#chart").selectAll("svg").remove();

    svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("opacity", 0) 
        .transition()
        .duration(500) 
        .style("opacity", 1) 
        .selection()
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
                
    const isContinuous = colorAttribute === "pl_eqt" || colorAttribute === "disc_year";
    
    // Filter out non-positive values for log scale attributes
    const isLogScale = ["pl_rade", "pl_bmasse", "pl_radj", "pl_bmassj"].includes(yAttribute);

     // Remove outliers from the data for the selected y-axis attribute
    const filteredData = removeOutliers(sampledData, yAttribute);

    const xMin = Math.max(0.1, d3.min(filteredData, d => +d[xAttribute])); // Avoid zero for log scale
    const xMax = d3.max(filteredData, d => +d[xAttribute]);

    // X-axis Scale
    const xScale = d3.scaleLog().domain([xMin, xMax]).range([0, width+50]);

    // X-Axis animation during initial rendering
    if (previousXAttribute!=refPlanet) {
        // Append and animate x-axis line
        svg.append("line")
            .attr("class", "axis")
            .attr("x1", 0)
            .attr("x2", 0) // Start at 0
            .attr("y1", height)
            .attr("y2", height)
            .style("stroke", "white")
            .style("stroke-width", 1.5)
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr("x2", width); // Animate to full width

        // Append x-axis ticks and labels after animation
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .style("opacity", 0) // Initially hide ticks
            .transition()
            .delay(500) // Match line animation delay
            .duration(500)
            .style("opacity", 1)
            .call(d3.axisBottom(xScale));
        previousXAttribute=refPlanet
    } else {
        // Directly render the x-axis without animation
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));
    }

    const xAxisLabelText = refPlanet === "Earth" 
    ? "Distance from Earth (parsecs)" 
    : "Distance from Jupiter (parsecs)";

    // X-axis label
    svg.append("text")
        .attr("class", "axis-label") // Changed to axis-label for proper styling
        .attr("text-anchor", "middle")
        .attr("x", width / 2+20)
        .attr("y", height + margin.bottom - 10)
        .text(xAxisLabelText)
        .style("fill", "#ffffff") // Explicitly set the text color for visibility
        .style("font-weight", "bold");
    
   
    // Define y-scale with dynamic domain
    const yMin = isLogScale ? Math.max(0.1, d3.min(filteredData, d => +d[yAttribute])) : d3.min(filteredData, d => +d[yAttribute]);
    const yMax = d3.max(filteredData, d => +d[yAttribute]);


    const yScale = isLogScale
        ? d3.scaleLog().domain([yMin, yMax]).range([height, 0])
        : d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    // Append a y-axis line
    if (yAttribute !== previousYAttribute) {
        svg.append("line")
        .attr("class", "axis")
        .attr("x1", -0.5)
        .attr("x2", -0.5)
        .attr("y1", height)
        .attr("y2", height) // Start at the bottom for animation
        .style("stroke", "white")
        .style("stroke-width", 1.5)
        .transition() // Animate the line growth
        .duration(500)
        .ease(d3.easeCubicInOut)
        .attr("y2", 0); // Grow to full height

        let yAxis;
        if(isContinuous){
            // Define tick values dynamically or explicitly
        const logTicks = yScale.ticks(); // Use yScale.ticks() to generate dynamic tick values
        yAxis = d3.axisLeft(yScale)
            .tickValues(logTicks) // Dynamically calculated ticks
            .tickFormat(d3.format(".1f")); // Ensure proper formatting (no duplicates)
        }
        else{
            yAxis = d3.axisLeft(yScale)
            .ticks(10) // Adjust number of ticks for linear/log scale
            .tickFormat(d); // Format for log scale if needed

        }

        // Add y-axis ticks and labels after the line animation
        svg.append("g")
        .attr("class", "axis")
        .style("opacity", 0) // Initially hide ticks
        .attr("transform", `translate(0, 0)`)
        .transition()
        .delay(500) // Delay to match the line animation
        .duration(500)
        .style("opacity", 1) // Fade in ticks
        .call(yAxis);

        // Update the previous yAttribute to the current one
        previousYAttribute = yAttribute;
    
    }
    else{
        // Directly render the y-axis without animation
        const yAxis = d3.axisLeft(yScale)
        .ticks(isLogScale ? 5 : 10)
        .tickFormat(d => isLogScale ? d3.format(".1f")(d) : d);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, 0)`)
            .call(yAxis);

    }
    // Y-axis label
    svg.append("text")
        .attr("class", "axis-label") // Changed to axis-label for proper styling
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text(d3.select("#y-axis option:checked").text())
        .style("fill", "#ffffff") // Explicitly set the text color for visibility
        .style("font-weight", "bold");

    // Filter out points outside the axis range
    const filtered_Data = filteredData.filter(d => {
        const xValue = +d[xAttribute];
        const yValue = +d[yAttribute];

        // Ensure points are within the x and y domains
        return (
            xValue >= xScale.domain()[0] &&
            xValue <= xScale.domain()[1] &&
            yValue >= yScale.domain()[0] &&
            yValue <= yScale.domain()[1]
        );
    });
    // Data Points
    svg.selectAll(".data-circle")
        .data(filtered_Data)
        .enter()
        .append("circle")
        .attr("class", "data-circle")
        .attr("cx", d => xScale(d[xAttribute]))
        .attr("cy", d => yScale(d[yAttribute]))
        .attr("r", 5);

    // Initially set colors and legend
    updateCircleColors(svg,width,height);
}
function generateTooltipContent(d, colorAttribute) {
    let additionalInfo = "";
    const refPlanet = d3.select("#reference").property("value");
    const yAttribute = d3.select("#y-axis").property("value");

    if (colorAttribute === "discoverymethod") {
        additionalInfo = `<strong>Discovery Method:</strong> ${d.discoverymethod || "N/A"}<br>`;
    } else if (colorAttribute === "disc_year") {
        additionalInfo = `<strong>Discovery Year:</strong> ${d.disc_year || "N/A"}<br>`;
    } else if (colorAttribute === "st_spectype") {
        additionalInfo = `<strong>Host Star Type:</strong> ${d.st_spectype || "N/A"}<br>`;
    } else {
        additionalInfo = `<strong>${colorAttribute}:</strong> ${d[colorAttribute] || "N/A"}<br>`;
    }
    return `
    <strong>Planet:</strong> ${d.pl_name || "N/A"}<br>
    <strong>Dist from ${refPlanet}:</strong> ${(+d[xAttribute]).toFixed(2) || "N/A"} parsecs<br>
    <strong>${getYAttributeLabel(yAttribute)}:</strong> ${(+d[yAttribute]).toFixed(2) || "N/A"}<br>
    ${additionalInfo}
    `;
}

function updateCircleColors(svg,width,height) {
    const colorAttribute = d3.select("#color").property("value");
    const refPlanet = d3.select("#reference").property("value");
    const yAttribute = d3.select("#y-axis").property("value");

    // Define Earth-like temperature thresholds
    const temperatureThresholds = {
        cooler: 350,
        similar: [250, 800],
        hotter: 800,
    };

    // Map classification to colors
    const colorMapping = {
        cooler: "#1f77b4", // blue
        similar: "#ff7f0e", // orange
        hotter: "#d62728", // red
    };

    // Function to classify temperature
    function classifyTemperature(temp) {
        if (temp < temperatureThresholds.cooler) {
            return "cooler";
        } else if (temp >= temperatureThresholds.similar[0] && temp <= temperatureThresholds.similar[1]) {
            return "similar";
        } else if (temp > temperatureThresholds.hotter) {
            return "hotter";
        }
        return null; // For missing values
    }

    const isContinuous = colorAttribute === "pl_eqt" || colorAttribute === "disc_year";
    const colorScale = isContinuous
        ? d3.scaleSequential(d3.interpolateCool).domain(d3.extent(sampledData, (d) => +d[colorAttribute]))
        : d3.scaleOrdinal(d3.schemeCategory10);

    const circles = d3.select("#chart").selectAll(".data-circle");

    // Update circle colors
    circles.transition()
        .duration(500)
        .attr("fill", (d) => {
            if (colorAttribute === "pl_eqt") {
                const tempClass = classifyTemperature(+d[colorAttribute]);
                return tempClass ? colorMapping[tempClass] : "#ccc"; // Default gray for missing values
            } else {
                const colorValue = d[colorAttribute];
                return colorValue !== undefined && colorValue !== null ? colorScale(colorValue) : "#ccc"; // Default gray
            }
        });

    // Highlight functionality for hover
    circles
    .on("mouseover", function (event, d) {
        const tooltip = d3.select("#tooltip");
        let tooltipContent;

        if (colorAttribute === "pl_eqt") {
            // Temperature classification tooltip
            const tempClass = classifyTemperature(+d[colorAttribute]);
            tooltipContent = `
                <strong>Planet:</strong> ${d.pl_name || "N/A"}<br>
                <strong>Temperature:</strong> ${(+d[colorAttribute]).toFixed(2) || "N/A"} K<br>
                <strong>Classification:</strong> ${
                    tempClass ? tempClass.charAt(0).toUpperCase() + tempClass.slice(1) : "N/A"
                }<br>
                <strong>Dist from ${refPlanet}:</strong> ${(+d[xAttribute]).toFixed(2) || "N/A"} parsecs<br>
                <strong>${getYAttributeLabel(yAttribute)}:</strong> ${(+d[yAttribute]).toFixed(2) || "N/A"}
            `;
        } else {
            // General tooltip for other attributes
            tooltipContent = generateTooltipContent(d, colorAttribute);
        }

        // Show the tooltip
        tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY + 10 + "px")
            .style("opacity", 1)
            .html(tooltipContent);

        // Determine hover behavior
        svg.selectAll(".data-circle")
            .transition()
            .duration(100)
            .style("opacity", (data) => {
                if (colorAttribute === "pl_eqt") {
                    // Handle temperature classification
                    const hoverTempClass = classifyTemperature(+data[colorAttribute]);
                    const tempClass = classifyTemperature(+d[colorAttribute]);
                    return hoverTempClass === tempClass ? 1 : 0.1;
                } else if (colorAttribute === "disc_year" || colorAttribute === "st_spectype" || colorAttribute === "discoverymethod") {
                    // Handle categorical attributes
                    return d[colorAttribute] === data[colorAttribute] ? 1 : 0.1;
                } else {
                    // Handle other continuous attributes
                    const selectedValue = +d[colorAttribute];
                    const hoverValue = +data[colorAttribute];
                    return Math.abs(selectedValue - hoverValue) < 5 ? 1 : 0.1; // Adjust threshold as needed
                }
            });

        // Highlight the hovered circle
        d3.select(this)
            .transition()
            .duration(100)
            .attr("r", 8)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    })
    .on("mouseout", function () {
        const tooltip = d3.select("#tooltip");
        tooltip.style("opacity", 0); // Hide tooltip

        // Reset circle opacity
        svg.selectAll(".data-circle")
            .transition()
            .duration(100)
            .style("opacity", 1);

        // Reset the hovered circle
        d3.select(this)
            .transition()
            .duration(100)
            .attr("r", 5)
            .attr("stroke", "none");
    });

    // Update the legend to reflect the new color attribute
    updateLegend(colorAttribute, colorScale, isContinuous,width,height,colorMapping);
}

function updateLegend(colorAttribute, colorScale, isContinuous,width,height,colorMapping) {
    d3.selectAll(".legend").remove();

    const svg = d3.select("#chart").select("svg g");

    if (colorAttribute === "pl_eqt") {
        // Temperature classification legend
        const legend = svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 20}, 0)`);

        Object.keys(colorMapping).forEach((key, i) => {
            legend.append("circle")
                .attr("cx", 0)
                .attr("cy", i * 20)
                .attr("r", 6)
                .style("fill", colorMapping[key]);

            legend.append("text")
                .attr("x", 15)
                .attr("y", i * 20 + 0.5)
                .text(key.charAt(0).toUpperCase() + key.slice(1))
                .style("font-size", "12px")
                .style("fill", "#ffffff")
                .style("font-weight", "bold")
                .attr("alignment-baseline", "middle");
        });
    } else if (isContinuous) {
        // Gradient legend for continuous attributes
        const legendHeight = 200;
        const legendWidth = 20;

        const legendScale = d3.scaleLinear()
            .domain(d3.extent(sampledData, (d) => +d[colorAttribute]))
            .range([legendHeight, 0]);

        const legendSvg = svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 80}, ${(height - legendHeight) / 2})`);

        const defs = svg.append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d3.interpolateCool(0));

        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d3.interpolateCool(1));

        legendSvg.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");

        legendSvg.append("g")
            .attr("class", "legend-axis")
            .attr("transform", `translate(${legendWidth}, 0)`)
            .call(d3.axisRight(legendScale).ticks(5).tickFormat(d3.format(".0f")));
    } else {
        // Ordinal legend
        const uniqueCategories = [...new Set(sampledData.map((d) => d[colorAttribute]))];
        
        let legendXPosition = width + 40;
        console.log("colorAttribute",colorAttribute)
        if (colorAttribute === "discoverymethod") {
            legendXPosition = width-20;
        }

        const legend = svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${legendXPosition}, 0)`);

        uniqueCategories.forEach((category, i) => {
            legend.append("circle")
                .attr("cx", 0)
                .attr("cy", i * 20)
                .attr("r", 6)
                .style("fill", colorScale(category));

            legend.append("text")
                .attr("x", 15)
                .attr("y", i * 20 + 0.5)
                .text(category)
                .style("font-size", "12px")
                .style("fill", "#ffffff")
                .style("font-weight", "bold")
                .attr("alignment-baseline", "middle");
        });
    }
}

    // Initialize dropdowns and set event listeners
    d3.select("#reference").on("change", updateDropdowns);
    d3.select("#y-axis").on("change", drawChart);
    d3.select("#color").on("change", () => updateCircleColors(svg, width, height)); 
    updateDropdowns(); // Initialize with default values
});