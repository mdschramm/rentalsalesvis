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
    }
] 
  
  function compare(a, b) {
    return Date.parse(a.date) - Date.parse(b.date);
  }
  
  data.sort(compare);

  $.each(data, function() {
    console.log(this.date);
  });
//});
