//$.getJSON("static/json.txt",function(result) {
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
    }
] 

  //Sorting data by date
  function compare(a, b) {
    return Date.parse(a.date) - Date.parse(b.date);
  }
  data.sort(compare);
  
  /* --- Globals --- */
  //There are two modes: R for rental, and S for sale
  var mode = "R";
  //The date of the earliest transaction
  var dataBegin = Date.parse(data[0].date);
  //Under the assumption that a sale is the first event, this is the first rent
  //transaction
  var firstRent = -1;
  data.forEach(function(d) {
    if(d.sale_rental == "R" && (firstRent == -1 || Date.parse(d.date) < firstRent)) {
      firstRent = Date.parse(d.date);
    }
  });

    //Creating an array of sales and rents, and resetting the dates of each element
    //to range from 0 to the most recent date - earliest date
    var saleArray = [];
    var rentArray = [];
    
    //Representing what the last rent and sale dates were, for the purpose of setting the
    //span field of each transaction element
    var lastRent = 0;
    var lastSale = 0;

    
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
  //Graph is initially drawn, and will be redrawn given changes in screen size, or mode
  drawGraph(mode);
  //Adapt to changing screen size
  window.onresize = function() {
    drawGraph(mode); 
  }

  function drawGraph(mode) {
    d3.select("svg").remove();
    var title = (mode == "R") ? "Rentals" : "Sales";
    $("#toggle").text(title);
    //Drawing Axes
    var margin = {top: 50, right: 20, bottom: 30, left: 80},
        width = window.innerWidth*0.6 - margin.left - margin.right,
        height = window.innerHeight*.85 - margin.top - margin.bottom,
        x = d3.time.scale().range([0, width]),
        y = d3.scale.linear().range([height, 0]),
        xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left");
    //The x variable for a line is the date, and the y variable is the rental price
    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.price); });
    //var bargraph --- this will be for the sales mode
    
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
        .text("Price ($)");

    //Creating the tooltip for the backgrounds

    var tooltip = d3.tip()
      .attr("class", "tooltip")
      .offset([-10, 0])
      .html(function(d) {
        if(d.sale_rental == "R") {
          return "<span style=color:white>Rented for $" + d.price + " on " + d.prettyDate + "</span>";
        } else return "<span style=color:white>Sold for $" + d.price + " on " + d.prettyDate + "</span>";
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
        //.attr("id"
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
          mode = (d.sale_rental == "R") ? "R" : "S";
          drawGraph(mode);
        });
    }

    function drawPointsAndLine(dataArray) {
      svg.append("path")
        .datum(dataArray)
        .attr("class", "line")
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
