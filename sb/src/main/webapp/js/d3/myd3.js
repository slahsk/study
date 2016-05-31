
var GRAPH = {};
(function(graph) {

	var addDuration = 1500;
	var pointRaid = 3;
	var margin = {
		top : 5,
		right : 20,
		bottom : 30,
		left : 43
	};
	var legendHeight = 30;

	$.extend(graph, {
		storage : function(storage) {

			return {
				reSize : function(width, height) {
					var marginWidth = width - margin.left - margin.right;
					var marginHeight = height - margin.top - margin.bottom - legendHeight;

					for ( var i in storage) {
						storage[i].reSize(marginWidth, marginHeight)
					}
				},
				addData : function(data) {
					
					var delFirstData = GRAPH.delFirst(data);
					
					var obj = {
						xMin : GRAPH.min(delFirstData, "date"),
						xMax : GRAPH.max(delFirstData, "date"),
						yMax : GRAPH.max(delFirstData, "close")
					};

					for ( var i in storage) {
						if (storage[i].beofrAddData) {
							storage[i].beofrAddData(obj);
						}
					}
					for ( var i in storage) {
						if (storage[i].addData) {
							storage[i].addData(data)
						}
					}

				}
				
				
			}
		},
		init : function(param) {
			var d3Graph = new GRAPH.create(param);

			$(window).on("graph:resize", function() {
				d3Graph.reSize();
			});

			$(window).on("resize", function() {
				$(window).trigger("graph:resize");
			});
			
			if(!param.brush){
				var update = setInterval(function() {
					GRAPH.update(d3Graph, param);
				}, 60000);
				
				GRAPH.updateInterval.push(update);
			}

			$(window).trigger("resize");
		},
		updateInterval : (function(){
			var update = [];
			
			return {
				push : function(obj){
					update.push(obj);
				},
				clear : function(){
					for(var i in update){
						clearInterval(update[i]);
					}
					$(window).off("graph:resize");
					update = [];
				}
			};
			
		}())
	});
	
	
	$.extend(graph, {
		max : function(data, name) {
			return d3.max(data, function(obj) {
				return d3.max(obj.values, function(d) {
					return d[name];
				});
			});
		},
		min : function(data, name) {
			return d3.min(data, function(obj) {
				return d3.min(obj.values, function(d) {
					return d[name];
				});
			});
		},
		yAxisFormat : function(value) {
			
			var fmt = d3.format(',.1');
			
			if (value < 1000) {
				return fmt(value) + '';
			} else if (value < 1000000) {
				return fmt(value / 1000) + 'k';
			} else if (value < 1000000000) {
				return fmt(value / 1000000) + 'M';
			} else {
				return fmt(value / 1000000000) + 'G';
			}
		}
	});

	// 데이터 조작
	$.extend(graph, {
		setInfoData : function(data, param) {
			var color = d3.scale.category10();
			var colorCount = 0;
			var infoData = param.pmInfo;
			
			
			$.each(data, function(key, value) {
				value.label = infoData[value.key].watchDesc;
				value.watchId = infoData[value.key].watchId;
			});

			data.sort(function(a, b) {
				return Number(a.watchId.split("_")[1]) - Number(b.watchId.split("_")[1]);
			});

			$.each(data, function(key, value) {
				value.color = color(colorCount++);
			});
			
			return data;
		},
		arrayToObject : function(data) {
			var parseDate = d3.time.format("%Y%m%d%H%M%S").parse;

			return $.map(data, function(val, i) {
				return {
					id : val[0],
					date : parseDate((val[1] + "00")),
					close : Math.round(val[2])
				};
			});
		},
		nestData : function(data) {

			var nest = d3.nest()
			.key(function(d) {
				return d.id;
			})
			.sortKeys(d3.ascending)
			.sortValues(function(a, b) {
				return a.date - b.date;
			})
			.entries(data);

			return nest;
		},
		delFirst : function(data) {// 첫번째 데이터 삭제
			var result = $.extend(true, [], data);
			for ( var i in result) {
				result[i].values.shift();
			}
			return result;
		}
	});

	// ajax 호출
	$.extend(graph, {
		update : function(d3Graph, param) {
			
			$.ajax({
				type : 'GET',
				url : param.gUrl,
				dataType : "json"
			}).done(function(data) {
				d3Graph.addData(data, param);
			});
		},
		call : function(param) {

			d3.json(param.gUrl, function(error, obj) {

				if (!obj || obj.length < 2) {

					if (param.retrycnt && param.retrycnt > 2) {

					}else {
						console.log("graph 호출 실패");
						setTimeout(function() {
							GRAPH.call(param)
						}, 5000);

						if (param.retrycnt && param.retrycnt > 0) {
							param.retrycnt++;
						} else {
							param.retrycnt = 1;
						}

						console.log("graph 호출 수 : " + param.retrycnt);
					}
					
					return;
				}

				var data = obj;
				var objectData = GRAPH.arrayToObject(data);
				var nest = GRAPH.nestData(objectData);
				nest = GRAPH.setInfoData(nest, param); // label, color
				param.data = nest;

				GRAPH.init(param);

			});

		},
		getServiceInfo : function(param) {
			var pmInfoData = {};
			$.ajax({
				type : 'POST',
				url : '',
				dataType : "json",
				data : {
					'splunkDomain' : param
				},
				async : false,
				success : function(data) {
					$.each(data.rows, function(index, d) {
						pmInfoData[d.watchNm] = {
							watchDesc : d.watchDesc,
							watchId : d.watchId
						};
					});
				},
				error : function(request, status, error) {
					alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
				},
			});

			return pmInfoData;
		}
	});

	// d3 설정
	$.extend(graph, {
		xBrush : function(width) {
			return d3.time.scale().range([ 0, width ]);
		},
		xAxisBrush : function(xBrush) {
			return d3.svg.axis().scale(xBrush).orient("bottom").ticks(5).tickFormat(d3.time.format('%H'));
		},
		x : function(width) {
			return d3.time.scale().range([ 0, width ]);
		},
		y : function(height) {
			return d3.scale.linear().range([ height, 0 ]);
		},
		yAxis : function(y) {
			return d3.svg.axis().scale(y).orient("left").ticks(5).tickFormat(GRAPH.yAxisFormat);
		},
		xAxis : function(x) {
			return d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.minutes, 10).tickFormat(d3.time.format('%H:%M'));
		},
		valueLine : function(x, y) {
			return d3.svg
			.line()
			.interpolate('linear')
			.x(function(d) {
				return x(d.date);
			})
			.y(function(d) {
				return y(d.close);
			});
		},

	});

	function dynamicX(x) {

		var brush;

		return {
			get : function() {
				return x;
			},
			set : function(obj) {
				x = obj;
			},
			beforeTranslate : function(d) {
				return "translate(" + x(d.values[2].date) + ")";
			},
			afterTranslate : function(d) {
				return "translate(" + x(d.values[1].date) + ")";
			},
			setBrush : function(xObj, brushObj) {
				x = xObj;
				brush = brushObj;
			},
			getBrush : function() {
				return brush;
			},
			isBrush : function() {
				return !!brush;
			}
		};
	}

	// d3 로 그리거나 제어 함수들
	var d3Sketch = function(obj) {
		
		var width = obj.width;
		var height = obj.height;
		var data = obj.data;
		var svg = obj.svg;

		var marginWidth = width - margin.left - margin.right;
		var marginHeight = height - margin.top - margin.bottom - legendHeight;
		var x = GRAPH.x(marginWidth);
		var y = GRAPH.y(marginHeight);
		var yAxis = GRAPH.yAxis(y);
		var xAxis = GRAPH.xAxis(x);

		var delFirstData = GRAPH.delFirst(data);

		var yMax = GRAPH.max(delFirstData, "close");
		var xMin = GRAPH.min(delFirstData, "date");
		var xMax = GRAPH.max(delFirstData, "date");

		var xInfo = dynamicX(x);
		
		return {
			createLegend : function() {

				xInfo.set(x);

				var legend = svg.append("g").attr('class', 'legend');

				var legendSpace = width / data.length;

				legend
				.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", function(d, i) {
					return (legendSpace / 2) + i * legendSpace - 30 - margin.left;
				}).attr("cy", function(d, i) {
					return marginHeight + (margin.bottom) + 10;
				}).attr("fill", function(d) {
					return d.color;
				}).attr("stroke", function(d) {
					return d.color;
				}).attr("r", 5);

				legend
				.selectAll("text")
				.data(data)
				.enter()
				.append("text")
				.attr("x", function(d, i) {
					return (legendSpace / 2) + i * legendSpace - 20 - margin.left;
				})
				.attr("y", function(d) {
					return marginHeight + (margin.bottom) + 15;
				})
				.attr("class", "legend").attr("data-color", function(d) {
					return d.color;
				})
				.style("fill", function(d) {
					return d.color;
				})
				.on('mouseover', function() {
					this.style.cursor = "pointer";
				})
				.on("click", function(d) {

					var self = d3.select(this), 
						active = this.value ? false : true, 
						newOpacity = active ? 0 : 1, 
						newOpacityCircle = active ? 0.3 : 1;

					// line
					d3.select(this.parentNode.parentNode)
					.selectAll(".line .area")
					.filter(function(d, i) {
						return self.data()[0].key === d.key;
					})
					.transition()
					.duration(100)
					.style("opacity", newOpacity);

					// circle
					d3.select(this.parentNode.parentNode)
					.selectAll(".circle > g")
					.filter(function(d, i) {
						return self.data()[0].key === d.key;
					})
					.attr("active", active)
					.transition()
					.duration(100)
					.style("opacity", newOpacity);

					// legend
					d3.select(this.parentNode)
					.selectAll("circle")
					.filter(function(d) {
						return self.data()[0].key === d.key;
					})
					.transition()
					.duration(100)
					.style("opacity", newOpacityCircle);

					this.value = active;

				}).text(function(d) {
					return d.label;
				});

				return {
					reSize : function(marginWidth, marginHeight) {
						var width = marginWidth + margin.left + margin.right;
						var legendSpace = width / data.length;

						legend.selectAll("circle")
						.attr("cx", function(d, i) {
							return (legendSpace / 2) + i * legendSpace - 30 - margin.left;
						})
						.attr("cy", function(d, i) {
							return marginHeight + (margin.bottom) + 10;
						});

						legend.selectAll("text")
						.attr("x", function(d, i) {
							return (legendSpace / 2) + i * legendSpace - 20 - margin.left;
						})
						.attr("y", function(d) {
							return marginHeight + (margin.bottom) + 15;
						});

					}
				};
			},
			createBarData : function() {

				// default
				if (!yMax) {
					yMax = 10;
				}

				var barData = [ {
					close : 105 * yMax / 100,
					close2 : 100 * yMax / 100
				}, {
					close : 75 * yMax / 100,
					close2 : 50 * yMax / 100
				}, {
					close : 25 * yMax / 100,
					close2 : 0 * yMax / 100
				} ];

				var y = d3.scale.linear().range([ marginHeight, 0 ]);
				var barYscale = y.domain([ 0, yMax ]);

				svg
				.append('g')
				.selectAll(".bar")
				.data(barData)
				.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", function(d) {
					return 0;
				})
				.attr("y", function(d) {
					return barYscale(d.close);
				})
				.attr("width", function(d) {
					return parseInt(marginWidth);
				})
				.attr("height", function(d) {
					return barYscale(d.close2) - barYscale(d.close);
				});

				return {
					reSize : function(width, height) {

						y.range([ height, 0 ]);

						svg.selectAll(".bar")
						.attr("x", function(d) {
							return 0;
						})
						.attr("y", function(d) {
							return barYscale(d.close);
						})
						.attr("width", function(d) {
							return parseInt(width);
						})
						.attr("height", function(d) {
							return barYscale(d.close2) - barYscale(d.close);
						});
					}
				};

			},
			createClipPath : function() {
				var clipPath = svg.append("clipPath").attr("id", "line-area");

				var rect = clipPath
				.append("rect")
				.attr("x", 0)
				.attr("y", -(pointRaid))
				.attr("width", marginWidth)
				.attr("height", marginHeight + pointRaid);

				return {
					reSize : function(marginWidth, marginHeight) {
						rect.attr("width", marginWidth).attr("height", marginHeight + pointRaid);
					}
				};
			},
			createXAxis : function() {

				x.domain([ xMin, xMax ]);
				svg.append("g")
				.attr("class", "x axis graph")
				.attr("transform", "translate(0," + marginHeight + ")")
				.call(xAxis);

				return {
					reSize : function(marginWidth, marginHeight) {
						
						x.range([ 0, marginWidth ]);
						
						svg
						.selectAll("g .x.axis.graph")
						.attr("transform", "translate(0," + marginHeight + ")")
						.call(xAxis.orient("bottom"));
					},
					beofrAddData : function(obj) {
						if (xInfo.isBrush()) {
							x.domain(xInfo.getBrush().extent());
						} else {
							x.domain([ obj.xMin, obj.xMax ]);
						}
						
						svg.selectAll("g .x.axis.graph")
						.transition()
						.duration(addDuration)
						.call(xAxis);
					}

				}
			},
			createYAxis : function() {

				y.domain([ 0, yMax ]);
				
				svg.append("g")
				.attr("class", "y axis")
				.call(yAxis);

				return {
					reSize : function(marginWidth, marginHeight) {
						y.range([ marginHeight, 0 ])
						svg.selectAll("g .y.axis").call(yAxis.orient("left"));
					},
					beofrAddData : function(obj) {

						y.domain([ 0, obj.yMax ]);
						svg.selectAll("g .y.axis").call(yAxis);

					}
				}
			},
			createLine : function() {
				var valueLine = GRAPH.valueLine(x, y);

				svg.append("g")
				.attr("class", "line")
				.attr("clip-path", "url(#line-area)")
				.selectAll(".area")
				.data(data)
				.enter()
				.append('path')
				.attr("class", "area")
				.attr('d', function(d, i) {
					return valueLine(d.values);
				})
				.style('stroke', function(d) {
					return d.color;
				});

				return {
					reSize : function() {
						svg
						.selectAll(".line .area")
						.attr("d", function(d) {
							return valueLine(d.values);
						});
					},
					addData : function(data) {

						var lines = svg.selectAll(".line .area").data(data);

						lines
						.attr('d', function(d) {
							return valueLine(d.values);
						})
						.attr("transform", xInfo.beforeTranslate)
						.transition()
						.ease('linear')
						.duration(addDuration)
						.attr("transform", xInfo.afterTranslate);

					}
				}
			},
			createPoint : function() {

				var tooltip = d3.select(svg.node().parentNode.parentNode)
				.append('div')
				.attr('class', 'tooltip');

				tooltip
				.append('div')
				.attr('class', 'label');

				var circleArea = svg.append("g")
									.attr("class", "circle")
									.attr("clip-path", "url(#line-area)")
									.selectAll(".circle")
									.data(data)
									.enter()
									.append("g")
									.style("fill", function(d) {
										return d.color;
									})
									.each(point);
				
				function point(d) {
					var circle = d3.select(this).selectAll("circle").data(d.values);

					circle
					.enter()
					.append("circle")
					.attr("class", "point")
					.attr("cx", function(d) {
						return x(d.date);
					})
					.attr("cy", function(d) {
						return y(d.close);
					})
					.attr("r", pointRaid).on({
						mouseover : function(d) {
							var isLegendActive = d3.select(this.parentNode).attr("active");
							// legend 의해서 비활성화 되면 이벤트 발상하면 안됨
							if (isLegendActive === "false" || !isLegendActive) {
								var format = d3.time.format("%p %I:%M");
								var label = d3.select(this.parentNode).data()[0].label;
								this.style.cursor = "pointer";

								d3.select(this)
								.transition()
								.duration(200)
								.attr("r", 5);

								tooltip
								.style('display', 'block')
								.select('.label')
								.html("[" + label + "]<br>" + format(new Date(d.date)) + ", " + d.close + "");
							}

						},
						mousemove : function() {
							
							var width = Number(tooltip.style("width").replace("px",""));
							
							var left = 0;
							
							if(d3.event.pageX > width){
								left = d3.event.pageX-150;
							}else{
								left = d3.event.pageX;
							}
							
							
							tooltip
							.style('top', (d3.event.pageY - 40) + 'px')
							.style('left', left + 'px');
						},
						mouseout : function() {
							d3.select(this)
							.transition()
							.duration(200)
							.attr("r", pointRaid);

							tooltip.style('display', 'none');
						}
					});

					circle
					.attr("cx", function(d) {
						return x(d.date);
					})
					.attr("cy", function(d) {
						return y(d.close);
					});

					circle.exit().remove();
				}
				return {
					reSize : function() {
						svg.selectAll(".circle .point").attr("cx", function(d) {
							return x(d.date);
						}).attr("cy", function(d) {
							return y(d.close);
						});
					},
					addData : function(data) {

						var circleArea = svg.selectAll(".circle > g").data(data);

						circleArea.enter();

						circleArea.each(point);

						circleArea
						.attr("transform", xInfo.beforeTranslate)
						.transition()
						.ease('linear')
						.duration(addDuration)
						.attr("transform", xInfo.afterTranslate);
					}
				}
			},
			createBrush : function() {
				var xBrush = GRAPH.xBrush(marginWidth);
				var xAxisBrush = GRAPH.xAxisBrush(xBrush);
				xBrush.domain([ xMin, xMax ]);
				x.domain([ new Date(xMax.getTime() - (10 * 60 * 1000)), xMax ]);

				var brush = d3.svg
				.brush()
				.x(xBrush)
				.extent([ new Date(xMax.getTime() - (5 * 60 * 1000)), xMax ])
				.on("brush", brushed);

				xInfo.setBrush(xBrush, brush);
				var context = svg.append("g")
				.attr("class", "context")
				.attr("transform", "translate(0," + (height + 10) + ")");

				context
				.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0,0)")
				.call(xAxisBrush);

				context
				.append("g")
				.attr("class", "x brush")
				.call(brush)
				.selectAll("rect")
				.attr("y", -6)
				.attr("height", 10);

				var valueLine = GRAPH.valueLine(x, y);
				function brushed() {
					x.domain(brush.empty() ? xBrush.domain() : brush.extent());

					svg.selectAll(".area")
					.attr("width", marginWidth)
					.attr("height", height)
					.attr("d", function(d) {
						return valueLine(d.values);
					});

					svg.selectAll(".circle .point")
					.attr("cx", function(d) {
						return x(d.date);
					})
					.attr("cy", function(d) {
						return y(d.close);
					});

					svg.select(".x.axis").call(xAxis);
				}

				return {
					reSize : function(marginWidth, marginHeight) {
						var brushExtent = brush.extent();

						xBrush.range([ 0, marginWidth ]);
						context
						.attr("transform", "translate(0," + (marginHeight + margin.bottom + 10) + ")")
						.call(xAxisBrush.orient("bottom"));

						context.selectAll(".context .brush")
						.transition()
						.call(brush.extent(brushExtent))
						.call(brush.event)

					},
					beofrAddData : function(obj){
						xBrush.domain([ obj.xMin, obj.xMax ]);
						
						svg.selectAll("g .context .x.axis")
						.transition()
						.duration(addDuration)
						.call(xAxisBrush);
						
					}
				};

			}

		};
	};
	
	graph.create = function(param) {
		var target = "#" + param.target;
		var data = param.data;
		var width = $(target).width();
		var height = $(target).height();
		
		$(target).empty();
	
		
		
		this.svg = d3.select(target)
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.top + ")");

		var sketch = d3Sketch({
			width : width,
			height : height,
			data : data,
			svg : this.svg
		});


		
		var createdObj = {
			clipPath : sketch.createClipPath(),
			barData : sketch.createBarData(),
			xAxis : sketch.createXAxis(),
			yAxis : sketch.createYAxis(),
			line : sketch.createLine(),
			point : sketch.createPoint()
		};
		
		if(param.brush){
			createdObj.brush = sketch.createBrush()
		}else{
			createdObj.legend = sketch.createLegend()
		}
		
		this.storage = GRAPH.storage(createdObj);
	};

	$.extend(graph.create.prototype, {
		reSize : function() {
			var svg = this.svg;
			var width = d3.select(svg.node().parentNode.parentNode).style("width").replace("px", "");
			var height = d3.select(svg.node().parentNode.parentNode).style("height").replace("px", "");

			d3.select(svg.node().parentNode)
			.attr("width", width)
			.attr("height", height);

			this.storage.reSize(width, height);

		},
		addData : function(data, param) {
			
			var svg = this.svg;
			var objectData = GRAPH.arrayToObject(data);
			var nest = GRAPH.nestData(objectData);
			nest = GRAPH.setInfoData(nest, param);


			this.storage.addData(nest);
		}
	
	});

}(GRAPH));
