//This wasn't working because of cross origin resource sharing restictions imposed by chrome
//
//$.getJSON("static/json.txt",function(data) {


//I added two additional sales to the data, just to better illustrate the features of my
//data representation, which are as follows:
//
//  This graph has 2 'modes': The default mode is a line plot with rental prices against
//  a backdrop of different ownerships. If you click on the background divisions, you will
//  be taken to the 2nd mode, which is just the reverse of the default mode. In other words,
//  there will be a line plot of the sales against a background of rent history. The slight
//  difference is that the 2nd mode is a scatter plot rather than a line chart becase sales are
//  much more sparse, meaning that the value of having lines, which is seeing trends, isn't really
//  applicable in this scenario. I chose this line chart-background division design because the pricing 
//  of rents and sales are vastly differnt, so it wouldn't really make sense to graph the data on the 
//  same set of axes. 
//
//  I was initally considering having 2 y-axes, that were scaled differently, and just having two 
//  separate line plots.
//  
//  I discarded this idea because of the scaling problems it would present on the x-axis.
//  The amount of time between sales in this data set dwarfs the time between the rentals,
//  and I didn't want to impose the larger time scaling on the rent data. Given more
//  time, I might've given it a shot with an added zoom feature so the data was more viewable.
//
//  Other details such as color and number representations I just chose because of aethstetic
//  appeal.
//
//
var data = [
    {
        "date" : "February 15, 2014",
        "price": 2100.00,
        "sale_rental": "R"
    },
    {
        "date" : "February 13, 2014",
        "price": 2050.00,
        "sale_rental": "R"
    },
    {
        "date" : "January 22, 2014",
        "price": 2100.00,
        "sale_rental": "R"
    },
    {
        "date" : "November 13, 2013",
        "price": 2300.00,
        "sale_rental": "R"
    },
    {
        "date" : "October 11, 2013",
        "price": 2450.00,
        "sale_rental": "R"
    },
    {
        "date" : "October 08, 2013",
        "price": 2400.00,
        "sale_rental": "R"
    },
    {
        "date" : "September 05, 2013",
        "price": 2600.00,
        "sale_rental": "R"
    },
    {
        "date" : "March 15, 2010",
        "price": 265000.00,
        "sale_rental": "S"
    },
    {
        "date" : "December 02, 2013",
        "price" : 300000.00,
        "sale_rental": "S"
    },
    {
        "date": "January 10, 2014",
        "price": 175000.00,
        "sale_rental": "S"
    },
] 

  //Sorting data by date
  function compare(a, b) {
    return Date.parse(a.date) - Date.parse(b.date);
  }
  data.sort(compare);
  
  /* --- Globals --- */
  //There are two modes: R for rental, and S for sale
  var rent_or_sale = "R";
  
    //Creating an array of sales and rents, and resetting the dates of each element
    //to range from 0 to the most recent date - earliest date
    var saleArray = [];
    var rentArray = [];
    
   //Separating the data into sales and rents.     
    data.forEach(function(d) {
      //To maintain the date's old form
      d.prettyDate = d.date;
      d.date = Date.parse(d.date);
      if(d.sale_rental == "R") {
        rentArray.push(d);
      } else {
        saleArray.push(d);
      }
    });
    
    setEndDates(rentArray);
    setEndDates(saleArray);
    
    //This adds an enddates field to each entry, which are used when creating background
    //divisions

    function setEndDates(dataArray) {
      for(var i = 0; i < dataArray.length - 1; i++) {
        dataArray[i].endDate = dataArray[i+1].date;
        //kind of hacky, I added an index field so later when I'm making background divisions,
        //I can get the index of each element as it's selected, and set the color.
        dataArray[i].index = i;
      }
      dataArray[dataArray.length - 1].endDate = data[data.length - 1].date;
      //same here
      dataArray[dataArray.length - 1].index = i;
    }

  //Graph is initially drawn, and will be redrawn given changes in screen size
  drawGraph(rent_or_sale);
  window.onresize = function() {
    drawGraph(rent_or_sale); 
  }
  
  //This function is purely responsible for plotting the data from the preprocessed
  //global variable data
  function drawGraph(mode) {
    d3.select("svg").remove();
    //Title of graph
    var title = (mode == "R") ? "Rentals" : "Sales";
    //Drawing Axes, margins, etc. Some magic numbers here, but time was of the essence
    var margin = {top: 50, 
                  right: 50, 
                  bottom: 30, 
                  left: 150},
        width = window.innerWidth*0.75 - margin.left - margin.right,
        height = window.innerHeight*.85 - margin.top - margin.bottom,
        x = d3.time.scale().range([0, width]),
        y = d3.scale.linear().range([height, 0]),
        formatPrice = d3.format(".2s")
        xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(6),
        yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(formatPrice);
    //The x variable for a line is the date, and the y variable is the rental price
    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.price); });
    
    //Adding the svg DOM object
    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    if(mode == "R") {  
      var maxRent = d3.max(rentArray, function(d) { return d.price; });
      var minRent = d3.min(rentArray, function(d) { return d.price; });
      //This scaling makes sense because while the dates should range from
      //the earliest to the latest dates on the x-axis, there should be
      //some space between the lowest rental price and the bottom of the axis  
      x.domain(d3.extent(rentArray, function(d) { return d.date; }));
      y.domain([.6*minRent , maxRent]);
    } else {
      var maxSale = d3.max(saleArray, function(d) { return d.price; });
      var minSale = d3.min(saleArray, function(d) { return d.price; });
      //Sales, on the otherhand, should have the full range of all dates and rents
      //because ownership spans over the entire apartment history. The y-axis is 
      //scaled the same way as it was above
      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain([.6*minSale, maxSale]);
    }
    
    //Actually drawing the axes and graph here
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -height/2)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .style("font-family", "Impact")
        .text(title + " Price ($)");

    svg.append("text")
      .attr("x", width/2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "30px")
      .style("font-family", "trebuchet ms")
      .text(title);
    //Creating the tooltip for the backgrounds
    
    var priceFormat = d3.format(",");
    var tooltip = d3.tip()
      .attr("class", "tooltip")
      .offset([-10, 0])
      .html(function(d) {
        if(d.sale_rental == "R") {
          return "<span style=color:white;font-family:tahoma;>Rented for $" + priceFormat(d.price) + " on " + d.prettyDate + "</span>";
        } else return "<span style=color:white;font-family:tahoma;>Sold for $" + priceFormat(d.price) + " on " + d.prettyDate + "</span>";
      });
        
      svg.call(tooltip);

    if(mode == "R") {
      drawBackgroundDivisions(saleArray);
      drawPointsAndLine(rentArray);
    } else {
      drawBackgroundDivisions(rentArray);
      drawPointsAndLine(saleArray);
    }
    
    //This will draw the background divisions to provide a backdrop of changing ownership
    //over the graph of rent values, or the backdrop of changing tenants over the graph of
    //sales values.

    function drawBackgroundDivisions(dataArray) {
      svg.selectAll("rect")
        .data(dataArray).enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { 
          if(x(d.date) < 0) return 0;
          return x(d.date); 
        })
        .attr("y", 0)
        .attr("height", height) 
        .style("fill", function(d) {
          if(d.index % 2 == 0) return "green";
          if(d.index % 2 == 1) return "orange";
        })
        .attr("width", function(d) { 
          if(x(d.date) < 0) return x(d.endDate); 
          return x(d.endDate) - x(d.date);  
        }) 
        .style("opacity", "0.4")
        .on("mouseover", tooltip.show)
        .on("mouseout", tooltip.hide)
        .on("click", function(d) {
          //If the background divisions are clicked, the mode is changed
          rent_or_sale = (d.sale_rental == "R") ? "R" : "S";
          drawGraph(rent_or_sale);
        });
    }

    function drawPointsAndLine(dataArray) {
      svg.append("path")
        .datum(dataArray)
        .attr("class", "line")
        .attr("class", title)
        .attr("d", line);
      
      svg.selectAll(".dot")
        .data(dataArray).enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.price); })
        .on("mouseover", tooltip.show)
        .on("mouseout", tooltip.hide);
    }
  }
//});
