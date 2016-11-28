(function() {
	
		var color = d3.scale.ordinal().domain([1,2,3,4,5,6,7,8,9,10,11,12])
              .range(["#BEC0F8", "#9FACD0", "#6870A6", "#4C507B",
					  "#A7D9A6", "#86C181", "#5CAE5B", "#4D9348",
					  "#FFAF60", "#FF9224", "#EA7500", "#BB5E00"]);		
		var map;
		var flag = true;
		
		function Map(topology) {

			// Convert the topojson to geojson
			var geojson = topojson.feature(topology, topology.objects.taipei),

			// Since we're using projected TopoJSON, we use a null projection here.
			path = d3.geo.path().projection(d3.geo.mercator().center([121.66,25.12]).scale(130000)),
		
			svg = d3.select("#data").append("svg")
						.attr({
							"class": "map",
							width: 520,
							height: 675
						})
						.style("float","left"),
			g = svg.append("g").attr({"class": "g-village"}),

			// Add town paths
			village = g.selectAll("path.village").data(geojson.features)
						.enter().append("path")
						.attr({
							"class": function(d) {return "m_"+(d.properties.village_Data_v)},
							"id": function(d){return "map_"+(d.properties.VILLAGE_ID)},
							d: path
						})
						.style({
							fill: function(d){
								return color(d.properties.village_Data_v)
							},
							stroke: "white",
						})
						.on("mouseover", function(d, i){
							document.getElementById('hover').innerHTML = "";
							document.getElementById('town_fg').setAttribute("d", document.getElementById(this.id).getAttribute("d"));
							document.getElementById('town_fg').setAttribute("class", "town_fg");
							var v_name = d.properties.V_Name, d_name = d.properties.T_Name,
								v_KMT_c = d.properties.village_Data_KMT_c, v_KMT_p = d.properties.village_Data_KMT_p,
								v_DPP_c = d.properties.village_Data_DPP_c, v_DPP_p = d.properties.village_Data_DPP_p,
								v_PFP_c = d.properties.village_Data_PFP_c, v_PFP_p = d.properties.village_Data_PFP_p;
							document.getElementById('dv_name').innerHTML = d_name + v_name;
							document.getElementById('v_KMT').innerHTML =
								"<tspan class='candidate'>朱立倫</tspan>" + 
								"<tspan dx='30'>" + v_KMT_c + "</tspan>" + 
								"<tspan class='pct' x='150' fill='#5B6A95'>" + v_KMT_p + "%</tspan>";
							document.getElementById('v_DPP').innerHTML =
								"<tspan class='candidate'>蔡英文</tspan>" + 
								"<tspan dx='30'>" + v_DPP_c + "</tspan>" + 
								"<tspan class='pct' x='150' fill='#55AA55'>" + v_DPP_p + "%</tspan>";
							document.getElementById('v_PFP').innerHTML =
								"<tspan class='candidate'>宋楚瑜</tspan>" + 
								"<tspan dx='30'>" + v_PFP_c + "</tspan>" +  
								"<tspan class='pct' x='150' fill='#FF9224'>" + v_PFP_p + "%</tspan>";
							document.getElementById('point_fg').setAttribute("r", document.getElementById("scatter_"+this.id.substr(4)).getAttribute("r"));
							document.getElementById('point_fg').setAttribute("cx", document.getElementById("scatter_"+this.id.substr(4)).getAttribute("cx"));
							document.getElementById('point_fg').setAttribute("cy", document.getElementById("scatter_"+this.id.substr(4)).getAttribute("cy"));
							document.getElementById('point_fg').setAttribute("class", "town_fg");
						})
						.on("mouseout", function(d, i){
							document.getElementById('town_fg').setAttribute("class", "town_fg_hidden");
							document.getElementById('point_fg').setAttribute("class", "town_fg_hidden");
							document.getElementById('hover').innerHTML = "<tspan id='hover',font-size='20',x=0,y=30>hover over a village or legend</tspan>";
							document.getElementById('dv_name').innerHTML = "";
							document.getElementById('v_KMT').innerHTML = "";
							document.getElementById('v_DPP').innerHTML = "";
							document.getElementById('v_PFP').innerHTML = "";
						});
			// 加入一個圖層，可以覆蓋過其他圖層，以便完整顯示			
			g.append("path")
				.attr({
					'id':'town_fg',
					'class':'town_fg'
				});
			
			

			var b = [];
			for(j=1 ;j<=12; j++){
				var x = document.getElementsByClassName("m_"+j);
				for(i=0; i<x.length; i++){
					b[j] += x[i].getAttribute("d");
				}
			}

			// 圖例區塊
			drawLegend = function(){
				boxWidth = 25, boxHeight = 10, data = [10,25,40,10,25,40,10,25,40,10,25,40],
				legend = svg.append("g").attr({
							"class":"legend",
							transform:"translate(10, 30)"
				}),
				legend.selectAll("rect").data(data)
					.enter().append("rect").attr({
						width:boxWidth, height:boxHeight,
						x:function(d, i){return (i%4)*25},
						y:function(d, i){return (10+Math.floor(i/4)*15)}
					})
					.style({
						fill: function(d, i){return color (i+1)},
					})
					.on("mouseover", function(d, i){
						document.getElementById('town_fg').setAttribute("d", b[i+1].substr(9));						
						document.getElementById('town_fg').setAttribute("class", "town_fg");
						d3.select(".scatter").selectAll(".dot")
							.filter(function(d){ return d.v==i+1})
							.attr("class", "dot_show")
							.style("stroke", "#333")
							.style("stroke-width", 1.5);
					})
					.on("mouseout", function(d, i){
						document.getElementById('town_fg').setAttribute("class", "town_fg_hidden");
						d3.select(".scatter").selectAll(".dot_show")
							.filter(function(d){ return d.v==i+1})
							.attr("class", "dot")
							.style("stroke", "#CCC")
							.style("stroke-width", 1);
					});
					
				legend.selectAll("line.legend-line").data(data.slice(5,8))
					.enter().append("line").attr({
						"class":"legend-line",
						x1:function(d,i){return(i+1)*boxWidth+.5},
						y1:2,
						x2:function(d,i){return(i+1)*boxWidth+.5},
						y2:50
					});
				legend.selectAll("text.legend-pct").data(data.slice(0,3)).enter().append("text").attr({
					"class":"legend-pct",x:function(d,i){return(i+1)*boxWidth+1.5},y:0
				}).text(function(d){return (d*2/3)+(130/3)+"%"});
				self.legend.append("text").attr({"class":"legend-label",x:3*boxWidth + 30,y:18.5}).text("朱立倫");
				self.legend.append("text").attr({"class":"legend-label",x:3*boxWidth + 30,y:34.25}).text("蔡英文");
				self.legend.append("text").attr({"class":"legend-label",x:3*boxWidth + 30,y:50}).text("宋楚瑜");
			};	
			drawLegend();

				
		}
		
		d3.json("taipei.json", function(err, topology) {
			if (err) throw error;
			map = new Map(topology);
		});
		
		
		
		

		var margin = {top: 20, right: 20, bottom: 30, left: 50},
			width = 500 - margin.left - margin.right,
			height = 675 - margin.top - margin.bottom;

		var x = d3.scale.linear()
			.range([0, width]);

		var y = d3.scale.linear()
			.range([height, height-350]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

		var svg = d3.select("body #data").append("svg")
			.attr("class", "scatter")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		  .append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		d3.csv("data.csv", function(error, data) {
		  if (error) throw error;

		  data.forEach(function(d) {
			d.age_mean = +d.age_mean
			d.income_median = +d.income_median;
		  });

		  x.domain(d3.extent(data, function(d) { return d.age_mean; })).nice();
		  y.domain(d3.extent(data, function(d) { return d.income_median; })).nice();

		  svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(xAxis)
			.append("text")
			  .attr("class", "label")
			  .attr("x", width)
			  .attr("y", -6)
			  .style("text-anchor", "end")
			  .text("年齡平均數 (歲)");

		  svg.append("g")
			  .attr("class", "y axis")
			  .call(yAxis)
			.append("text")
			  .attr("class", "label")
			  .attr("transform", "rotate(-90)")
			  .attr("x", -280)
			  .attr("y", 6)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text("所得中位數 (千元)")
		
		// 點
		  svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			  .attr("class", "dot") //function(d) { return (d.v)})
			  .attr("id", function(d) { return "scatter_"+(d.VILLAGE_ID); })
			  .attr("r", 4)
			  .attr("cx", function(d) { return x(d.age_mean); })
			  .attr("cy", function(d) { return y(d.income_median); })
			  .style({"fill": function(d) { return color(d.v); }, stroke: "#CCC"})
			  .on("mouseover", function(d, i){
						document.getElementById('hover').innerHTML = "";
						document.getElementById('town_fg').setAttribute("class", "town_fg");
						document.getElementById('point_fg').setAttribute("class", "town_fg");
						document.getElementById('point_fg').setAttribute("r", document.getElementById(this.id).getAttribute("r"));
						document.getElementById('point_fg').setAttribute("cx", document.getElementById(this.id).getAttribute("cx"));
						document.getElementById('point_fg').setAttribute("cy", document.getElementById(this.id).getAttribute("cy"));
						document.getElementById('town_fg').setAttribute("d", document.getElementById("map_"+this.id.substr(8)).getAttribute("d"));
						var v_name = d.V_Name, d_name = d.T_Name,
							v_KMT_c = d.KMT_c, v_KMT_p = d.KMT_p,
							v_DPP_c = d.DPP_c, v_DPP_p = d.DPP_p,
							v_PFP_c = d.PFP_c, v_PFP_p = d.PFP_p;
						document.getElementById('dv_name').innerHTML = d_name + v_name;
						document.getElementById('v_KMT').innerHTML =
							"<tspan class='candidate'>朱立倫</tspan>" + 
							"<tspan dx='30'>" + v_KMT_c + "</tspan>" + 
							"<tspan class='pct' x='150' fill='#5B6A95'>" + v_KMT_p + "%</tspan>";
						document.getElementById('v_DPP').innerHTML =
							"<tspan class='candidate'>蔡英文</tspan>" + 
							"<tspan dx='30'>" + v_DPP_c + "</tspan>" + 
							"<tspan class='pct' x='150' fill='#55AA55'>" + v_DPP_p + "%</tspan>";
						document.getElementById('v_PFP').innerHTML =
							"<tspan class='candidate'>宋楚瑜</tspan>" + 
							"<tspan dx='30'>" + v_PFP_c + "</tspan>" +  
							"<tspan class='pct' x='150' fill='#FF9224'>" + v_PFP_p + "%</tspan>";
			  })
			  .on("mouseout", function(d, i){
				document.getElementById('town_fg').setAttribute("class", "town_fg_hidden");
				document.getElementById('point_fg').setAttribute("class", "town_fg_hidden");
				document.getElementById('hover').innerHTML = "<tspan>hover over a village or legend</tspan>";
				document.getElementById('dv_name').innerHTML = "";
				document.getElementById('v_KMT').innerHTML = "";
				document.getElementById('v_DPP').innerHTML = "";
				document.getElementById('v_PFP').innerHTML = "";
			  });
			  
		  // 加入一個圖層，可以覆蓋過其他圖層，以便完整顯示			
		  svg.append("circle")
			.attr({
				'id':'point_fg',
				'class':'point_fg'
			});

		});

		// 各里投票結果提示區塊
			tooltip = function(){
				tooltip = svg.append("g").attr({
							"class": "map_tooltip",
							transform: "translate(10, 10)"
				}),
				tooltip.append("text").attr({'class': 'title'})
								.style({"font-size":20+"px", fill:"#444", "font-weight":"bold"})
								.text("台北市各里投票結果"),
				tooltip.append("text").attr({"id":"hover",x:0,y:30}).style({'font-size':'17px'}).text("hover over a village or legend"),
				tooltip.append("text").attr({"id":"dv_name", x:0,y:30}).text(),
				tooltip.append("text").attr({"id":"v_KMT", x:0,y:60}).text(),
				tooltip.append("text").attr({"id":"v_DPP", x:0,y:90}).text(),
				tooltip.append("text").attr({"id":"v_PFP", x:0,y:120}).text();
			};	
			tooltip();
			
	}());
