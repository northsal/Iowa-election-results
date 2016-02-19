var width = 960,
    height = 500;

var legendRectSize = 18;                                  
var legendSpacing = 4; 

var results; 
var democrats = false;
var candidates;
var colors;

var projection = d3.geo.albersUsa()
    .scale(1200 * 5)
    .translate([width / 4, (height + height * 0.25) + 50]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);


//Build the initial map before user input     
update();

//Build map according to current dataset 
function buildMap() {
  //Loading map file 
  d3.json("/iowa.json", function(error, iowa) {
    if (error) throw error;

    svg.selectAll("path").remove();
 
    // this is appending the entire state svg defined in iowa.json
    svg.append("path")
      .datum(topojson.feature(iowa, iowa.objects.subunits))
      .attr("d", path);

    // goes through each country and draws each 
    svg.selectAll(".subunit")
      .data(topojson.feature(iowa, iowa.objects.subunits).features)
      .enter().append("path")
      .attr("class", function(d) { 
        var ctyResults = lookup(d.id);
        return ctyResults;
       })
      .attr("d", path)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
    });

    //build legend according to dataset
    var legend = svg.selectAll('.legend')                     
      .data(candidates)                                   
      .enter()                                                
      .append('g')                                                                           // NEW
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset =  height * candidates.length / 2;
        var horz = 2 * legendRectSize;
        var vert = (i * height - offset) + 350;

        return 'translate(' + horz + ',' + vert + ')';
      }); 

      legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .attr('class', 'legend')
        .style('fill', function(d, i) {
          return colors[i];
        })
        .style('stroke', function(d, i) {
          return colors[i];
        });

      legend.append('text')                                     
        .attr('x', legendRectSize + legendSpacing)              
        .attr('y', legendRectSize - legendSpacing) 
        .attr('class', 'legend')             
        .text(function(d) { return d; });

    //Add title according to dataset
    svg.append("text")
      .attr("x", 30)             
      .attr("y", 85)
      .attr("class", "title")  
      .text(function (d) {
        if(democrats == true) {
          return "Democrat Winner: Hillary Clinton";
        } else {
          return "Republican Winner: Ted Cruz";
        }
      });

    //Add title for visualization
    svg.append("text")
      .attr("x", 30)             
      .attr("y", 50)
      .attr("class", "title")  
      .text("2016 Iowa Caucus Results");
};

//Update to Democrat data based on user input
function initializeDem() {
  if(democrats == false) {
    update();
  }
}

//Update to Republican data based on user input
function initializeRep() {
  if(democrats == true) {
      update();
  }
}

//Update appropriate datasets before building new map
function update() {
  democrats = !democrats;
  //Reset legend and title for new data
  svg.selectAll('.legend').remove();
  svg.selectAll('.title').remove();
  //Initialize with democratic data 
  if(democrats == true) {
    candidates = ['Hillary Clinton', 'Bernie Sanders'];
    colors = ['#a6bddb', '#a1d99b'];
    d3.csv("IowaDem3.csv", function(error, d) {
      results = d;  
      buildMap();  
    }); 
  //Initialize with republican data
  } else {
    candidates = ['Donald Trump', 'Ted Cruz', 'Marco Rubio'];
    colors = ['#1b9e77', '#d95f02', '#7570b3'];
    d3.csv("IowaRep.csv", function(error, d) {
      results = d; 
      buildMap(); 
    });
  }
};

//Looks for county information and reutrn appropriate CSS class
function lookup(county) {
  var target;
  for(i=0; i <results.length; i++) {
    if(county === (results[i].County)) {
      target = results[i];
    }
  }

  if(target.Candidate === "Hillary Clinton") {
    return "subunit county-boundary hill";
  } else if (target.Candidate === "Bernie Sanders"){
    return "subunit county-boundary bern";
  } else if (target.Candidate === "Donald Trump") {
    return "subunit county-boundary trump";
  } else if (target.Candidate === "Ted Cruz") {
    return "subunit county-boundary cruz";
  } else if (target.Candidate === "Marco Rubio") {
    return "subunit county-boundary rubio";
  }
};


function handleMouseOver(d, i) {
  //Highlight county
  d3.select(this).attr("class", "county-boundary-active");

  var ctyInfo;

  for(i=0; i <results.length; i++) {
    if(d.id === (results[i].County)) {
      ctyInfo = results[i];
    }
  }

  //Update tooltip
  setToolTip(ctyInfo, d.id);

};

//Move the tooltip to the current mouse position and update info
function setToolTip(d, cty) {
  var xPosition = d3.event.pageX;
  var yPosition = d3.event.pageY;

  /*Update tooltip template with democrat data 
    if democrats are currently selected. */
  if(democrats == true) {

    var tooltip = d3.select('#demtooltip');

    tooltip.style("left", xPosition + "px")
      .style("top", yPosition + "px");

    tooltip.select("#county")
      .text(cty + ' County');

    tooltip.select("#winner")
      .text(d.Candidate);

    tooltip.select("#hillary")
      .text(d.Hpercent);

    tooltip.select("#bernie")
      .text(d.Bpercent);

    tooltip.classed("hidden", false);
  /*Update tooltip template with republican data 
    if democrats are currently selected. */  
  } else {
    var tooltip = d3.select("#reptooltip");
    
    tooltip.style("left", xPosition + "px")
      .style("top", yPosition + "px");
  
    tooltip.select("#county")
      .text(cty + ' County');

    tooltip.select("#winner")
      .text(d.Candidate);

    tooltip.select("#donald")
      .text(d.DonaldTrump);
    
    tooltip.select("#ted")
      .text(d.TedCruz);

    tooltip.select("#marco")
      .text(d.MarcoRubio);

    tooltip.select("#ben")
      .text(d.BenCarson);  

    tooltip.classed("hidden", false);
  }  
}

function handleMouseOut(d) {
  var normal = lookup(d.id);
  d3.select(this).attr("class", normal);
  //hide tooltip
  if(democrats == true) {
    d3.select("#demtooltip").classed("hidden", true);
  } else {
    d3.select("#reptooltip").classed("hidden", true);
  }
};

d3.select(self.frameElement).style("height", height + "px");