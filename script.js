// Global variables to store data and scales
let data;
//color scale
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
d3.csv("Updated_Exoplanet_Dataset_with_Adjusted_pl_bmassj.csv").then(data => {

    const xAttribute = "sy_dist"; // Hardcode the X-axis attribute
    const yAttribute = d3.select("#y-axis").property("value");

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

    console.log(sampledData)
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
        console.log(selectedAttributes);

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
let isInitialRender = true;

// Draw chart based on current dropdown selections
function drawChart() {
    
    const refPlanet = d3.select("#reference").property("value");
    const xAttribute = "sy_dist"; // Hardcode the X-axis attribute
    const yAttribute = d3.select("#y-axis").property("value");
    const colorAttribute = d3.select("#color").property("value");

    // Increase width and height for a larger plot area
    // Set up dimensions and margins
    const margin = { top: 20, right: 150, bottom: 60, left: 70 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear any existing SVG to redraw
    d3.select("#chart").selectAll("svg").remove();

    const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("opacity", 0) 
        .transition()
        .duration(500) 
        .style("opacity", 1) 
        .selection()
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add a clipping path to ensure elements don't overflow
    // svg.append("clipPath")
    // .attr("id", "clip")
    // .append("rect")
    // .attr("width", width)
    // .attr("height", height);
                
    const isContinuous = colorAttribute === "pl_eqt" || colorAttribute === "disc_year";
    const colorScale = isContinuous
        ? d3.scaleSequential(d3.interpolateCool).domain(d3.extent(sampledData, d => +d[colorAttribute]))
        : d3.scaleOrdinal(d3.schemeCategory10);
    // For ordinal scales, ensure all colorAttribute values are strings
    if (!isContinuous) {
        console.log("Unique values for ordinal scale:", [...new Set(sampledData.map(d => d[colorAttribute]))]);
    }

    
     // Filter out non-positive values for log scale attributes
     const isLogScale = ["pl_rade", "pl_bmasse", "pl_radj", "pl_bmassj"].includes(yAttribute);

     // Remove outliers from the data for the selected y-axis attribute
     const filteredData = removeOutliers(sampledData, yAttribute);

    const xMin = Math.max(1, d3.min(filteredData, d => +d[xAttribute])); // Avoid zero for log scale
    const xMax = d3.max(filteredData, d => +d[xAttribute]);
    const xScale = d3.scaleLog().domain([xMin, xMax]).range([0, width]);

    // X-Axis animation during initial rendering
    if (isInitialRender) {
        // Append and animate x-axis line
        svg.append("line")
            .attr("class", "x-axis-line")
            .attr("x1", 0)
            .attr("x2", 0) // Start at 0
            .attr("y1", height)
            .attr("y2", height)
            .style("stroke", "black")
            .style("stroke-width", 1.5)
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr("x2", width); // Animate to full width

        // Append x-axis ticks and labels after animation
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .style("opacity", 0) // Initially hide ticks
            .transition()
            .delay(500) // Match line animation delay
            .duration(500)
            .style("opacity", 1)
            .call(d3.axisBottom(xScale));
    } else {
        // Directly render the x-axis without animation
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));
    }
    isInitialRender = false;

    const xAxisLabelText = refPlanet === "Earth" 
    ? "Distance from Earth (parsecs)" 
    : "Distance from Jupiter (parsecs)";
    console.log(xAxisLabelText);

    // X-axis label
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text(xAxisLabelText);
    
   
    // Define y-scale with dynamic domain
    const yMin = isLogScale ? Math.max(0.1, d3.min(filteredData, d => +d[yAttribute])) : d3.min(filteredData, d => +d[yAttribute]);
    const yMax = d3.max(filteredData, d => +d[yAttribute]);
    const yScale = isLogScale
        ? d3.scaleLog().domain([yMin, yMax]).range([height, 0])
        : d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    // Append a y-axis line
    svg.append("line")
    .attr("class", "y-axis-line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", height)
    .attr("y2", height) // Start at the bottom for animation
    .style("stroke", "black")
    .style("stroke-width", 1.5)
    .transition() // Animate the line growth
    .duration(500)
    .ease(d3.easeCubicInOut)
    .attr("y2", 0); // Grow to full height

    // Add y-axis ticks and labels after the line animation
    svg.append("g")
    .attr("class", "y-axis")
    .style("opacity", 0) // Initially hide ticks
    .transition()
    .delay(500) // Delay to match the line animation
    .duration(500)
    .style("opacity", 1) // Fade in ticks
    .call(d3.axisLeft(yScale));


    // Y-axis label
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left+20)
        .text(d3.select("#y-axis option:checked").text());

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
    
    // Define Earth-like temperature thresholds
    const temperatureThresholds = {
        cooler: 350,
        similar: [250, 800],
        hotter: 801
    };

    // Map classification to colors
    const colorMapping = {
        cooler: "#1f77b4", // blue
        similar: "#ff7f0e", // orange
        hotter: "#d62728" // red
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

    // Adjust the color scale logic
    if (colorAttribute === "pl_eqt") {
        // Adjust the tooltip logic to include temperature classification
        svg.selectAll(".data-circle")
            .data(filtered_Data)
            .enter()
            .append("circle")
            .attr("class", "data-circle") 
            .attr("cx", d => xScale(d[xAttribute]))
            .attr("cy", d => yScale(d[yAttribute]))
            .attr("r", 5)
            .attr("fill", d => {
                const tempClass = classifyTemperature(+d[colorAttribute]);
                return tempClass ? colorMapping[tempClass] : "#ccc"; // Default gray for missing values
        })
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            const tempClass = classifyTemperature(+d[colorAttribute]); // Get the classification
            const tooltip = d3.select("#tooltip");
            tooltip.transition().duration(200).style("opacity", 1); // Smooth fade-in

            tooltip.style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px")
                .style("opacity", 1)
                .html(`
                    <strong>Planet:</strong> ${d.pl_name || "N/A"}<br>
                    <strong>Temperature:</strong> ${(+d[colorAttribute]).toFixed(2) || "N/A"} K<br>
                    <strong>Classification:</strong> ${tempClass ? tempClass.charAt(0).toUpperCase() + tempClass.slice(1) : "N/A"}<br>
                    <strong>Dist from Earth:</strong> ${(+d[xAttribute]).toFixed(2) || "N/A"} parsecs<br>
                    <strong>${yAttribute}:</strong> ${(+d[yAttribute]).toFixed(2) || "N/A"}
                `);
            // Highlight points with the same color
        // Hover logic
            svg.selectAll(".data-circle")
            .transition()
            .duration(100)
            .style("opacity", function (data) {
                // Ensure the data point exists and the colorAttribute is valid
                if (data && data[colorAttribute] !== undefined && data[colorAttribute] !== null) {
                    const hoverTempClass = classifyTemperature(+data[colorAttribute]); // Safely compute temp class
                    return hoverTempClass === tempClass ? 1 : 0.1; // Highlight matching, dim others
                }
            });

            
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 8)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
        })
        .on("mouseout", function () {
            d3.select("#tooltip")
                .style("opacity", 0);
            
            // Reset all points to full opacity
            svg.selectAll(".data-circle")
            .transition()
            .duration(100)
            .style("opacity", 1);
            
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 5)
                .attr("stroke", "none");
        });
        

    // Clear the previous legend
    d3.selectAll(".legend").remove();

    const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 20}, 50)`); // Adjust position
    
    Object.keys(colorMapping).forEach((key, i) => {
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", i * 20)
            .attr("r", 6)
            .style("fill", colorMapping[key]);
    
        legend.append("text")
            .attr("x", 15)
            .attr("y", i * 20+0.5)
            .text(key.charAt(0).toUpperCase() + key.slice(1)) // Capitalize category
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    });
    
} else {
       
    svg.selectAll(".data-circle")
    .data(filtered_Data)
    .enter()
    .append("circle")
    .attr("class", "data-circle") 
    .attr("cx", d => xScale(d[xAttribute]))
    .attr("cy", d => yScale(d[yAttribute]))
    .attr("r", 5)
    .attr("fill", d => {
        // Handle undefined or missing color values
        const colorValue = d[colorAttribute];
        return colorValue !== undefined && colorValue !== null ? colorScale(colorValue) : "#ccc"; // Default gray
    })
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
            const colorValue = d && d[colorAttribute] !== undefined ? d[colorAttribute] : null;
            if (colorValue === null) {
                console.warn("Missing or undefined colorAttribute:", d);
                return;
            }
        
            try {
                const selectedColor = colorScale(colorValue);
                console.log("Mapped color for value:", selectedColor);
        
                svg.selectAll(".data-circle")
                    .transition()
                    .duration(100)
                    .style("opacity", d => {
                        const value = d && d[colorAttribute] !== undefined ? d[colorAttribute] : null;
                        return value !== null && colorScale(value) === selectedColor ? 1 : 0.1;
                    });
        
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", 8)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
                
                const tooltip = d3.select("#tooltip");
        
                tooltip.style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 5 + "px")
                    .style("opacity", 1)
                    .html(generateTooltipContent(d, colorAttribute));
            } catch (error) {
                console.error("Error in hover logic:", error);
            }
        })
    .on("mouseout", function () {
        // Reset all circles to full opacity
        svg.selectAll(".data-circle")
            .transition()
            .duration(100)
            .style("opacity", 1);

        d3.select(this)
            .transition()
            .duration(100)
            .attr("r", 5)
            .attr("stroke", "none");

        // Hide tooltip
        d3.select("#tooltip").style("opacity", 0);
    });

        
    if (isContinuous) {
    // Add gradient color legend
    const legendHeight = 200;
    const legendWidth = 20;

    const legendSvg = svg.append("g")
        .attr("transform", `translate(${width + 30},${(height - legendHeight) / 2})`);

    const legendScale = d3.scaleLinear()
        .domain(d3.extent(sampledData, d => +d[colorAttribute]))
        .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(5)
        .tickFormat(d3.format(".0f"));

    // Create gradient for legend
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
        .call(legendAxis);

    legendSvg.append("text")
        .attr("class", "legend-title")
        .attr("x", legendWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(colorAttribute);
    }
    else{
        //  Add color legend
        const uniqueCategories = [...new Set(sampledData.map(d => d[colorAttribute]))];
        d3.selectAll(".legend").remove();
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 20}, 0)`); // Position the legend on the right

        uniqueCategories.forEach((category, i) => {
            legend.append("circle")
                .attr("cx", 0)
                .attr("cy", i * 20)
                .attr("r", 6)
                .attr("class", "legend-circle")
                .style("fill", colorScale(category));

            legend.append("text")
                .attr("x", 15)
                .attr("y", i * 20 + 5)
                .attr("class", "legend-text")
                .text(category)
                .style("font-size", "12px")
                .attr("alignment-baseline", "middle");
        });
    }
}

