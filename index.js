//read data from csv file
const pathToCsv = 'average-rating.csv';

//define the height and width of canvas
const canvasWidth = 1000;
const canvasHeight = 600;

//select canvas and append svg
const svg = d3.select('#canvas')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);

//sdefine margin and set height and width for graph    
const margin = { top: 50, right: 80, bottom: 50, left: 80 },
    graphWidth = canvasWidth - margin.right - margin.left,
    graphHeight = canvasHeight - margin.bottom - margin.top;

//append graph to canvas
const graph = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

d3.csv(pathToCsv, (data) => {

    //refine data remove floating points
    data = data.map(d => {
        return {
            year: d.year,
            average_rating: Math.floor(d.average_rating),
            users_rated: parseInt(d.users_rated)
        }
    })

    //fetch total rating limit
    const rating = [0, ...new Set(data.map(d => d.average_rating))].sort()

    // nest function allows to graph the calculation per level of a factor
    let sumstat = d3.nest()
        .key(d => d.year)
        .entries(data);

    //calculate count of rating
    sumstat = sumstat.map(d => {
        return {
            key: d.key,
            values: rating.map(r => {
                return {
                    average_rating: r,
                    count: d.values.filter(f => f.average_rating == r).length,
                    key: d.key
                }
            })
        }
    })

    //sort the data with keys
    sumstat.sort((a, b) => a.key - b.key)

    //calculate max count for y axis
    let arr = [];
    sumstat.forEach(s => {
        arr = [...arr, ...s.values]
    })
    const max_count = Math.max(...arr.map(c => c.count));


    //set linear scale for x-axis
    const x = d3.scaleLinear()
        .domain(d3.extent(rating, d => d))
        .range([0, graphWidth]);

    //set linear scale for y-axis
    const y = d3.scaleLinear()
        .domain([0, max_count])
        .range([graphHeight, 0])

    graph.append('g')
        .call(d3.axisLeft(y).ticks(10));

    graph.append('g')
        .attr('transform', `translate(0, ${graphHeight})`)
        .call(d3.axisBottom(x).ticks(4));

    ////create scale for color with respect with year
    const years = sumstat.map(k => k.key);
    var color = d3.scaleOrdinal()
        .domain(years)
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999', '#EEE2AD'])

    //set line for each year
    graph.selectAll('.line')
        .data(sumstat)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', d => color(d.key))
        .attr('stroke-width', 1.5)
        .attr('d', (data) => {
            return d3.line()
                .x(d => x(d.average_rating))
                .y(d => y(d.count))
                (data.values)
        })

    //set dots for each line
    graph.selectAll("g.dot")
        .data(sumstat)
        .enter().append("g")
        .attr("class", "dot")
        .selectAll("circle")
        .data(d => d.values)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", d => x(d.average_rating))
        .attr("cy", d => y(d.count))
        .attr('fill', d => color(d.key))

    // Add the x Axis
    graph.append('g')
        .attr('transform', 'translate(0,' + graphHeight + ')')
        .call(d3.axisBottom(x));

    // text label for the x axis
    graph.append('text')
        .attr('transform',
            'translate(450,540)')
        .style('text-anchor', 'middle')
        .text('Rating');

    // Add the y Axis
    graph.append('g')
        .call(d3.axisLeft(y));

    // text label for the y axis
    graph.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -60)
        .attr('x', 0 - (graphHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Count');

    // Add one dot in the legend for each name.
    graph.selectAll("mydots")
        .data(sumstat)
        .enter()
        .append("circle")
        .attr("cx", graphWidth - margin.right)
        .attr("cy", (d, i) => 50 + i * 25) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", d => color(d.key))

    // Add one dot in the legend for each name.
    graph.selectAll("mylabels")
        .data(sumstat)
        .enter()
        .append("text")
        .attr("x", graphWidth - margin.right + 20)
        .attr("y", (d, i) => 50 + i * 25) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => color(d.key))
        .text(d => d.key)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

})