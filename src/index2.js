import * as d3 from "https://cdn.skypack.dev/d3@7";

window.addEventListener('load', () => {
    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(response => response.json())
    .then(data => buildMap(data))
});

function buildMap(data) {
    const svgHeight = 600;
    const svgWidth = 1100;
    const padding = 35;

    const svgContainer = d3.select('#heat-map')
    .append('svg')
    .attr('height', svgHeight + padding * 2)
    .attr('width', svgWidth + padding * 4);

    
    function createScales() {
        const dataYear = data.monthlyVariance.map(item => item.year);
        const dataMonth = data.monthlyVariance.map(item => item.month -= 1);

        // Eixo X - Anos 1759 - 2009
        const xMinVal = d3.min(dataYear);
        const xMaxVal = d3.max(dataYear);

        const xAxisScale = d3.scaleLinear()
        .range([padding, svgWidth])
        .domain([xMinVal, xMaxVal]);

        const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.format('d'));
        svgContainer.append('g')
        .attr('transform', `translate(${padding}, ${svgHeight})`)
        .call(xAxis)
        .attr('id', 'x-axis');

        // Eixo Y - Meses Jan - Dez
        const yAxisScale = d3.scaleBand()
        .range([0, svgHeight])
        .domain([...dataMonth].splice(0, 12));

        const yAxis = d3.axisLeft(yAxisScale)
        .tickValues(yAxisScale.domain())
        .tickFormat((month) => {
            let date = new Date(0, month);
            let format = d3.timeFormat('%B');
            return format(date);
        });

        svgContainer.append('g')
        .attr('transform', `translate(${padding * 2}, 0)`)
        .call(yAxis)
        .attr('id', 'y-axis');


        function buildCells() {
            const dataColors = [
                ['rgb(163, 26, 1)', 11.7],
                ['rgb(224, 92, 40)', 10.6],
                ['rgb(255, 190, 68)', 9.5],
                ['rgb(255, 219, 118)', 8.3],
                ['rgb(255, 241, 160)', 7.2],
                ['rgb(153, 218, 255)', 6.1],
                ['rgb(96, 182, 231)', 5.0],
                ['rgb(32, 152, 221)', 3.9],
                ['rgb(0, 140, 220)', 2.8]
            ];
            const dataset = data.monthlyVariance.map(
                obj => Object.assign({
                    temp: data.baseTemperature + (obj.variance)
                }, obj)
            );

            const define = {
                color: (temp) => {
                    for(let i = 0; i< dataColors.length; i++) {
                        if (temp >= dataColors[i][1]) {
                            return dataColors[i][0];
                        }
                    }
                    return dataColors[8][0];
                }
            }

            const tip = d3.select('#heat-map')
            .attr('class', 'd3-tip')
            .attr('id', 'tooltip');

            svgContainer.selectAll('rect')
            .data(dataset)
            .enter()
            .append('rect')

            .attr('class', 'cell')
            .attr('data-month', (d, i) => dataMonth[i])
            .attr('data-year', (d, i) => dataYear[i])
            .attr('data-temp', (d) => d.temp)
            .attr('fill', (d) => define.color(d.temp))

            .attr('width', 8)
            .attr('height', 49)
            .attr('x', (d, i) => xAxisScale(dataYear[i]))
            .attr('y', (d, i) => yAxisScale(dataMonth[i]))
            .attr('transform', `translate(${padding}, 0)`)
            
            .on('mouseover', (e, d) => {
                let index = dataset.findIndex(obj => obj === d);
                console.log(dataYear[index], dataMonth[index])

                tip.style('visibility', 'visible')
                .attr('data-year', dataYear[index])
                .attr('x', dataYear[index])
                .attr('y', dataMonth[index])
                .html(`${d.temp}º Celsius`)
                .style('transform', `translate(${svgHeight / 2}, ${svgWidth})`)
            })
            .on('mouseout', () => tooltip.style('visibility', 'hidden'));


            function buildLegend() {

                const legPlaceHolder = svgContainer.append('g')
                .attr('width', 250)
                .attr('id', 'legend');

                const legend = legPlaceHolder.selectAll('#legend')
                .data(dataColors)
                .enter()
                .append('g')
                .attr('transform', (d, i) => `translate(${svgWidth / (padding + 8) * i}, 0)`)

                legend.append('rect')
                .attr('x', padding * 1.35)
                .attr('y', svgHeight + 25)
                .attr('width', 25)
                .attr('height', 25)
                .attr('fill', (d, i) => d[0])

                const xLegend = d3.scaleBand()
                .range([0, 255])
                .domain([['', 12.8], ...dataColors].map(item => item[1]));

                const axis = d3.axisBottom(xLegend);
                legPlaceHolder.append('g')
                .attr('transform', `translate(${padding}, ${svgHeight + padding + 15})`)
                .call(axis);
            }
            buildLegend();
        }
        buildCells();
    }
    createScales();
}