function generateTooltipContent(d, colorAttribute) {
    let additionalInfo = "";

    if (colorAttribute === "discoverymethod") {
        additionalInfo = `<strong>Discovery Method:</strong> ${d.discoverymethod || "N/A"}<br>`;
    } else if (colorAttribute === "disc_year") {
        additionalInfo = `<strong>Discovery Year:</strong> ${d.disc_year || "N/A"}<br>`;
    } else if (colorAttribute === "host_star_type") {
        additionalInfo = `<strong>Host Star Type:</strong> ${d.host_star_type || "N/A"}<br>`;
    } else {
        additionalInfo = `<strong>${colorAttribute}:</strong> ${d[colorAttribute] || "N/A"}<br>`;
    }

    return `
        <strong>Planet:</strong> ${d.pl_name || "N/A"}<br>            
       <strong>Temperature:</strong> ${d.pl_eqt !== undefined && d.pl_eqt !== null ? (+d.pl_eqt).toFixed(2) + " K" : "N/A"}<br>
 ${additionalInfo}
    `;
}

}
    // Initialize dropdowns and set event listeners
    d3.select("#reference").on("change", updateDropdowns);
    d3.select("#y-axis").on("change", drawChart);
    d3.select("#color").on("change", drawChart);

    updateDropdowns(); // Initialize with default values
});