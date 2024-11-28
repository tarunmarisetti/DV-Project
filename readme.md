# Number of people using the Internet - Data package

This data package contains the data that powers the chart ["Number of people using the Internet"](https://ourworldindata.org/grapher/number-of-internet-users?v=1&csvType=full&useColumnShortNames=false) on the Our World in Data website. It was downloaded on November 22, 2024.

## CSV Structure

The high level structure of the CSV file is that each row is an observation for an entity (usually a country or region) and a timepoint (usually a year).

The first two columns in the CSV file are "Entity" and "Code". "Entity" is the name of the entity (e.g. "United States"). "Code" is the OWID internal entity code that we use if the entity is a country or region. For normal countries, this is the same as the [iso alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) code of the entity (e.g. "USA") - for non-standard countries like historical countries these are custom codes.

The third column is either "Year" or "Day". If the data is annual, this is "Year" and contains only the year as an integer. If the column is "Day", the column contains a date string in the form "YYYY-MM-DD".

The final column is the data column, which is the time series that powers the chart. If the CSV data is downloaded using the "full data" option, then the column corresponds to the time series below. If the CSV data is downloaded using the "only selected data visible in the chart" option then the data column is transformed depending on the chart type and thus the association with the time series might not be as straightforward.

## Metadata.json structure

The .metadata.json file contains metadata about the data package. The "charts" key contains information to recreate the chart, like the title, subtitle etc.. The "columns" key contains information about each of the columns in the csv, like the unit, timespan covered, citation for the data etc..

## About the data

Our World in Data is almost never the original producer of the data - almost all of the data we use has been compiled by others. If you want to re-use data, it is your responsibility to ensure that you adhere to the sources' license and to credit them correctly. Please note that a single time series may have more than one source - e.g. when we stich together data from different time periods by different producers or when we calculate per capita metrics using population data from a second source.

## Detailed information about the data


## Number of Internet users
The number of internet users is calculated by Our World in Data based on internet access figures as a share of the total population, published in the World Bank, World Development Indicators and total population figures from the UN World Population Prospects, Gapminder and HYDE.

Internet users are individuals who have used the Internet (from any location) in the last 3 months. The Internet can be used via a computer, mobile phone, personal digital assistant, games machine, digital TV etc.

Limitations and exceptions: Operators have traditionally been the main source of telecommunications data, so information on subscriptions has been widely available for most countries. This gives a general idea of access, but a more precise measure is the penetration rate - the share of households with access to telecommunications. During the past few years more information on information and communication technology use has become available from household and business surveys. Also important are data on actual use of telecommunications services. Ideally, statistics on telecommunications (and other information and communications technologies) should be compiled for all three measures: subscriptions, access, and use. The quality of data varies among reporting countries as a result of differences in regulations covering data provision and availability.

Discrepancies may also arise in cases where the end of a fiscal year differs from that used by ITU, which is the end of December of every year. A number of countries have fiscal years that end in March or June of every year.

Statistical concept and methodology: The Internet is a world-wide public computer network. It provides access to a number of communication services including the World Wide Web and carries email, news, entertainment and data files, irrespective of the device used (not assumed to be only via a computer - it may also be by mobile phone, PDA, games machine, digital TV etc.). Access can be via a fixed or mobile network. For additional/latest information on sources and country notes, please also refer to: https://www.itu.int/en/ITU-D/Statistics/Pages/stat/default.aspx
Date range: 1990–2020  
Unit: users  


### How to cite this data

#### In-line citation
If you have limited space (e.g. in data visualizations), you can use this abbreviated in-line citation:  
International Telecommunication Union (via World Bank); Gapminder (2019); UN (2022); HYDE (2017); Gapminder (Systema Globalis) – processed by Our World in Data

#### Full citation
International Telecommunication Union (via World Bank); Gapminder (2019); UN (2022); HYDE (2017); Gapminder (Systema Globalis) – processed by Our World in Data. “Number of Internet users” [dataset]. International Telecommunication Union (via World Bank); Gapminder (2019); UN (2022); HYDE (2017); Gapminder (Systema Globalis) [original data].
Source: International Telecommunication Union (via World Bank); Gapminder (2019); UN (2022); HYDE (2017); Gapminder (Systema Globalis) – processed by Our World In Data

### What you should know about this data

### Additional information about this data
Key user statistics related to Internet (e.g. number of individuals using the Internet).


    