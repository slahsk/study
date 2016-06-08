
var GRID = {};

(function(grid){
	//유틸
	$.extend(grid,{
		getCheckedRow : function(id){
			return $(id).jqGrid('getGridParam', 'selarrrow');
		},
		pager : function(id,grid){
			var tag = '<table class="ui-pg-table" style="margin: 0 auto;">'+
			'<tbody>'+
				'<tr>'+
					'<td class="ui-pg-button ui-corner-all ui-state-disabled">'+
						'<span class="ui-icon ui-icon-seek-first"></span>'+
					'</td>'+
					'<td class="ui-pg-button ui-corner-all ui-state-disabled">'+
						'<span class="ui-icon ui-icon-seek-prev"></span>'+
					'</td>'+
					'<td class="ui-pg-button ui-state-disabled">'+
						'<span class="ui-separator"></span>'+
					'</td>'+
					'<td>'+
						'페이지'+
						'<input type="text" class="ui-pg-input" size="3" maxlength="7" value="1">'+
						' / '+
						'<span class="page-last">0</span>'+
					'</td>'+
					'<td class="ui-pg-button ui-state-disabled">'+
						'<span class="ui-separator"></span>'+
					'</td>'+
					'<td class="ui-pg-button ui-corner-all">'+
						'<span class="ui-icon ui-icon-seek-next"></span>'+
					'</td>'+
					'<td class="ui-pg-button ui-corner-all">'+
						'<span class="ui-icon ui-icon-seek-end"></span>'+
					'</td>'+
				'</tr>'+
			'</tbody>'+
		'</table>';
			var table = $(tag);
			$(id).append(tag);
			
			var totalSize = $(grid).getGridParam('records');
			var totalPage = Math.ceil(totalSize/$(grid).getGridParam('rowNum'));
			
			$(id)
			.css({
				"padding-top":"5px"
			})
			.find("table").css("width","auto")
			.find("td").css({
				 "font-weight": "normal"
				,"vertical-align": "middle"
				,"padding": "0px 1px"
				,"font-size": "13px"
			});
			
			$(id).find(".ui-pg-button").on({
				mouseover:function(){
					if(!$(this).hasClass('ui-state-disabled')){
						$(this).addClass("ui-state-hover");
					}
				},
				mouseout:function(){
					$(this).removeClass("ui-state-hover");
				}
			});
			
			$(id).find(".ui-icon-seek-first").click(function(){
				if(!$(this).parent().hasClass('ui-state-disabled')){
					$(grid).jqGrid('setGridParam', {page:1}).trigger("reloadGrid")
					$(id).find(".ui-pg-input").val(1);
					firstDisabled();
				}
			});
			
			$(id).find(".ui-icon-seek-prev").click(function(){
				if(!$(this).parent().hasClass('ui-state-disabled')){
					var currentPage = $(grid).jqGrid('getGridParam','page')-1;
					
					$(id).find(".ui-icon-seek-next").parent().removeClass("ui-state-disabled");
					$(id).find(".ui-icon-seek-end").parent().removeClass("ui-state-disabled");
					
					if(currentPage === 1){
						$(id).find(".ui-icon-seek-first").parent().addClass("ui-state-disabled");
						$(id).find(".ui-icon-seek-prev").parent().addClass("ui-state-disabled");
					}
					
					if(currentPage > 0){
						$(id).find(".ui-pg-input").val(currentPage);
						$(grid).jqGrid('setGridParam', {page:currentPage}).trigger("reloadGrid");
					}
					
				}
			});
			
			
			$(id).find(".ui-icon-seek-next").click(function(){
				if(!$(this).parent().hasClass('ui-state-disabled')){
					var last = getLastPage();
					var currentPage = $(grid).jqGrid('getGridParam','page')+1;
					
					if(last === currentPage){
						$(id).find(".ui-icon-seek-next").parent().addClass("ui-state-disabled");
						$(id).find(".ui-icon-seek-end").parent().addClass("ui-state-disabled");
					}
					
					if(last >= currentPage){
						$(id).find(".ui-pg-input").val(currentPage);
						$(grid).jqGrid('setGridParam', {page:currentPage}).trigger("reloadGrid");
					}
					
					$(id).find(".ui-icon-seek-first").parent().removeClass("ui-state-disabled");
					$(id).find(".ui-icon-seek-prev").parent().removeClass("ui-state-disabled");
				}
				
			});
			
			$(id).find(".ui-icon-seek-end").click(function(){
				if(!$(this).parent().hasClass('ui-state-disabled')){
					var end = getLastPage();
					$(grid).jqGrid('setGridParam', {page:end}).trigger("reloadGrid");
					$(id).find(".ui-pg-input").val(end);
					lastDisabled();
				}
				
			});
			
			$(id).find(".ui-pg-input").keypress(function(e){
				if( $(grid).getGridParam('records') > 0 && e.which ===13){
					var last = getLastPage();
					var value = Number($(this).val());
					
					if(value <= 0){
						value = 1;
					}else if(value > last){
						value = last;
					}
					
					if(value === 1){
						firstDisabled();
					}else if(value === last){
						lastDisabled();
					}else{
						iconEnable();
					}
					
					
					$(id).find(".ui-pg-input").val(value);
					$(grid).jqGrid('setGridParam', {page:value}).trigger("reloadGrid");
				}
			})
			.css({
				 "height": "18px"
				,"width": "auto"
				,"font-size": ".9em"
				,"margin": 0
				,"line-height": "inherit"
				,"border": "none"
				,"padding": "0 2px"
			});
			
			function getLastPage(){
				var totalSize = $(grid).getGridParam('records');
				return Math.ceil(totalSize/$(grid).getGridParam('rowNum'));
			}
			
			function iconEnable(){
				$(id).find(".ui-icon-seek-first").parent().removeClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-prev").parent().removeClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-next").parent().removeClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-end").parent().removeClass("ui-state-disabled");
			}
			
			function lastDisabled(){
				$(id).find(".ui-icon-seek-first").parent().removeClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-prev").parent().removeClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-next").parent().addClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-end").parent().addClass("ui-state-disabled");
			}
			
			function firstDisabled(){
				$(id).find(".ui-icon-seek-first").parent().addClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-prev").parent().addClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-next").parent().removeClass("ui-state-disabled");
				$(id).find(".ui-icon-seek-end").parent().removeClass("ui-state-disabled");
			}
			
			$(grid).on("setPageLast",function(){
				var totalSize = $(grid).getGridParam('records');
				var totalPage = Math.ceil(totalSize/$(grid).getGridParam('rowNum'));
				$(id).find(".page-last").html(totalPage);
			});
			
		}
	});
	
	//그리드 
	$.extend(grid,{
		draw : function(target,settingOptions){
			var defaultOptions = {
				autowidth : true,
				rownumbers : false,
				scroll : false,
				multiselect : false,
				multiselectWidth: 40,
				footerrow : false,
				userDataOnFooter : false,
				page : 1,
				datatype : "json",
				rownumWidth: 60,
				hoverrows:false,
				cmTemplate: { sortable: false },
				width : '100%',
				shrinkToFit : true,
				mtype: 'POST',
				height:"auto",
				jsonReader : {
					root: "rows"
				}
			};
			
			
			function DefaultLoadComplete(){
		
			}
			
			
			var gridOptions =  $.extend({},defaultOptions,settingOptions);
			
			gridOptions.loadComplete = function(data){
				DefaultLoadComplete.call(this,data);
				if(settingOptions.loadComplete){
					settingOptions.loadComplete.call(this,data);
				}
				$(this).trigger("setPageLast");
			};
			
			delete gridOptions.pager;
			if(settingOptions.pager){
				GRID.pager(settingOptions.pager,target);
			}
			
			$(target).jqGrid(gridOptions);
			
		
		}
	});
	
}(GRID));
