
var height, offSetX, offSetY, pi, render, timescale, vis, width, freq, fps;

freq = 1; // "Larmor" frequency :)

timescale = d3.scaleLinear().domain([0, 1000 / freq]).range([0, 2 * Math.PI]);

var startTime = new Date();
function time() {
  var currentTime, tdiff;
  currentTime = new Date();
  tdiff = currentTime.getTime() - startTime.getTime();
  return tdiff;
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

width = 900;
height = 400;
spacing = 20;
fps = 30;

grad_scale = 2;

var quantize = d3.scaleQuantile().domain([-1, 1]).range(d3.range(11));
function color(val) {
  return "q"+quantize(val)+"-11";
}

var quantize_total = d3.scaleQuantile().domain([1, 4]).range(d3.range(9));
function color_total(val) {
  return "q"+quantize_total(val)+"-9";
}

var numrows=20, numcols=20;
var kmax = 5000; // ?

// Load proton density image
// var pdimg = new Image();
// pdimg.src = 'brain.png';
// var context = document.getElementById('canvas').getContext('2d');
// pdimg.onload = function () {context.drawImage(this, 0, 0)};
// function getpd(x, y) {
//   return context.getImageData(x, y, 1, 1).data;
// }
var pdarr = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 2, 32, 44, 41, 32, 5, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 16, 76, 78, 63, 49, 69, 90, 33, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 5, 66, 43, 20, 30, 20, 5, 35, 91, 27, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 45, 39, 15, 45, 54, 47, 48, 13, 30, 69, 0, 0, 0, 0, 0], [0, 0, 0, 0, 25, 44, 19, 56, 64, 58, 30, 53, 54, 14, 48, 33, 0, 0, 0, 0], [0, 0, 0, 0, 44, 37, 24, 47, 80, 40, 25, 61, 67, 42, 36, 37, 0, 0, 0, 0], [0, 0, 0, 21, 54, 11, 43, 62, 74, 42, 38, 68, 72, 51, 28, 38, 0, 0, 0, 0], [0, 0, 0, 43, 51, 27, 48, 70, 74, 47, 35, 69, 67, 34, 21, 50, 5, 0, 0, 0], [0, 0, 0, 51, 37, 42, 55, 66, 67, 36, 39, 70, 61, 41, 22, 55, 17, 0, 0, 0], [0, 0, 0, 49, 46, 38, 48, 63, 62, 36, 54, 70, 60, 55, 30, 59, 26, 0, 0, 0], [0, 0, 0, 53, 52, 3, 47, 68, 51, 22, 53, 68, 57, 48, 24, 61, 16, 0, 0, 0], [0, 0, 0, 37, 75, 0, 43, 71, 43, 32, 54, 65, 46, 20, 31, 69, 0, 0, 0, 0], [0, 0, 0, 0, 93, 70, 7, 43, 43, 49, 51, 52, 20, 0, 86, 51, 0, 0, 0, 0], [0, 0, 0, 0, 18, 100, 60, 26, 36, 58, 50, 15, 19, 87, 86, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 5, 58, 68, 64, 67, 66, 59, 72, 69, 2, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 7, 14, 19, 31, 33, 12, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
function getpd(x, y) {
  return Math.min(pdarr[y][x] + (Math.random() * 0), 100);
}

vis = d3.selectAll(".chart").append("svg:svg").attr("width", width).attr("height", height);
var imagespace = vis.append("g").attr("class", "RdBu");
var littlearc = d3.arc().innerRadius(0)
  .outerRadius(function(d){return d.pd / 100 * spacing * 0.75})
  .startAngle(function(d){return d.ang})
  .endAngle(function(d){return d.ang});

function makeclock(offset, width) {
  var clockGroup = imagespace.append("svg:g").attr("transform", "translate("+ offset.x + "," + offset.y + ")");
  clockGroup.append("svg:rect").attr("x", -spacing/2).attr("y", -spacing/2).attr("width", spacing).attr("height", spacing).attr("class", "bg").attr("stroke", "none");
  clockGroup.append("svg:circle").attr("r", width).attr("fill", "black").attr("class", "clock innercircle");
  clockGroup.append("svg:path").attr("d", "z").attr("class", "clockhand").attr("stroke", "black").attr("stroke-width", width).attr("fill", "none");
  return clockGroup;
}

var clockGroups = [];
var row, col;
for (row=0; row<numrows; row++) {
  for (col=0; col<numcols; col++) {
    var offset = {x:col * spacing, y:row * spacing};
    clockGroup = makeclock(offset, 1);
    clockGroup.x = col / numcols;
    clockGroup.y = row / numrows;
    clockGroup.pd = getpd(col, row);
    clockGroup.phase = 0;
    clockGroups.push(clockGroup);

  }
}

var bigarc = d3.arc().innerRadius(0)
  .outerRadius(function(d){return d.len})
  .startAngle(function(d){return d.ang})
  .endAngle(function(d){return d.ang});

var sumclock = makeclock({x:500, y:height/2}, 3);
sumclock.append("svg:circle").attr("r", 5 * spacing * 0.75).attr("fill", "none").attr("class", "clock outercircle").attr("stroke", "black").attr("stroke-width", 2);
sumclock.selectAll(".bg").remove();

var kspace_svg = vis.append("g").attr("width", 300).attr("height", 300).attr("transform", "translate(599,50)").append("g");
var kspace_x = d3.scaleLinear().domain([-kmax, kmax]).range([0, 300]);
kspace_svg.append("g").attr("transform", "translate(0,300)").attr("class", "hidden").call(d3.axisBottom(kspace_x));

var kspace_y = d3.scaleLinear().domain([-kmax, kmax]).range([300, 0]);
kspace_svg.append("g").call(d3.axisLeft(kspace_y)).attr("class", "hidden");

var kspace_xgrid = d3.axisBottom(kspace_x).tickSize(-300).tickFormat('').ticks(10);
var kspace_ygrid = d3.axisLeft(kspace_y).tickSize(-300).tickFormat('').ticks(10);

kspace_svg.append("g").attr("class", "x axis-grid").attr("transform", "translate(0,300)").call(kspace_xgrid);
kspace_svg.append("g").attr("class", "y axis-grid").call(kspace_ygrid);

var kspace_dots_g = kspace_svg.append("g").attr("class", "Reds");

kspace_dots_g.append("circle").attr("cx", kspace_x(0)).attr("cy", kspace_y(0)).attr("r", 2).style("fill", "red");

var vcursor = kspace_dots_g.append("line").attr("x1", kspace_x(0)).attr("x2", kspace_x(0)).attr("y1", kspace_y(-kmax)).attr("y2", kspace_y(kmax)).style("stroke", "black");
var hcursor = kspace_dots_g.append("line").attr("x1", kspace_x(-kmax)).attr("x2", kspace_x(kmax)).attr("y1", kspace_y(0)).attr("y2", kspace_y(0)).style("stroke", "black");

var gradients = {x:0, y:0};
var gradient_labels_x = vis.append("g");
var gradient_labels_y = vis.append("g");
var kspace = {x:0, y:0};

function xgradient(x) {
  gradients.x = grad_scale*x;
  gradient_labels_x.selectAll("*").remove();
  if (gradients.x < 0) {
    gradient_labels_x.append("text").attr("transform", "translate(24,250) rotate(-90)").text("faster").attr("style", "font:italic 24px serif").attr("fill", "green");
    gradient_labels_x.append("text").attr("transform", "translate(380,250) rotate(-90)").text("slower").attr("style", "font:italic 24px serif").attr("fill", "red");
  }
  else if (gradients.x > 0) {
    gradient_labels_x.append("text").attr("transform", "translate(380,250) rotate(-90)").text("faster").attr("style", "font:italic 24px serif").attr("fill", "green");
    gradient_labels_x.append("text").attr("transform", "translate(24,250) rotate(-90)").text("slower").attr("style", "font:italic 24px serif").attr("fill", "red");
  }
}

function ygradient(y) {
  gradients.y = grad_scale*y;
  gradient_labels_y.selectAll("*").remove();
  if (gradients.y < 0) {
    gradient_labels_y.append("text").attr("transform", "translate(165,20)").text("faster").attr("style", "font:italic 24px serif").attr("fill", "green");
    gradient_labels_y.append("text").attr("transform", "translate(165,380)").text("slower").attr("style", "font:italic 24px serif").attr("fill", "red");
  }
  else if (gradients.y > 0) {
    gradient_labels_y.append("text").attr("transform", "translate(165,380)").text("faster").attr("style", "font:italic 24px serif").attr("fill", "green");
    gradient_labels_y.append("text").attr("transform", "translate(165,20)").text("slower").attr("style", "font:italic 24px serif").attr("fill", "red");
  }
}

// var kqscale = 5;
// var kquant = d3.scaleQuantile().domain([-kmax,kmax]).range(d3.range(-kmax/kqscale,kmax/kqscale));

var current_field = 1;
var decay = 1.0;

function render(data) {
  var vecsum = [0, 0];
  current_field *= decay;
  clockGroups.forEach(function (cg) {
    cg.phase += cg.x * gradients.x;
    cg.phase += cg.y * gradients.y;
    var angle = timescale(data + cg.phase);
    var c = Math.cos(angle), s = Math.sin(angle);
    vecsum[0] += c * cg.pd / 20 * current_field;
    vecsum[1] += s * cg.pd / 20 * current_field;
    cg.selectAll(".clockhand")
      .attr("d", littlearc({pd:cg.pd * current_field, ang:angle}));
    cg.selectAll(".bg")
     .attr("class", "bg " + color(c * cg.pd * current_field / 100));
  });

  var sumangle = Math.atan2(vecsum[1], vecsum[0]);
  var sumlength = Math.sqrt(Math.pow(vecsum[0], 2) + Math.pow(vecsum[1], 2)) * 5 * spacing * 0.75 / (numrows * numcols);
  // console.log(sumlength);
  sumclock.selectAll(".clockhand").attr("d", bigarc({len:sumlength, ang:sumangle}));

  kspace.x += gradients.x;
  kspace.y += gradients.y;

  if (gradients.x != 0 || gradients.y != 0) {
    kspace_dots_g.selectAll("circle").attr("r", 2);
    kspace_dots_g.append("circle").attr("cx", kspace_x(kspace.x)).attr("cy", kspace_y(kspace.y)).attr("r", 2).attr("class", color_total(Math.log(sumlength / current_field)));

    vcursor.attr("x1", kspace_x(kspace.x)).attr("x2", kspace_x(kspace.x)).moveToBack();
    hcursor.attr("y1", kspace_y(kspace.y)).attr("y2", kspace_y(kspace.y)).moveToBack();
  }
};

var runner;
function start() {
  runner = setInterval(function() {
    var data;
    data = time();
    return render(data);
  }, 1000/fps);
}

function stop() {
  clearInterval(runner);
}

function excite() {
  current_field = 1;
  decay = 0.95;
}

function constant() {
  current_field = 1;
  decay = 1;
}

start();