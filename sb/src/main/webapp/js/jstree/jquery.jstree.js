/*
 * jsTree 1.0-rc3
 * http://jstree.com/
 *
 * Copyright (c) 2010 Ivan Bozhanov (vakata.com)
 *
 * Licensed same as jquery - under the terms of either the MIT License or the GPL Version 2 License
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * $Date: 2011-02-09 01:17:14 +0200 (ср, 09 февр 2011) $
 * $Revision: 236 $
 */

/*
 *  2015.06.15 주석작업 시작 GitHub Setting by 이은철
 *  2015.06.16 동기화 테스트
 *  2015.06.16 eclipse 커밋 테스트
 */

/*jslint browser: true, onevar: true, undef: true, bitwise: true, strict: true */
/*global window : false, clearInterval: false, clearTimeout: false, document: false, setInterval: false, setTimeout: false, jQuery: false, navigator: false, XSLTProcessor: false, DOMParser: false, XMLSerializer: false*/

"use strict";

// top wrapper to prevent multiple inclusion (is this OK?)
(function () { if(jQuery && jQuery.jstree) { return; }
	var is_ie6 = false, is_ie7 = false, is_ff2 = false;

/*
 * jsTree core
 */
(function ($) {
	// Common functions not related to jsTree
	// decided to move them to a `vakata` "namespace"
	$.vakata = {};
	// CSS related functions
	$.vakata.css = {
		get_css : function(rule_name, delete_flag, sheet) {
			rule_name = rule_name.toLowerCase();//소문자로 변경
			var css_rules = sheet.cssRules || sheet.rules,
				j = 0;
			
			do {
				if(css_rules.length && j > css_rules.length + 5) { 
					return false; 
				}
				
				//css_rules[j].selectorText 같으면 rule_name
				if(css_rules[j].selectorText && css_rules[j].selectorText.toLowerCase() == rule_name) {
					if(delete_flag === true) {
						if(sheet.removeRule) { 
							sheet.removeRule(j); 
						}
						
						if(sheet.deleteRule) {
							sheet.deleteRule(j); 
						}
						return true;
					}else { 
						return css_rules[j]; 
					}
				}
			}while (css_rules[++j]);//css_rules[] 객체 있을때 까지
			
			return false;
		},
		add_css : function(rule_name, sheet) {
			if($.jstree.css.get_css(rule_name, false, sheet)) { 
				return false; 
			}
			
			if(sheet.insertRule) { 
				sheet.insertRule(rule_name + ' { }', 0); 
			}else { 
				sheet.addRule(rule_name, null, 0); 
			}
			
			return $.vakata.css.get_css(rule_name);
		},
		remove_css : function(rule_name, sheet) { 
			return $.vakata.css.get_css(rule_name, true, sheet); 
		},
		add_sheet : function(opts) {
			var tmp = false, 
				is_new = true;
			
			//문자
			if(opts.str) {
				if(opts.title) { 
					tmp = $("style[id='" + opts.title + "-stylesheet']")[0];//style 객체 가져오기 
				}
				
				if(tmp) { 
					is_new = false; 
				}else {//tmp 없으면 style 객체 새로 생성
					tmp = document.createElement("style");
					tmp.setAttribute('type',"text/css");
					if(opts.title) { 
						tmp.setAttribute("id", opts.title + "-stylesheet"); 
					}
					
				}
				
				if(tmp.styleSheet) {
					if(is_new) { //tmp 객체 있으면 head 밑에 추가
						document.getElementsByTagName("head")[0].appendChild(tmp); 
						tmp.styleSheet.cssText = opts.str; 
					}else {
						tmp.styleSheet.cssText = tmp.styleSheet.cssText + " " + opts.str; 
					}
				}else {
					tmp.appendChild(document.createTextNode(opts.str));
					document.getElementsByTagName("head")[0].appendChild(tmp);
				}
				return tmp.sheet || tmp.styleSheet;
			}
			
			//url
			if(opts.url) {
				if(document.createStyleSheet) {
					try { 
						tmp = document.createStyleSheet(opts.url); 
					}catch (e) { }
				}else {
					tmp			= document.createElement('link');
					tmp.rel		= 'stylesheet';
					tmp.type	= 'text/css';
					tmp.media	= "all";
					tmp.href	= opts.url;
					document.getElementsByTagName("head")[0].appendChild(tmp);
					return tmp.styleSheet;
				}
			}
		}
	};

	// private variables
	var instances = [],			// instance array (used by
								// $.jstree.reference/create/focused)
		focused_instance = -1,	// the index in the instance array of the
								// currently focused instance
		plugins = {},			// list of included plugins
		prepared_move = {};		// for the move_node function

	// jQuery plugin wrapper (thanks to jquery UI widget function)
	$.fn.jstree = function (settings) {
		// settings 타입이 string 이면 true
		var isMethodCall = (typeof settings == 'string'), // is this a method
															// call like
															// $().jstree("open_node")
			/*
			 * 배열의 slice함수 실행 함수실행시 this 는 arguments가 된다. arguments[0] =
			 * settings arguments[1] 부터 배열로 변경
			 */
			args = Array.prototype.slice.call(arguments, 1), 
			
			// $() 선택한 element
			returnValue = this;

		// if a method call execute the method on all selected instances
		if(isMethodCall) {// 메소드 호출시
			// settings 문자열에 _바로 시작 하면 this 리턴
			if(settings.substring(0, 1) == '_') { return returnValue; }
			// this 는 여러개의 Elements 될수 있기에 each 실행
			this.each(function() {
				/*
				 * $.data 이용하여 element의 jstree_instance_id 값 가저와서 내부 변수인
				 * instances 에서 instance 가져오기
				 */
				var instance = instances[$.data(this, "jstree_instance_id")],
				
				/*
				 * instance 가 존재 하며 instance 에 settings이름의 함수가 있으면
				 * instance[settings] 함수 실행 아니면 instance를 methodValue에 값 할당
				 * 함수실행시 this는 instance,파라미터는 args instance 는 settings 이 문자열아
				 * 아닐때 옵션값에 의해서 생성 된다.
				 */
					methodValue = (instance && $.isFunction(instance[settings])) ? instance[settings].apply(instance, args) : instance;
				/*
				 * methodValue 값이 undefinded 아니며 함수이름이 is_ 로 시작하가나 methodValue
				 * 값이 true,false 아닐때 returnValue에 returnValue값 할당 하고
				 */
					
					if(typeof methodValue !== "undefined" 
						&& (settings.indexOf("is_") === 0 
						|| (methodValue !== true && methodValue !== false))) {
						
						returnValue = methodValue; 
						return false; 
					}
			});
		}else {// setting
			this.each(function() {
				// extend settings and allow for multiple hashes and $.data
				var instance_id = $.data(this, "jstree_instance_id"), // elements 에 jstree_instance_id 값 가져오기
					a = [],
					b = settings ? $.extend({}, true, settings) : {},// settings에 객체가 있으면 빈 오프젝트에 settings 복사 settings 없으면 빈오브젝트 할당
					c = $(this),
					s = false, 
					t = [];
					
					a = a.concat(args); // 변수 a 에 args 추가
					
				if(c.data("jstree")) {// 선택한 element 에 jstree 이름의 값이 있으면 a에 값 추가
					a.push(c.data("jstree")); 
				}
				
				/*
				 * a에 값이 하나라도 있으면 b 에 a를 복사하여 b에 할당 $.extend(true,a,b)
				 */
				b = a.length ? $.extend.apply(null, [true, b].concat(a)) : b;

				/*
				 * if an instance already exists, destroy it first instance_id 가
				 * undefined 아니고 내부변수 instances에 instance_id 속성이 있으면 삭제 TODO
				 * destroy() 분석 필요
				 */ 
				if(typeof instance_id !== "undefined" && instances[instance_id]) { 
					instances[instance_id].destroy(); 
				}
				
				/*
				 * push a new empty object to the instances array instances 에 빈
				 * 오브젝트 추가 push 하면 length 리턴(10진수)
				 */ 
				instance_id = parseInt(instances.push({}),10) - 1;
				
				// store the jstree instance id to the container element
				$.data(this, "jstree_instance_id", instance_id);
				
				/*
				 * clean up all plugins 변수 b.plugins(사용자가 입력함) 이 배열이 아니라면
				 * default 로 설정
				 * settings.plugins 없으면 default set
				 */
				b.plugins = $.isArray(b.plugins) ? b.plugins : $.jstree.defaults.plugins.slice(); 
				b.plugins.unshift("core");
				
				// only unique plugins
				b.plugins = b.plugins.sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g,"$1$2$4").replace(/,,+/g,",").replace(/,$/,"").split(",");
				
				/*
				 * extend defaults with passed data $.jstree.defaults : {
				 * plugins : [] } $.jstree.plugin() 확장시
				 * $.jstree.defaults.plugins 에 추가 된다.
				 */
				s = $.extend(true, {}, $.jstree.defaults, b);
				
				s.plugins = b.plugins;
				// plugin 이 없으면 사용자가 입력한 plugins 이름 제거
				$.each(plugins, function (i, val) { 
					if($.inArray(i, s.plugins) === -1) { 
						s[i] = null; 
						delete s[i]; 
					}else { 
						t.push(i); 
					}
				});
				
				s.plugins = t;
				/*
				 * push the new object to the instances array (at the same time
				 * set the default classes to the container) and init instances
				 * 생성(element 에 class 추가)
				 */
				instances[instance_id] = new $.jstree._instance(instance_id, $(this).addClass("jstree jstree-" + instance_id), s); 
				
				/*
				 * init all activated plugins for this instance 사용자로 부터 입력받은
				 * plugins 을 생성한 instances[id].data 에 plugins 이름으로 빈 객체 생성
				 * "plugins" : ["themes","html_data","ui","crrm","hotkeys"]
				 * plugin 데이터 초기화
				 */
				$.each(instances[instance_id]._get_settings().plugins, function (i, val) { 
					instances[instance_id].data[val] = {}; 
				});
				
				/*
				 * setting 한 plugins 의 __init 함수 실행 
				 * this 로 instace 객체
				 */
				$.each(instances[instance_id]._get_settings().plugins, function (i, val) { 
					if(plugins[val]) { 
						plugins[val].__init.apply(instances[instance_id]); 
					} 
				});
				
				/*
				 * initialize the instance $.jstree._fn =
				 * $.jstree._instance.prototype core plugin 의 함수
				 * $.jstree._fn.init() 실행
				 * setTimeout을 이용한 비동기 호출 
				 */
				setTimeout(function() { 
					if(instances[instance_id]) { 
						instances[instance_id].init(); 
					} 
				}, 0);
				
			});
		}
		// return the jquery selection (or if it was a method call that returned
		// a value - the returned value)
		return returnValue;
	};
	// object to store exposed functions and objects
	$.jstree = {
		defaults : {
			plugins : []
		},
		_focused : function () { 
			return instances[focused_instance] || null; 
		},
		// needle 가 instances id라면 변수에서 바로 가져오기
		// element id 라면 그 객체의 data 에 있는 instances id 가져와서 조회후 리턴
		_reference : function (needle) { 
			// get by instance id
			if(instances[needle]) { 
				return instances[needle]; 
			}
			// get by DOM (if still no luck - return null
			var o = $(needle); 
			
			if(!o.length && typeof needle === "string") { 
				o = $("#" + needle); 
			}
			
			if(!o.length) { 
				return null; 
			}
			
			return instances[o.closest(".jstree").data("jstree_instance_id")] || null; 
		},
		/*
		 * jstree 사용한 모든 element는 $.cash 를 통해서 element 의 instance를 가져 올수 있다.
		 * index : id(number) container : 사용자가 선택한 element 에 class 추가후 리턴한
		 * selector settings : 사용자가 입력한 객체
		 */
		_instance : function (index, container, settings) {  
			// for plugins to store data in
			
			this.data = { core : {} };
			this.get_settings	= function () { return $.extend(true, {}, settings); };//settings 복사
			this._get_settings	= function () { return settings; };
			this.get_index		= function () { return index; };
			this.get_container	= function () { return container; };
			// 모든 노드는 ul 객체 밑에 다 포함 되어 있다. 전체 노드 의 부모
			this.get_container_ul = function () { return container.children("ul:eq(0)"); };
			this._set_settings	= function (s) { 
				settings = $.extend(true, {}, settings, s);
			};
		},
		/*
		 * $.jstree.plugin() 함수를 사용하여 확장한 함수는 이 객체에 있다.
		 */
		_fn : { },
		plugin : function (pname, pdata) {// jstree 확장은 plugin 함수를 통해서 _fn에 함수에 추가
			
			pdata = $.extend({}, {
				__init		: $.noop, // function(){}
				__destroy	: $.noop,
				_fn			: {},
				defaults	: false
			}, pdata);
			plugins[pname] = pdata; 

			$.jstree.defaults[pname] = pdata.defaults;
			
			
			/*
			 * pdata._fn 의 모든 메소드 $.jstree._fn 에서 참조 하고 있기에 클로저 생성
			 */
			$.each(pdata._fn, function (i, val) {
				val.plugin		= pname;
				val.old			= $.jstree._fn[i]; // 같은 이름의 함수가 있으면 old 에 추가
				//plugin 모든 함수들은 $.jstree._fn 에 할당
				$.jstree._fn[i] = function () {
					var rslt,
						func = val,// 함수
						args = Array.prototype.slice.call(arguments),// arguments 배열로 변경
						evnt = new $.Event("before.jstree"),// before.jstree 이름의 이벤트 생성
						rlbk = false;
					/*
					 * this는 instances[id] 를 통해서 가져온 객체 instances 의
					 * data.core.locked 가 true 이고 메소드 이름이 unlock,is_locked 아니면
					 * return
					 */ 
					if(this.data.core.locked === true && i !== "unlock" && i !== "is_locked") { 
						return; 
					}

					// Check if function belongs to the included plugins of this
					// instance
					/*
					 * setting 한 plugin에 함수의 plugin 존재 하면 break
					 */
					do {
						if(func && func.plugin && $.inArray(func.plugin, this._get_settings().plugins) !== -1) { 
							break; 
						}
 
						func = func.old; //old 함수를 func
					} while(func);
					
					if(!func) { 
						return; 
					} 
 
					/*
					 * context and function to trigger events, then finally call
					 * _가 있는 함수라면 실행후 리턴값
					 */
					if(i.indexOf("_") === 0) {
						rslt = func.apply(this, args);
					}else {
						/*
						 * element 에 before.jstree 이름의 이벤트 실행 func : 메소드 이름,
						 * inst : element 객체, args : argument, func.plugin :
						 * plugin 이름
						 */
						rslt = this.get_container().triggerHandler(evnt, { "func" : i, "inst" : this, "args" : args, "plugin" : func.plugin });
						
						if(rslt === false) { 
							return; 
						}
						
						// rslt가 undefined 아니면 args에 할당
						if(typeof rslt !== "undefined") { 
							args = rslt; 
						} 
						
						// this 에 3개의 메소드 추가 해서 실행
						rslt = func.apply(
							$.extend({}, this, { 
								__callback : function (data) { 
									// 사용자가 jstree 함수 사용시 클라이언트에서 이벤트 함수 실행 
									this.get_container().triggerHandler( i + '.jstree', { "inst" : this, "args" : args, "rslt" : data, "rlbk" : rlbk });
								},
								__rollback : function () { 
									// instance 의 get_rollback() 함수 실행
									rlbk = this.get_rollback();
									return rlbk;
								},
								__call_old : function (replace_arguments) {// 같은 이름의 예전에 사용 되었던 함수 호출
									return func.old.apply(this, (replace_arguments ? Array.prototype.slice.call(arguments, 1) : args ) );
								}
							}), args);
					}

					// return the result
					return rslt;
				};
				
				/*
				 * i : 메소드 이름 val : 함수 pname : plugin 이름
				 */
				
				$.jstree._fn[i].old = val.old;
				$.jstree._fn[i].plugin = pname;
			});
		},
		rollback : function (rb) {
			if(rb) {
				if(!$.isArray(rb)) {// rb 가 배열이 아니면 배열로 변경
					rb = [ rb ]; 
				}
				
				$.each(rb, function (i, val) {
					instances[val.i].set_rollback(val.h, val.d); // instances 의 set_rollback 함수 실행
				});
			}
		}
	};
	// set the prototype for all instances
	$.jstree._fn = $.jstree._instance.prototype = {};

	// load the css when DOM is ready
	$(function() {
		// code is copied from jQuery ($.browser is deprecated + there is a bug
		// in IE)
		var u = navigator.userAgent.toLowerCase(),
			v = (u.match( /.+?(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
			css_string = '' + 
				'.jstree ul, .jstree li { display:block; margin:0 0 0 0; padding:0 0 0 0; list-style-type:none; } ' + 
				'.jstree li { display:block; min-height:18px; line-height:18px; white-space:nowrap; margin-left:18px; min-width:18px; } ' + 
				'.jstree-rtl li { margin-left:0; margin-right:18px; } ' + 
				'.jstree > ul > li { margin-left:0px; } ' + 
				'.jstree-rtl > ul > li { margin-right:0px; } ' + 
				'.jstree ins { display:inline-block; text-decoration:none; width:18px; height:18px; margin:0 0 0 0; padding:0; } ' + 
				'.jstree a { display:inline-block; line-height:16px; height:16px; color:black; white-space:nowrap; text-decoration:none; padding:1px 2px; margin:0; } ' + 
				'.jstree a:focus { outline: none; } ' + 
				'.jstree a > ins { height:16px; width:16px; } ' + 
				'.jstree a > .jstree-icon { margin-right:3px; } ' + 
				'.jstree-rtl a > .jstree-icon { margin-left:3px; margin-right:0; } ' + 
				'li.jstree-open > ul { display:block; } ' + 
				'li.jstree-closed > ul { display:none; } ';
		// Correct IE 6 (does not support the > CSS selector)
		if(/msie/.test(u) && parseInt(v, 10) == 6) { 
			is_ie6 = true;

			// fix image flicker and lack of caching
			try {
				document.execCommand("BackgroundImageCache", false, true);
			} catch (err) { }

			css_string += '' + 
				'.jstree li { height:18px; margin-left:0; margin-right:0; } ' + 
				'.jstree li li { margin-left:18px; } ' + 
				'.jstree-rtl li li { margin-left:0px; margin-right:18px; } ' + 
				'li.jstree-open ul { display:block; } ' + 
				'li.jstree-closed ul { display:none !important; } ' + 
				'.jstree li a { display:inline; border-width:0 !important; padding:0px 2px !important; } ' + 
				'.jstree li a ins { height:16px; width:16px; margin-right:3px; } ' + 
				'.jstree-rtl li a ins { margin-right:0px; margin-left:3px; } ';
		}
		// Correct IE 7 (shifts anchor nodes onhover)
		if(/msie/.test(u) && parseInt(v, 10) == 7) { 
			is_ie7 = true;
			css_string += '.jstree li a { border-width:0 !important; padding:0px 2px !important; } ';
		}
		// correct ff2 lack of display:inline-block
		if(!/compatible/.test(u) && /mozilla/.test(u) && parseFloat(v, 10) < 1.9) {
			is_ff2 = true;
			css_string += '' + 
				'.jstree ins { display:-moz-inline-box; } ' + 
				'.jstree li { line-height:12px; } ' + // WHY??
				'.jstree a { display:-moz-inline-box; } ' + 
				'.jstree .jstree-no-icons .jstree-checkbox { display:-moz-inline-stack !important; } ';
				/* this shouldn't be here as it is theme specific */
		}
		// the default stylesheet
		$.vakata.css.add_sheet({ str : css_string, title : "jstree" });
	});

	/*
	 * core functions (open, close, create, update, delete) 모든 확장은
	 * __init,defaults,_fn 객체로 구성
	 */
	$.jstree.plugin("core", {
		/*
		 * this : instance 객체
		 */
		__init : function () {
			this.data.core.locked = false;
			this.data.core.to_open = this.get_settings().core.initially_open; // 사용자가 setting 한 값 set
			this.data.core.to_load = this.get_settings().core.initially_load;
		},
		defaults : { 
			html_titles	: false,
			animation	: 500,
			initially_open : [],
			initially_load : [],
			open_parents : true,
			notify_plugins : true,
			rtl			: false,
			load_open	: false,
			strings		: {
				loading		: "Loading ...",
				new_node	: "New node",
				multiple_selection : "Multiple selection"
			}
		},
		_fn : { 
			/*
			 * this : $.jstree._fn $.jstree._fn = $.jstree._instance.prototype
			 * init 함수는 $.jstree._fn 객체에서 참조 하고 있고 $.jstree._fn =
			 * $.jstree._instance.prototype 상속 받았기 때문에 _instance 객체 사용 가능하다.
			 * instance 가 가리키는 객체는 사용자가 선택한 element 이다. $(id).jstree() 실행시 이 함수가
			 * 실행 된다. 페이지 로딩시 $.jstree.plugin() 함수가 실행 되어 모든 함수는 $.jstree._fn 에
			 * 참조하고 있다. 런타임에는 $.jstree._fn 함수에서 참조해서 사용한다.
			 */
			init	: function () { 
				this.set_focus(); 
				var jstree = this.get_container();
				var setting = this._get_settings();
				
				// 기본값 false
				if(setting.core.rtl) {
					jstree.addClass("jstree-rtl").css("direction", "rtl");
				}
				
				//loading 상태의 node 생성
				jstree.html("<ul><li class='jstree-last jstree-leaf'><ins>&#160;</ins><a class='jstree-loading' href='#'><ins class='jstree-icon'>&#160;</ins>" + this._get_string("loading") + "</a></li></ul>");
				 
				//node 높이
				this.data.core.li_height = this.get_container_ul().find("li.jstree-closed, li.jstree-leaf").eq(0).height() || 18;
				
				// element 에 이벤트 추가
				jstree.delegate(
					"li > ins", 
					"click.jstree", 
					$.proxy(function (event) {
						console.log("click");
						var trgt = $(event.target);
						this.toggle_node(trgt);// close open 변경
					},this)
					)
					.bind("mousedown.jstree", $.proxy(function () { //마우스 클릭할때마다 발생
							this.set_focus(); // This used to be setTimeout(set_focus,0) - why?
						}, this))
					.bind("dblclick.jstree", function (event) { 
						var sel;
						//IE
						if(document.selection && document.selection.empty) { 
							document.selection.empty(); 
						}else {
							if(window.getSelection) {
								sel = window.getSelection();
								try { 
									sel.removeAllRanges();
									sel.collapse();
								} catch (err) { }
							}
						}
					});
				// notify_plugins 기본값 true
				if(setting.core.notify_plugins) {
					//load_node 함수 실행시 콜백
					jstree.bind("load_node.jstree", $.proxy(function (e, data) { 
								var o = this._get_node(data.rslt.obj),
									t = this;
								
								if(o === -1) { //node 가 없으면 최상위 ul객체 가져오기
									o = this.get_container_ul(); 
								}
								
								if(!o.length) { 
									return; 
								}
								
								o.find("li").each(function () {//li node 수만큼 반복
									var th = $(this);
									if(th.data("jstree")) {//node 에 jstree data 가 있으면
										$.each(th.data("jstree"), function (plugin, values) {
											if(t.data[plugin] && $.isFunction(t["_" + plugin + "_notify"])) {
												//data 설정한  plugin notify 함수 실행
												//plugin 마다 함수 있음
												t["_" + plugin + "_notify"].call(t, th, values); 
											}
										});
									}
								});
							}, this));
				}
				// load_open 기본값 false
				if(setting.core.load_open) {
					jstree.bind("load_node.jstree", $.proxy(function (e, data) { 
								var o = this._get_node(data.rslt.obj),
									t = this;
								
								if(o === -1) { 
									o = this.get_container_ul(); 
								}
								
								if(!o.length) { 
									return; 
								}
								
								//open node 중 자식이 없는 노드
								o.find("li.jstree-open:not(:has(ul))").each(function () {
									t.load_node(this, $.noop, $.noop);
								});
								
							}, this));
				}
				this.__callback();
				this.load_node(-1, function () { this.loaded(); this.reload_nodes(); });
			},
			destroy	: function () { 
				var i,
					n = this.get_index(),
					s = this._get_settings(),
					_this = this;	// element

				// $.jstree.plugin() 확장한 plugin 모두 __destroy 실행
				$.each(s.plugins, function (i, val) {
					try { 
							plugins[val].__destroy.apply(_this); 
						} catch(err) {
							
						}
				});
				// destory.jstree 이벤트 실행
				this.__callback();
				
				// set focus to another instance if this one is focused
				if(this.is_focused()) {//focuse 한 객체 라면 
					for(i in instances) { 
						if(instances.hasOwnProperty(i) && i != n) {//index 번호하고 instances 번호가 다르면 
							instances[i].set_focus(); 
							break; 
						} 
					}
				}
				// if no other instance found
				// 포커스 instance 라면 -1
				if(n === focused_instance) { 
					focused_instance = -1; 
				}
				
				// remove all traces of jstree in the DOM (only the ones set
				// using jstree*) and cleans all events
				// 이벤트 및 cash 데이터 삭제
				this.get_container()
					.unbind(".jstree")
					.undelegate(".jstree")
					.removeData("jstree_instance_id")
					.find("[class^='jstree']")
					.andSelf()
					.attr("class", function () { 
						return this.className.replace(/jstree[^ ]*|$/ig,''); 
					});
				
				$(document).unbind(".jstree-" + n).undelegate(".jstree-" + n);
				// remove the actual data
				instances[n] = null;
				delete instances[n];
			},
			_core_notify : function (n, data) {//load_node.jstree 이벤트에서 사용
				if(data.opened) {
					this.open_node(n, false, true);
				}
			},
			lock : function () {
				this.data.core.locked = true;
				this.get_container().children("ul").addClass("jstree-locked").css("opacity","0.7");
				this.__callback({});
			},
			unlock : function () { 
				this.data.core.locked = false;
				this.get_container().children("ul").removeClass("jstree-locked").css("opacity","1");
				this.__callback({});
			},
			is_locked : function () { 
				return this.data.core.locked; 
			},
			save_opened : function () {
				var _this = this;
				this.data.core.to_open = [];
				// this 객체중 첫번째 ul 에서 li.jstree-open 찾기
				this.get_container_ul().find("li.jstree-open").each(function () { 
					if(this.id) {
						// id이름 넣기
						_this.data.core.to_open.push("#" + this.id.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:")); 
					}
				});
				this.__callback(_this.data.core.to_open);
			},
			save_loaded : function () { },
			reload_nodes : function (is_callback) {
				var _this = this, // instance
					done = true,
					current = [],
					remaining = [];
				
				if(!is_callback) {// is_callback : fasle
					this.data.core.reopen = false; 
					this.data.core.refreshing = true; 
					this.data.core.to_open = $.map($.makeArray(this.data.core.to_open), function (n) { return "#" + n.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:"); });
					this.data.core.to_load = $.map($.makeArray(this.data.core.to_load), function (n) { return "#" + n.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:"); });
					if(this.data.core.to_open.length) {
						this.data.core.to_load = this.data.core.to_load.concat(this.data.core.to_open);
					}
				}
				
				if(this.data.core.to_load.length) {//data 중 to_load 가 있으면
					$.each(this.data.core.to_load, function (i, val) {
						if(val == "#") { //값이 # 리턴
							return true; 
						}
						
						//element 객체가 있으면
						if($(val).length) { 
							current.push(val); 
						}else { 
							remaining.push(val); 
						}
					});
					
					if(current.length) {
						this.data.core.to_load = remaining;
						$.each(current, function (i, val) { 
							if(!_this._is_loaded(val)) {
								_this.load_node(val, function () { 
									_this.reload_nodes(true); 
								}, function () { 
									_this.reload_nodes(true); 
								});
								done = false;
							}
						});
					}
				}
				if(this.data.core.to_open.length) {
					$.each(this.data.core.to_open, function (i, val) {
						_this.open_node(val, false, true); 
					});
				}
				if(done) { 
					// TODO: find a more elegant approach to syncronizing
					// returning requests
					if(this.data.core.reopen) { 
						clearTimeout(this.data.core.reopen); 
					}
					this.data.core.reopen = setTimeout(function () { _this.__callback({}, _this); }, 50);
					this.data.core.refreshing = false;
					this.reopen();
				}
			},
			reopen : function () { 
				var _this = this;
				if(this.data.core.to_open.length) { // 사용자가 settion 준 값이나
													// save_opened 함수 실행시 값저장
					$.each(this.data.core.to_open, function (i, val) {
						_this.open_node(val, false, true); 
					});
				}
				this.__callback({});
			},
			refresh : function (obj) {
				var _this = this;
				
				this.save_opened(); // open 되어 있는 li id 저장
				
				if(!obj) { // obj 없으면 -1
					obj = -1; 
				}
				
				obj = this._get_node(obj); // li
				
				if(!obj) { // li 객체가 없으면 -1
					obj = -1; 
				}
				
				if(obj !== -1) { // li 자식중 ul 제거
					obj.children("UL").remove(); 
				}else { 
					this.get_container_ul().empty(); // 최상위 ul 제거
				}
				
				this.load_node(obj, function () { _this.__callback({ "obj" : obj}); _this.reload_nodes(); });
			},
			// Dummy function to fire after the first load (so that there is a
			// jstree.loaded event)
			loaded	: function () { 
				this.__callback(); 
			},
			/*
			 * deal with focus element 의 index 하고
			 */
			set_focus	: function () { 
				// 이미 focus 하고 있으면 리턴
				if(this.is_focused()) { return; }
				
				//focused 되어 있는 jstree 객체 가져오기
				var f = $.jstree._focused();
				
				//focuse 되어 는 jstree 객체 focus 해제
				if(f){ 
					f.unset_focus(); 
				}

				// selector 한 jstree 객체에 focuse 추가
				this.get_container().addClass("jstree-focused"); 
				focused_instance = this.get_index();
				
				this.__callback();
			},
			
			// element 의 index 하고 변수 focused_instance 같으면 true
			is_focused	: function () { 
				return focused_instance == this.get_index(); 
			},
			unset_focus	: function () {
				if(this.is_focused()) {
					// element 에 jstree-focused class 삭제
					this.get_container().removeClass("jstree-focused"); 
					focused_instance = -1; // focused_instance 초기화
				}
				// 메소드 이름 + '.jstree 이벤트 걸려 있는 함수 실행
				this.__callback();
			},

			// traverse
			_get_node		: function (obj) { 
				/*
				 * obj : li 객체의 id instance 객체중에 obj(id 문자) 하고 같은게 있으면 선택
				 * obj : 아이콘 객체도 올수 있음
				 */
				var $obj = $(obj, this.get_container()); 
				
				// .jstree 이거나 obj 가 -1 이면 -1 리턴
				if($obj.is(".jstree") || obj == -1) { 
					return -1; 
				}
				
				// obj 의 부모중 첫번째 li 객체 선택(아이콘 클릭시)
				$obj = $obj.closest("li", this.get_container()); 
				
				// 객체가 없어면 false 리턴 있으면 li 객체 리턴
				return $obj.length ? $obj : false; 
			},
			/*
			 * hoykey plugs 에서 사용 TODO strict변수 사용 하는곳 없음
			 */
			_get_next		: function (obj, strict) { 
				// li 객체 가져오기
				obj = this._get_node(obj);
				// 없으면 instace 의 첫번쨰 li 객체 가져오기
				if(obj === -1) { 
					return this.get_container().find("> ul > li:first-child"); 
				}
				// 객체가 있으면 리턴
				if(!obj.length) { 
					return false; 
				}
				
				
				if(strict) { 
					return (obj.nextAll("li").size() > 0) ? obj.nextAll("li:eq(0)") : false; 
				}

				if(obj.hasClass("jstree-open")) { //obj 가 jstree-open 이면
					return obj.find("li:eq(0)"); //첫번째
				}else if(obj.nextAll("li").size() > 0) { 
					return obj.nextAll("li:eq(0)"); //다음 노드
				}else { 
					return obj.parentsUntil(".jstree","li").next("li").eq(0); 
				}
			},
			_get_prev		: function (obj, strict) {
				obj = this._get_node(obj);
				
				// 최상위 노드중 마지막 li 가져오기
				if(obj === -1) { 
					return this.get_container().find("> ul > li:last-child"); 
				}
				
				if(!obj.length) { 
					return false; 
				}
				
				if(strict) { 
					// obj 이전 li 객체가 존재 하면 첫번째 li객체 가져오기
					return (obj.prevAll("li").length > 0) ? obj.prevAll("li:eq(0)") : false; 
				}
				
				// 이전 객체가 li 가 있으면
				if(obj.prev("li").length) {
					obj = obj.prev("li").eq(0); // obj 에 li 첫번째 로 변경
					
					// jstree-open 이있으면(상위 노드)
					while(obj.hasClass("jstree-open")) { 
						// obj 에 최하위 마지막 노드 선택
						obj = obj.children("ul:eq(0)").children("li:last"); 
					}
					return obj;
				}else {
					// obj 상위 객체중 .jstree 자식중 첫번째 li 객체 선택
					var o = obj.parentsUntil(".jstree","li:eq(0)"); return o.length ? o : false; 
				}
			},
			_get_parent		: function (obj) {
				obj = this._get_node(obj);
				if(obj == -1 || !obj.length) { 
					return false; 
				}
				// obj 부모에서.jstree 의 자식중 첫번째 li
				var o = obj.parentsUntil(".jstree", "li:eq(0)");
				
				return o.length ? o : -1; // o 없으면 -1 리턴
			},
			_get_children	: function (obj) {
				obj = this._get_node(obj);
				
				// obj 가 -1 이면 최상위 li 객체 가져오기
				if(obj === -1) { 
					return this.get_container().children("ul:eq(0)").children("li"); 
				}
				
				if(!obj.length) { 
					return false; 
				}
				
				// obj 하위 li 객체
				return obj.children("ul:eq(0)").children("li");
			},
			// 상위 에서 하위 순서의 id 또는 text 가져오기
			get_path		: function (obj, id_mode) { 
				var p = [],
					_this = this;
				
				obj = this._get_node(obj);
				
				//obj가 없으면 리턴
				if(obj === -1 || !obj || !obj.length) { 
					return false; 
				}
				
				// .jstree 자식중 li 선택
				obj.parentsUntil(".jstree", "li").each(function () {
					// id_mode 라면 id 값 넣고 아니면 text 넣기
					p.push( id_mode ? this.id : _this.get_text(this) );
				});
				
				// 배열 역전
				p.reverse();
				
				// id_mode true 라면 obj 의 id 값 넣고 없으면 text 넣기
				p.push( id_mode ? obj.attr("id") : this.get_text(obj) );
				
				return p;
			},

			// string functions
			_get_string : function (key) {
				return this._get_settings().core.strings[key] || key;
			},

			is_open		: function (obj) { 
				obj = this._get_node(obj); 
				return obj && obj !== -1 && obj.hasClass("jstree-open"); 
			},
			is_closed	: function (obj) { 
				obj = this._get_node(obj); 
				return obj && obj !== -1 && obj.hasClass("jstree-closed"); 
			},
			is_leaf		: function (obj) { 
				obj = this._get_node(obj); 
				return obj && obj !== -1 && obj.hasClass("jstree-leaf"); 
			},
			correct_state	: function (obj) {
				obj = this._get_node(obj); // node 조회
				
				//node 없으면
				if(!obj || obj === -1) {
					return false; 
				}
				
				// closed,open class 제거 및 ul 요소 삭제 하여
				// 마지막 node 객체로 변경
				obj.removeClass("jstree-closed jstree-open").addClass("jstree-leaf").children("ul").remove();
				this.__callback({ "obj" : obj });
			},
			// open/close
			open_node	: function (obj, callback, skip_animation) {
				obj = this._get_node(obj); // node jquery 객체 가져오기
				
				if(!obj.length) { 
					return false; 
				}
				
				//closed 되어 있는 노드가 아니라면 콜백함수 실행후 리턴
				if(!obj.hasClass("jstree-closed")) { 
					if(callback) { 
						callback.call(); 
					} 
					return false; 
				}
				/*
				 * skip 또는 ie6 이면 animation 효과 없음 기본값 animation 500
				 */
				var s = skip_animation || is_ie6 ? 0 : this._get_settings().core.animation,
					t = this;
				
				if(!this._is_loaded(obj)) {
					obj.children("a").addClass("jstree-loading");
					this.load_node(obj, function () { t.open_node(obj, callback, skip_animation); }, callback);
				}else {
					if(this._get_settings().core.open_parents) {// 기본값 true
						// 부모 element 중 .jstree , .jstree-closed 객체 each
						obj.parentsUntil(".jstree",".jstree-closed").each(function () {
							t.open_node(this, false, true);
						});
					}
					
					if(s) { 
						// obj(li) 객체 자식중 ul 태그 display none
						obj.children("ul").css("display","none"); 
					}
					
					//closed 제거후 open 추가 후 자식 a element 에 loading 제거
					obj.removeClass("jstree-closed") 
						.addClass("jstree-open")
						.children("a")
						.removeClass("jstree-loading");
					
					// animation 효과
					if(s) { 
						
						obj.children("ul")
							.stop(true, true)
							.slideDown(s, function () { 
								this.style.display = ""; 
								t.after_open(obj); 
							}); 
						
					}else { 
						t.after_open(obj); // skip 또는 ie6 에서 사용
					}
					
					this.__callback({ "obj" : obj });
					
					if(callback) { 
						callback.call(); 
					} 
				}
			},
			after_open	: function (obj) { 
				this.__callback({ "obj" : obj }); 
			},
			close_node	: function (obj, skip_animation) {
				// li
				obj = this._get_node(obj);
				var s = skip_animation || is_ie6 ? 0 : this._get_settings().core.animation,
					t = this;

				// node 없거나 open되어 있는 node가 아니라면 리턴
				if(!obj.length || !obj.hasClass("jstree-open")) { 
					return false; 
				}
				
				// 에니메이션 효과가 있으면 ul 객체 style 변경
				if(s) { 
					obj.children("ul").attr("style","display:block !important"); 
				}
				
				// node 에 jstree-open제거후 jstree-closed 변경
				obj.removeClass("jstree-open").addClass("jstree-closed");
				
				if(s) { 
					// 에니메이션 멈추고 li 객체 숨기기
					obj.children("ul").stop(true, true).slideUp(s, function () { 
							this.style.display = ""; 
							t.after_close(obj);
						}); 
				}else { 
					t.after_close(obj); 
				}
				this.__callback({ "obj" : obj }); // close_node 콜백함수 실행
			},
			after_close	: function (obj) { 
				this.__callback({ "obj" : obj });
			},
			toggle_node	: function (obj) {
				// this : instance
				// obj : li element
				obj = this._get_node(obj);
				
				// class가 jstree-closed 이면 open_node 실행
				if(obj.hasClass("jstree-closed")) { 
					return this.open_node(obj); 
				}
				
				// class가 jstree-open 이면 close_node 실행
				if(obj.hasClass("jstree-open")) { 
					return this.close_node(obj); 
				}
			},
			open_all	: function (obj, do_animation, original_obj) {
				obj = obj ? this._get_node(obj) : -1;
				
				//node 가 없으면 root 에서 ul 요소 가져오기
				if(!obj || obj === -1) { 
					obj = this.get_container_ul(); 
				}
				
				// closed node 가져오기
				if(original_obj) { 
					obj = obj.find("li.jstree-closed");
				}else {
					original_obj = obj;
					if(obj.is(".jstree-closed")) { 
						obj = obj.find("li.jstree-closed").andSelf(); //obj가 close 되어 있으면 같이 포함 
					} else { 
						obj = obj.find("li.jstree-closed"); 
					}
				}
				
				var _this = this;
				
				// closed node open
				obj.each(function () { 
					var __this = this; 
					if(!_this._is_loaded(this)) {//load 되어 있으면 모두 오픈 
						_this.open_node(this, function() { 
							_this.open_all(__this, do_animation, original_obj); 
						}, !do_animation); 
					} else { //obj 하나 open
						_this.open_node(this, false, !do_animation); 
					}
				});
				// so that callback is fired AFTER all nodes are open
				if(original_obj.find('li.jstree-closed').length === 0) { 
					this.__callback({ "obj" : original_obj }); 
				}
			},
			close_all	: function (obj, do_animation) {
				var _this = this;
				obj = obj ? this._get_node(obj) : this.get_container();
				// obj 없으면 ul 객체 가져오기
				if(!obj || obj === -1) { 
					obj = this.get_container_ul(); 
				}
				
				// li.jstree-open 찾은후 obj 에 포함
				// obj 에 포함안 element close
				obj.find("li.jstree-open").andSelf().each(function () { 
					_this.close_node(this, !do_animation); 
				});
				
				this.__callback({ "obj" : obj });
			},
			// 노드 새로 정렬
			clean_node	: function (obj) {
				// obj 가 없으면 최상위 ul element 가져오기
				obj = obj && obj != -1 ? $(obj) : this.get_container_ul();
				
				// li element 이면 obj 에 포함 시키고 아니면 li element 찾기
				obj = obj.is("li") ? obj.find("li").andSelf() : obj.find("li");
				
				//li last 객체 새로 정의 하고 jstree-leat 클레스를 jstree-closed 변경
				obj.removeClass("jstree-last")
					.filter("li:last-child")//li 객체중 마지막 객체 선택
					.addClass("jstree-last")// jstree-last 추가
					.end()// 상위 객체로 이동(filter 전)
					.filter(":has(li)") // li 객체를 가지고 있고
					.not(".jstree-open")// jstree-open 아닌 객체
					.removeClass("jstree-leaf") // jstree-leaf 삭제
					.addClass("jstree-closed");// jstree-closed 추가
				
				// jstree-open jstree-closed 아닌 객체는 jstree-leaf로 변경 하고 ul 객체 제거
				// 자식이 없는객체는 ul 태그가 없다.
				obj.not(".jstree-open, .jstree-closed")
					.addClass("jstree-leaf")
					.children("ul")
					.remove();
				
				this.__callback({ "obj" : obj });
			},
			// rollback
			get_rollback : function () { 
				this.__callback();
				return { i : this.get_index(), h : this.get_container().children("ul").clone(true), d : this.data }; 
			},
			set_rollback : function (html, data) {
				this.get_container().empty().append(html); // 
				this.data = data;
				this.__callback();
			},
			// Dummy functions to be overwritten by any datastore plugin
			// included
			load_node	: function (obj, s_call, e_call) {// 다른 플러그인에서 overwritten
				this.__callback({ "obj" : obj }); 
			},
			_is_loaded	: function (obj) { 
				return true; 
			},
			// Basic operations: create
			create_node	: function (obj, position, js, callback, is_loaded) {
				
				function getJstreeFn(fnObject){
					var jstreeFn = fnObject;
						
					return function(){
						return jstreeFn;
					}
				}
				
				function setData(js){
					// js 는 새로 생성할 li객체 기본값 설정
					if(typeof js === "string") { 
						js = { "data" : js }; 
					}
					
					if(!js) { // js 없으면 빈오브젝트 생성
						js = {}; 
					} 
					
					if(!js.data) { // new_node 값 가져 오기
						js.data = jstreeFn()._get_string("new_node"); 
					} 
					
					if(!$.isArray(js.data)) { // js.data 배열이 아니면 배열로 변경
						var tmp = js.data;  
						js.data = []; 
						js.data.push(tmp); 
					}
					
					return js;
				}
				
				function setNodeAttribute(js){
					
					 var node = $("<li />");
					
					
					if(js.attr) { // d.attr 에 js.attr 값 추가
						node.attr(js.attr); 
					}
					
					if(js.metadata) { // metadata 있으면 d 에 추가
						node.data(js.metadata); 
					}
					
					if(js.state) { // sate는 opend 나 closed 로 추정됨
						node.addClass("jstree-" + js.state); 
					}
					
					return node;
				}
				
				function createNodeNameAndIcon(m,js){
					var nodeName = $("<a />"),
						coreSetting = jstreeFn()._get_settings().core;
					
					// 문자 이면 a element 에 href 속성 추가
					//html_titles 값에 따라 $.fn.html 또는 text 함수 실행
					if(typeof m == "string") { 
						nodeName.attr('href','#')[ coreSetting.html_titles ? "html" : "text" ](m); 
					}else {
						if(!m.attr) { // attr 속성이 없으면 추가
							m.attr = {}; 
						}
						
						if(!m.attr.href) { // href 속성 없으면 추가
							m.attr.href = '#'; 
						}
						
						nodeName.attr(m.attr)[ coreSetting.html_titles ? "html" : "text" ](m.title);
						
						if(m.language) { 
							nodeName.addClass(m.language); 
						}
					}
					
					nodeName.prepend("<ins class='jstree-icon'>&#160;</ins>");
					
					if(!m.icon && js.icon) { 
						m.icon = js.icon; 
					}
					
					if(m.icon) { 
						// icon "/" 없을시 ins태그에 class 추가
						if(m.icon.indexOf("/") === -1) { 
							nodeName.children("ins").addClass(m.icon); 
						}else { // 배경 아이콘으로 변경
							nodeName.children("ins").css("background","url('" + m.icon + "') center center no-repeat"); 
						}
					}
					
					return nodeName;
				}
				
				function getLevelNodes(obj,position,data){
					var nodes = null;
					
					switch(position) {
						case "before":	obj.before(data); 
										nodes = jstreeFn()._get_parent(obj); 
										break;
						case "after" :	obj.after(data);  
										nodes = jstreeFn()._get_parent(obj); 
										break;
						case "inside":
						case "first" :
							if(!obj.children("ul").length) { // ul 객체가 없으면
								obj.append("<ul />");  // ul 객체 삽입
							}
							
							obj.children("ul").prepend(data);// ul 태그 앞에 ins 태그 삽입
							nodes = obj;
							break;
						case "last":
							if(!obj.children("ul").length) { 
								obj.append("<ul />"); 
							}
							
							obj.children("ul").append(data);// ul 태그 뒤에 ins 태그 삽입
							nodes = obj;
							break;
						default:
							//obj 에 ul태그 없으면 생성
							if(!obj.children("ul").length) { 
								obj.append("<ul />"); 
							}
						
							if(!position) { // position 없으면 0으로
								position = 0; 
							}
							// obj ul li의 첫번째 node 노드 가져오기
							nodes = obj.children("ul").children("li").eq(position);
							
							if(nodes.length) { // li 객체가 있으면 li객체 앞에 추가(first)
								nodes.before(data); 
							}else { 
								obj.children("ul").append(data);// ul태그에 삽입
							}
							
							nodes = obj;
							break;
					}
					
					//최상위 노드에 추가 되었거나 생성된 노드가 없으면
					if(nodes === -1 || nodes.get(0) === jstreeFn().get_container().get(0)) { 
						nodes = -1; 
					}
					
					
					return nodes;
				}
				
				
				
				obj = this._get_node(obj);
				// position 없으면 마지막에
				position = (typeof position === "undefined") ? "last" : position;
				
				var jstreeFn = getJstreeFn(this);
				
				// obj 가 있으면 리턴
				if(obj !== -1 && !obj.length) { 
					return false; 
				}
				
				// is_loaded 값이 false 이거나 로드가 안되어 있으면 실행
				if(!is_loaded && !this._is_loaded(obj)) { 
					// 2번째 arg load_node함수에서 사용 안함
					this.load_node(obj, function () {
						this.create_node(obj, position, js, callback, true); 
					});
					
					return false; 
				}

				this.__rollback();
				
				js = setData(js);
				var d = setNodeAttribute(js);
				
				
				$.each(js.data, function (i, m) {
					// 함수이면 함수 실행 후 리턴값 m에 저장
					if($.isFunction(m)) { 
						m = m.call(this, js); 
					}
					d.append(createNodeNameAndIcon(m,js));
				});
				
				// ins 삽입
				d.prepend("<ins class='jstree-icon'>&#160;</ins>");
				
				// obj 가 없으면
				if(obj === -1) {
					obj = this.get_container();
					
					if(position === "before") { // 객체가 없으니깐 before 은 first 로
						position = "first"; 
					}
					
					if(position === "after") { // after 은 last 로 변경
						position = "last"; 
					}
				}
				
				
				
				var levelNodes = getLevelNodes(obj,position,d);
				
				this.clean_node(levelNodes);//last_node 새로 정의
				
				this.__callback({ "obj" : d, "parent" : levelNodes });
				
				if(callback) { 
					callback.call(this, d); 
				}
				
				return d;
			},
			// Basic operations: rename (deal with text)
			get_text	: function (obj) {
				obj = this._get_node(obj);
				
				if(!obj.length) { 
					return false; 
				}
				
				var s = this._get_settings().core.html_titles; // 기본값 false
				
				obj = obj.children("a:eq(0)"); // obj 의 첫번째 a
				
				if(s) {
					obj = obj.clone();// 복사후
					obj.children("INS").remove(); // ins(아이콘) 제거
					return obj.html(); // html 리턴
				}else {
					obj = obj.contents().filter(
							function() { 
								return this.nodeType == 3; 
							}
						)[0]; // a태그에서
					return obj.nodeValue;
				}
			},
			// node text 입력
			set_text	: function (obj, val) {
				obj = this._get_node(obj);
				if(!obj.length) { 
					return false; 
				}
				obj = obj.children("a:eq(0)");
				
				if(this._get_settings().core.html_titles) {
					var tmp = obj.children("INS").clone();//아이콘  복사
					obj.html(val).prepend(tmp);//값 넣고 다시 아이콘 삽입
					this.__callback({ "obj" : obj, "name" : val });
					return true;
				}else {
					obj = obj.contents().filter(function() { return this.nodeType == 3; })[0];
					this.__callback({ "obj" : obj, "name" : val });
					return (obj.nodeValue = val);
				}
			},
			// set_text 중복 같은 기능
			rename_node : function (obj, val) {
				obj = this._get_node(obj);
				this.__rollback();

				// set_text 실행
				if(obj 
					&& obj.length 
					&& this.set_text.apply(this, Array.prototype.slice.call(arguments))) {
					this.__callback({ "obj" : obj, "name" : val }); 
				}
			},
			// Basic operations: deleting nodes
			delete_node : function (obj) {
				obj = this._get_node(obj);
				if(!obj.length) { 
					return false; 
				}
				this.__rollback();
				
				var p = this._get_parent(obj), // 부모의 li
					prev = $([]), 
					t = this;
				
				obj.each(function () {
					prev = prev.add(t._get_prev(this));
				});
				
				obj = obj.detach(); // 삭제
				
				// li 객체수가 0 이면 jstree-open, jstree-closed 클레스 jstree-leaf 변경
				if(p !== -1 && p.find("> ul > li").length === 0) {
					p.removeClass("jstree-open jstree-closed").addClass("jstree-leaf");
				}
				
				this.clean_node(p);
				
				this.__callback({ "obj" : obj, "prev" : prev, "parent" : p });
				return obj;
			},
			/*
			o : 이동 노드 id
			r : 목표 노드 id
			pos : 포지션(앞,뒤)
			cb : 콜백함수
			*/
			prepare_move : function (o, r, pos, cb, is_cb) {// 이동 준비?
				
				function getJstreeFn(fnObject){
					var jstreeFn = fnObject;
						
					return function(){
						return jstreeFn;
					}
				}
				
				function setPosition(p){

					/*
					 * 이동시킬 목표 node 없으면
					 */
					if(p.r === -1 || !p.r) {
						p.cr = -1;
						switch(p.p) {
							case "first":
							case "before":
							case "inside":
								p.cp = 0; 
								break;
							case "after":
							case "last":
								p.cp = p.rt.get_container().find(" > ul > li").length; 
								break;
							default:
								p.cp = p.p;
								break;
						}
						
						p.np = p.rt.get_container();
					}
					else { // ref li 객체가 있으면
						// before after 아니면서 로드가 안되어 있으면 load_node 함수 실행후 콜백으로 prepare_move 함수 다시 실행
						if(!/^(before|after)$/.test(p.p) && !jstreeFn()._is_loaded(p.r)) {
							return jstreeFn().load_node(p.r, function () { jstreeFn().prepare_move(o, r, pos, cb, true); });
						}
						
						switch(p.p) {
							case "before":
								p.cp = p.r.index(); // ref li 객체의 index 가져오기 
								p.cr = p.rt._get_parent(p.r);
								break;
							case "after":
								p.cp = p.r.index() + 1;
								p.cr = p.rt._get_parent(p.r);
								break;
							case "inside":
							case "first":
								p.cp = 0; //index
								p.cr = p.r; // 목표 node li jquery 객체
								break;
							case "last":
								p.cp = p.r.find(" > ul > li").length; 
								p.cr = p.r;
								break;
							default: 
								p.cp = p.p;
								p.cr = p.r;
								break;
						}
						
						p.np =  p.cr;
					}
					
					// p.cr(목표 node) 객체가 없으면 (이동 node)root jquery객체 가져오기
					//p.np = (p.cr == -1) ? p.rt.get_container() : p.cr;
					
					// 주입할 위치의 뒤에 있는 노드
					//p.np : 목표 노드 부모
					//p.or : 이동 목표 node 
					p.or = p.np.find(" > ul > li:nth-child(" + (p.cp + 1) + ")");
					
				}
				
				function getNodeAndPosition(moveNode,referenceNode,position){
					var preapre = {};
					var moveNodeRefence =  $.jstree._reference(moveNode) || jstreeFn(); //jstree 객체 가져오기
					preapre.o = moveNodeRefence._get_node(moveNode); // obj li(node) jquery seleter 객체
					
					// r 값이 있으면 node jquery 객체 가져오기
					preapre.r = (referenceNode === - 1) ? -1 : jstreeFn()._get_node(referenceNode); 
					
					// pos 값이 없거나 false 이면 last
					// TODO: move to a setting
					preapre.p = (typeof position === "undefined" || position === false) ? "last" : position; 
					
					return preapre;
				}
				
				function setJstreeObject(preapre){
					//jquery 객체에서 -> jstree 객체로 가져오기
					preapre.ot = $.jstree._reference(preapre.o) || jstreeFn(); 
					
					// ref instance 가져오기
					// r === -1 ? p.ot :  $.jstree._reference(p.r) || this
					preapre.rt = $.jstree._reference(preapre.r) || jstreeFn(); 
					
				}
				
				function isPrepareObjectEqual(preapre){
					return prepared_move.o && prepared_move.o.is(preapre.o) && prepared_move.r.is(preapre.r) && prepared_move.p === preapre.p;
				}
				
				function setMoveNodeParent(preapre){
					// root 개체에서 이동 node 부모 node jquery객체 가져오기
					// p.o : 이동 node
					// p.ot : jstree root 객체
					preapre.op = preapre.ot._get_parent(preapre.o);
					
					//이동 node 의 부모 node 없으면 jstree 객체 가져오기
					if(preapre.op === -1) { 
						// p.op 에 값 set
						preapre.op = preapre.ot ? preapre.ot.get_container() : jstreeFn().get_container(); 
					}
					
				}
				
				var jstreeFn = getJstreeFn(this);
				
				
				var p = getNodeAndPosition(o,r,pos);
				
				// prepared_move 객체하고 비교하여 같으면  리턴
				if(!is_cb &&  isPrepareObjectEqual(p)){
					this.__callback(prepared_move);
					
					if(cb) {// 콜백 함수 실행
						cb.call(this, prepared_move); 
					}
					return;
				}
				
				
				setJstreeObject(p);
				
				setPosition(p);
				
				setMoveNodeParent(p);
				
				// 이동 node index get
				p.cop = p.o.index();
				
				if(!/^(before|after)$/.test(p.p) //position 이 before, after 아니면 
						&& p.op	// 이동 node 의 부모 node
						&& p.np	// 목표  node
						&& p.op.is(p.np) //같은 jstree
						&& p.o.index() < p.cp) { //p.cp(node 개수) 
					p.cp++; 
				}
				
				// if(p.p === "before" && p.op && p.np && p.op[0] === p.np[0] &&
				// p.o.index() < p.cp) { p.cp--; }
				
				
				
				prepared_move = p;
				
				this.__callback(prepared_move);
				
				// 콜백함수 실행
				if(cb) { 
					cb.call(this, prepared_move); 
				}
			},
			check_move : function () {
				var obj = prepared_move;
				
				
				//prepared_move 값이 같
				if(!obj 
					|| !obj.o 
					|| obj.or.is(obj.o)) {	//이동 node 하고 이동 목표 node(position 적용) 하고 같으면
					return false; 
				}
				
				if(obj.op 
					&& obj.np 
					&& obj.op.is(obj.np)	//이동 node 하고 이동 목표 node 부모 하고 같으면
					&& obj.cp - 1 === obj.o.index()) { // position 위치 인덱스 하고 이동 node 인덱스가 같으면
					return false; 
				}
				
				var ret = true,
					//목표 node 가 없으면 jstree 객체 가져오기
					r = (obj.r === -1) ? this.get_container() : obj.r;
					
				obj.o.each(function () {
					////이동 node 중에서 목표 node 중에 중복 되는  node 가 있으면
					if(r.parentsUntil(".jstree", "li").andSelf().index(this) !== -1) { 
						ret = false; 
						return false; // each 종료
					}
				});
				
				return ret;
			},
			move_node : function (obj, ref, position, is_copy, is_prepared, skip_check) {
				// is_prepared : false prepare_move함수 실행
				//이동 준비 여부 검사 하여 이동시킬 노드 생성
				if(!is_prepared) { 
					return this.prepare_move(obj, ref, position, function (p) {
						this.move_node(p, false, false, is_copy, true, skip_check);
					});
				}
				
				if(is_copy) { 
					prepared_move.cy = true;
				}
				
				if(!skip_check && !this.check_move()) { 
					return false; 
				}

				this.__rollback();
				var o = false;
				
				//깊은 복사
				if(is_copy) {
					//이동 node 복사
					o = obj.o.clone(true);
					
					// 이동 node 의 id 있는 node 하고 자기 자신 포함해서 id에 변경
					o.find("*[id]").andSelf().each(function () {
						if(this.id) { 
							this.id = "copy_" + this.id; 
						}
					});
				}else { 
					o = obj.o; 
				}
				
				//형제로 들어가는냐 자식으로 들어 가는냐
				if(obj.or.length) { 
					obj.or.before(o); 
				}else {
					//자식 노드가 없으면 ul 추가
					if(!obj.np.children("ul").length) { 
						$("<ul />").appendTo(obj.np); 
					}
					
					obj.np.children("ul:eq(0)").append(o); 
				}

				try { 
					obj.ot.clean_node(obj.op); // 이동 node 의 jstree 객체 노드 정리
					obj.rt.clean_node(obj.np); // 목표 node 의 jstree 객체 노드 정리
					
					//이동 node 의 자식 node 가 없으면 ul 요소 제거 및 jstree-leaf 로 class 변경
					if(!obj.op.find("> ul > li").length) {
						obj.op.removeClass("jstree-open jstree-closed").addClass("jstree-leaf").children("ul").remove();
					}
					
				} catch (e) { }
				
				//복사이면
				if(is_copy) { 
					prepared_move.cy = true;
					prepared_move.oc = o; 
				}
				
				this.__callback(prepared_move);
				return prepared_move;
			},
			// 다른 플러그인에서 사용 하기위해서
			_get_move : function () { return prepared_move; }
		}
	});
})(jQuery);
// */

/*
 * jsTree ui plugin This plugins handles
 * selecting/deselecting/hovering/dehovering nodes
 */
(function ($) {
	var scrollbar_width, e1, e2;
	$(function() {
		if (/msie/.test(navigator.userAgent.toLowerCase())) {
			e1 = $('<textarea cols="10" rows="2"></textarea>').css({ position: 'absolute', top: -1000, left: 0 }).appendTo('body');
			e2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>').css({ position: 'absolute', top: -1000, left: 0 }).appendTo('body');
			scrollbar_width = e1.width() - e2.width();
			e1.add(e2).remove();
		} 
		else {
			e1 = $('<div />').css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: 0 })
					.prependTo('body').append('<div />').find('div').css({ width: '100%', height: 200 });
			scrollbar_width = 100 - e1.width();
			e1.parent().remove();
		}
	});
	$.jstree.plugin("ui", {
		__init : function () { 
			this.data.ui.selected = $(); 
			this.data.ui.last_selected = false; 
			this.data.ui.hovered = null;
			this.data.ui.to_select = this.get_settings().ui.initially_select;

			this.get_container()
				.delegate("a", "click.jstree", $.proxy(function (event) {
						event.preventDefault();
						event.currentTarget.blur();//focus 제거
						//target 이 jstree-loading class 없으면 선택
						if(!$(event.currentTarget).hasClass("jstree-loading")) { 
							this.select_node(event.currentTarget, true, event);//선택
						}
					}, this))
				.delegate("a", "mouseenter.jstree", $.proxy(function (event) {
						if(!$(event.currentTarget).hasClass("jstree-loading")) {
							this.hover_node(event.target);//마우스 위로 올리면
						}
					}, this))
				.delegate("a", "mouseleave.jstree", $.proxy(function (event) {
						if(!$(event.currentTarget).hasClass("jstree-loading")) {
							this.dehover_node(event.target);//마우스 가 영역에 나오면
						}
					}, this))
				.bind("reopen.jstree", $.proxy(function () { 
						this.reselect();
					}, this))
				.bind("get_rollback.jstree", $.proxy(function () { 
						this.dehover_node();
						this.save_selected();
					}, this))
				.bind("set_rollback.jstree", $.proxy(function () { 
						this.reselect();
					}, this))
				.bind("close_node.jstree", $.proxy(function (event, data) { 
						var s = this._get_settings().ui,
							obj = this._get_node(data.rslt.obj),
							clk = (obj && obj.length) ? obj.children("ul").find("a.jstree-clicked") : $(),
							_this = this;
						if(s.selected_parent_close === false || !clk.length) { 
							return; 
						}
						clk.each(function () { 
							_this.deselect_node(this);
							if(s.selected_parent_close === "select_parent") { 
								_this.select_node(obj); 
							}
						});
					}, this))
				.bind("delete_node.jstree", $.proxy(function (event, data) { 
						var s = this._get_settings().ui.select_prev_on_delete,
							obj = this._get_node(data.rslt.obj),
							clk = (obj && obj.length) ? obj.find("a.jstree-clicked") : [],
							_this = this;
							
						//click 한 node 삭제
						clk.each(function () { 
							_this.deselect_node(this); 
						});
						if(s && clk.length) { 
							data.rslt.prev.each(function () { 
								/* if return false is removed all prev nodes will be selected */
								if(this.parentNode) { 
									_this.select_node(this); return false;
								}
							});
						}
					}, this))
				.bind("move_node.jstree", $.proxy(function (event, data) { 
						if(data.rslt.cy) { 
							data.rslt.oc.find("a.jstree-clicked").removeClass("jstree-clicked");
						}
					}, this));
		},
		defaults : {
			select_limit : -1, // 0, 1, 2 ... or -1 for unlimited
			select_multiple_modifier : "ctrl", // on, or ctrl, shift, alt
			select_range_modifier : "shift",
			selected_parent_close : "select_parent", // false, "deselect",
														// "select_parent"
			selected_parent_open : true,
			select_prev_on_delete : true,
			disable_selecting_children : false,
			initially_select : []
		},
		_fn : { 
			_get_node : function (obj, allow_multiple) {
				if(typeof obj === "undefined" || obj === null) { // obj 가 null 이라면 allow_multiple 값에 따라
					return allow_multiple ? this.data.ui.selected : this.data.ui.last_selected; 
				}
				var $obj = $(obj, this.get_container()); 
				
				if($obj.is(".jstree") || obj == -1) {
					return -1; 
				}
				
				$obj = $obj.closest("li", this.get_container()); 
				return $obj.length ? $obj : false; 
			},
			_ui_notify : function (n, data) {
				if(data.selected) {
					this.select_node(n, false);
				}
			},
			save_selected : function () {
				var _this = this;
				this.data.ui.to_select = [];
				this.data.ui.selected.each(function () {//선택되어있는 node to_select에 id값 모두 push
					if(this.id) { 
						_this.data.ui.to_select.push("#" + this.id.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:")); } 
					}
				);
				this.__callback(this.data.ui.to_select);
			},
			reselect : function () {
				var _this = this,
					s = this.data.ui.to_select;
				s = $.map($.makeArray(s), function (n) { 
						return "#" + n.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:"); 
					});
				// this.deselect_all(); WHY deselect, breaks plugin state
				// notifier?
				$.each(s, function (i, val) { // select_node id값 넣기
					if(val && val !== "#") { 
						_this.select_node(val); 
					} 
				});
				this.data.ui.selected = this.data.ui.selected.filter(function () { return this.parentNode; });
				this.__callback();
			},
			refresh : function (obj) {
				this.save_selected();
				return this.__call_old();
			},
			hover_node : function (obj) {
				obj = this._get_node(obj);
				if(!obj.length) { 
					return false; 
				}
				// if(this.data.ui.hovered && obj.get(0) ===
				// this.data.ui.hovered.get(0)) { return; }
				if(!obj.hasClass("jstree-hovered")) { 
					this.dehover_node(); 
				}
				
				// node의 자식 a태그에 jstree-hovered 추가하고 바로위 부모 태그 값
				this.data.ui.hovered = obj.children("a").addClass("jstree-hovered").parent();
				this._fix_scroll(obj);
				this.__callback({ "obj" : obj });
			},
			dehover_node : function () {
				var obj = this.data.ui.hovered, // hovered 되어 있는 li 객체 가져오기
					p;
				if(!obj || !obj.length) {// obj 없으면 리턴
					return false; 
				}
				
				// hovered 제거
				p = obj.children("a").removeClass("jstree-hovered").parent(); 
				
				if(this.data.ui.hovered[0] === p[0]) {// 마지막 hovered 라면 null
					this.data.ui.hovered = null; 
				}
				
				this.__callback({ "obj" : obj });
			},
			select_node : function (obj, check, e) {
				obj = this._get_node(obj);
				
				if(obj == -1 || !obj || !obj.length) { 
					return false; 
				}
				
				var s = this._get_settings().ui,
					is_multiple = (s.select_multiple_modifier == "on" || (s.select_multiple_modifier !== false && e && e[s.select_multiple_modifier + "Key"])),
					is_range = (s.select_range_modifier !== false && e && e[s.select_range_modifier + "Key"] && this.data.ui.last_selected && this.data.ui.last_selected[0] !== obj[0] && this.data.ui.last_selected.parent()[0] === obj.parent()[0]),
					is_selected = this.is_selected(obj),
					proceed = true,
					t = this;
				
				if(check) {
					if(s.disable_selecting_children && is_multiple && 
						(
							(obj.parentsUntil(".jstree","li").children("a.jstree-clicked").length) || // li a .jstree-clicked 개수
							(obj.children("ul").find("a.jstree-clicked:eq(0)").length)// ul a .jstree-clicked 첫번째 개수
						)
					) { // if 시작
						return false;
					}
					
					proceed = false;
					switch(!0) {
						case (is_range):
							this.data.ui.last_selected.addClass("jstree-last-selected");
						
							// last_selected 인덱스가 크면 next
							obj = obj[ obj.index() < this.data.ui.last_selected.index() ? "nextUntil" : "prevUntil" ](".jstree-last-selected").andSelf();
							if(s.select_limit == -1 || obj.length < s.select_limit) {
								this.data.ui.last_selected.removeClass("jstree-last-selected");
								this.data.ui.selected.each(function () {
									if(this !== t.data.ui.last_selected[0]) { t.deselect_node(this); }
								});
								is_selected = false;
								proceed = true;
							}else {
								proceed = false;
							}
							break;
						case (is_selected && !is_multiple): // 선택되어 있고 멀티선택이 아니라면
							this.deselect_all(); // 모두 선택 해제
							is_selected = false; 
							proceed = true;
							break;
						case (!is_selected && !is_multiple):  // 선택이 안되어있고 멀티 선택이 아니면
							if(s.select_limit == -1 || s.select_limit > 0) {
								this.deselect_all();// 모두 선택 해제
								proceed = true;
							}
							break;
						case (is_selected && is_multiple): // 선택되어 있고 멀티선택이라면
							this.deselect_node(obj); // 선택 해제
							break;
						case (!is_selected && is_multiple): // 선택이 안되어 있고 멀티 샌택이라면
							
							// settings 중 최대 선택 수가 -1 이거나
							// 선택된 객체 수가 settings 에 설정된 값보다 작을시
							if(s.select_limit == -1 || this.data.ui.selected.length + 1 <= s.select_limit) { 
								proceed = true;
							}
							break;
					}
				}
				if(proceed && !is_selected) {
					if(!is_range) { 
						this.data.ui.last_selected = obj; // li 객체 set
					}
					// li > a 태그에 jstree-clicked 추가
					obj.children("a").addClass("jstree-clicked"); 
					if(s.selected_parent_open) {// 부모가 open 되어 있으면
						// 부모중 closed 되어 있으면 open
						obj.parents(".jstree-closed").each(function () { 
							t.open_node(this, false, true); }
						);
					}
					
					// 부모중 closed 되어 있으면 open
					this.data.ui.selected = this.data.ui.selected.add(obj);
					
					// 부모중 closed 되어 있으면 open
					this._fix_scroll(obj.eq(0)); 
					this.__callback({ "obj" : obj, "e" : e });
				}
			},
			_fix_scroll : function (obj) { // 아아아아아아 계산하기 싫다......
				var c = this.get_container()[0], // div
					t;
				// scrollHeight === height, offsetHeight === height + border
				if(c.scrollHeight > c.offsetHeight) { 
					obj = this._get_node(obj);
					if(!obj || obj === -1 || !obj.length || !obj.is(":visible")) { 
						return; 
					}
					
					t = obj.offset().top - this.get_container().offset().top;
					
					if(t < 0) { 
						c.scrollTop = c.scrollTop + t - 1; 
					}
					
					if(t + this.data.core.li_height + (c.scrollWidth > c.offsetWidth ? scrollbar_width : 0) > c.offsetHeight) { 
						c.scrollTop = c.scrollTop + (t - c.offsetHeight + this.data.core.li_height + 1 + (c.scrollWidth > c.offsetWidth ? scrollbar_width : 0)); 
					}
				}
			},
			deselect_node : function (obj) {
				obj = this._get_node(obj);
				
				if(!obj.length) { 
					return false; 
				}
				
				if(this.is_selected(obj)) {// selected 되어 있으면
					// a 에 jstree-clicked 삭제
					obj.children("a").removeClass("jstree-clicked");
					
					// scrollHeight === height, offsetHeight === height + border
					this.data.ui.selected = this.data.ui.selected.not(obj);
					
					if(this.data.ui.last_selected.get(0) === obj.get(0)) { 
						this.data.ui.last_selected = this.data.ui.selected.eq(0); 
					}
					
					this.__callback({ "obj" : obj });
				}
			},
			toggle_select : function (obj) {// select_node,deselect_node toggle
				obj = this._get_node(obj);
				if(!obj.length) { 
					return false; 
				}
				
				if(this.is_selected(obj)) { 
					this.deselect_node(obj); 
				} else { 
					this.select_node(obj); 
				}
			},
			is_selected : function (obj) { // 선택한 객체중 obj 의 객체가 존재하면
				return this.data.ui.selected.index(this._get_node(obj)) >= 0;  
			},
			get_selected : function (context) { 
				// context 있으면 context에서 a.jstree-clicked 의 부모 리턴, 아니면 선택하객체 리턴
				return context ? $(context).find("a.jstree-clicked").parent() : this.data.ui.selected; 
			},
			deselect_all : function (context) { // data 초기화
				var ret = context ? $(context).find("a.jstree-clicked").parent() : this.get_container().find("a.jstree-clicked").parent();
				ret.children("a.jstree-clicked").removeClass("jstree-clicked");
				this.data.ui.selected = $([]); // selected 초기화
				this.data.ui.last_selected = false;
				this.__callback({ "obj" : ret });
			}
		}
	});
	// include the selection plugin by default
	$.jstree.defaults.plugins.push("ui");
})(jQuery);
// */

/*
 * jsTree CRRM plugin Handles creating/renaming/removing/moving nodes by user
 * interaction.
 */
(function ($) {
	$.jstree.plugin("crrm", { 
		__init : function () {
			this.get_container()
				.bind("move_node.jstree", $.proxy(function (e, data) {
					if(this._get_settings().crrm.move.open_onmove) {
						var t = this;
						data.rslt.np.parentsUntil(".jstree").andSelf().filter(".jstree-closed").each(function () {
							t.open_node(this, false, true);
						});
					}
				}, this));
		},
		defaults : {
			input_width_limit : 200,
			move : {
				always_copy			: false, // false, true or "multitree"
				open_onmove			: true,
				default_position	: "last",
				check_move			: function (m) { return true; }
			}
		},
		_fn : {
			_show_input : function (obj, callback) {
				obj = this._get_node(obj);
				var rtl = this._get_settings().core.rtl,
					w = this._get_settings().crrm.input_width_limit,
					w1 = obj.children("ins").width(),
					w2 = obj.find("> a:visible > ins").width() * obj.find("> a:visible > ins").length,
					t = this.get_text(obj),
					h1 = $("<div />", { css : { "position" : "absolute", "top" : "-200px", "left" : (rtl ? "0px" : "-1000px"), "visibility" : "hidden" } }).appendTo("body"),
					h2 = obj.css("position","relative").append(
					$("<input />", { 
						"value" : t,
						"class" : "jstree-rename-input",
						// "size" : t.length,
						"css" : {
							"padding" : "0",
							"border" : "1px solid silver",
							"position" : "absolute",
							"left"  : (rtl ? "auto" : (w1 + w2 + 4) + "px"),
							"right" : (rtl ? (w1 + w2 + 4) + "px" : "auto"),
							"top" : "0px",
							"height" : (this.data.core.li_height - 2) + "px",
							"lineHeight" : (this.data.core.li_height - 2) + "px",
							"width" : "150px" // will be set a bit further
												// down
						},
						"blur" : $.proxy(function () {
							var i = obj.children(".jstree-rename-input"),
								v = i.val();
							if(v === "") { v = t; }
							h1.remove();
							i.remove(); // rollback purposes
							this.set_text(obj,t); // rollback purposes
							this.rename_node(obj, v);
							callback.call(this, obj, v, t);
							obj.css("position","");
						}, this),
						"keyup" : function (event) {
							var key = event.keyCode || event.which;
							if(key == 27) { 
								this.value = t; this.blur(); return; 
							}else if(key == 13) { 
								this.blur(); return; 
							}else {
								h2.width(Math.min(h1.text("pW" + this.value).width(),w));
							}
						},
						"keypress" : function(event) {
							var key = event.keyCode || event.which;
							if(key == 13) { // 엔터
								return false; 
							}
						}
					})
				).children(".jstree-rename-input"); 
				this.set_text(obj, "");
				h1.css({
						fontFamily		: h2.css('fontFamily')		|| '',
						fontSize		: h2.css('fontSize')		|| '',
						fontWeight		: h2.css('fontWeight')		|| '',
						fontStyle		: h2.css('fontStyle')		|| '',
						fontStretch		: h2.css('fontStretch')		|| '',
						fontVariant		: h2.css('fontVariant')		|| '',
						letterSpacing	: h2.css('letterSpacing')	|| '',
						wordSpacing		: h2.css('wordSpacing')		|| ''
				});
				h2.width(Math.min(h1.text("pW" + h2[0].value).width(),w))[0].select();
			},
			rename : function (obj) {
				obj = this._get_node(obj);
				this.__rollback();
				var f = this.__callback;
				
				// a태그를 input으로 변경
				this._show_input(obj, function (obj, new_name, old_name) { 
					f.call(this, { "obj" : obj, "new_name" : new_name, "old_name" : old_name });
				});
			},
			create : function (obj, position, js, callback, skip_rename) {
				var t, _this = this;
				obj = this._get_node(obj); // li 객체
				
				if(!obj) { 
					obj = -1; 
				}
				
				this.__rollback();
				
				// core create_node 호출 (콜백 익명함수)
				t = this.create_node(obj, position, js, function (t) { 
					var p = this._get_parent(t), // 부모 노드
						pos = $(t).index();
					
					if(callback) { // 왜 있는지 모르겠음 실행하면 오류
						allback.call(this, t);  
					}
					
					// close 되어 있으면 open
					if(p.length && p.hasClass("jstree-closed")) {
						this.open_node(p, false, true); 
					}
					
					if(!skip_rename) { // node 이름 변경 할수 있게 이벤트 분기
						// t : 새로 생성된 node
						this._show_input(t, function (obj, new_name, old_name) { 
							_this.__callback({ "obj" : obj, "name" : new_name, "parent" : p, "position" : pos });
						});
					}else { 
						_this.__callback({ "obj" : t, "name" : this.get_text(t), "parent" : p, "position" : pos }); 
					}
				});
				return t;
			},
			remove : function (obj) {
				obj = this._get_node(obj, true);
				var p = this._get_parent(obj), 
					prev = this._get_prev(obj);
				
				this.__rollback();
				
				obj = this.delete_node(obj);// 삭제
				
				if(obj !== false) { 
					this.__callback({ "obj" : obj, "prev" : prev, "parent" : p }); 
				}
			},
			check_move : function () {
				
				if(!this.__call_old()) { 
					return false; 
				}
				
				var s = this._get_settings().crrm.move;
				
				if(!s.check_move.call(this, this._get_move())) { 
					return false; 
				}
				
				return true;
			},
			move_node : function (obj, ref, position, is_copy, is_prepared, skip_check) {
				var s = this._get_settings().crrm.move; // setting 정보
				
				if(!is_prepared) { 
					
					// position 없으면 setting 에서 설정한 기본값
					if(typeof position === "undefined") { 
						position = s.default_position; 
					}
					
					if(position === "inside" && !s.default_position.match(/^(before|after)$/)) { 
						position = s.default_position; 
					}
					
					return this.__call_old(true, obj, ref, position, is_copy, false, skip_check);
				}
				// if the move is already prepared
				if(s.always_copy === true || (s.always_copy === "multitree" && obj.rt.get_index() !== obj.ot.get_index() )) {
					is_copy = true;
				}
				
				// core move_node 실행
				this.__call_old(true, obj, ref, position, is_copy, true, skip_check);
			},

			cut : function (obj) {// 자르기
				obj = this._get_node(obj, true);
				
				if(!obj || !obj.length) { 
					return false; 
				}
				
				this.data.crrm.cp_nodes = false;
				this.data.crrm.ct_nodes = obj;
				this.__callback({ "obj" : obj });
			},
			copy : function (obj) {// 복사
				obj = this._get_node(obj, true);
				if(!obj || !obj.length) { 
					return false; 
				}
				
				this.data.crrm.ct_nodes = false;
				this.data.crrm.cp_nodes = obj;
				this.__callback({ "obj" : obj });
			},
			paste : function (obj) { // 붙여넣기
				obj = this._get_node(obj);
				
				if(!obj || !obj.length) { 
					return false; 
				}
				
				// copy cut 한 객체 가져오기
				var nodes = this.data.crrm.ct_nodes ? this.data.crrm.ct_nodes : this.data.crrm.cp_nodes;
				
				// copy cut 둘단 없으면 리턴
				if(!this.data.crrm.ct_nodes && !this.data.crrm.cp_nodes) { 
					return false; 
				}
				
				if(this.data.crrm.ct_nodes) {// cut 것을 obj 로 이동
					this.move_node(this.data.crrm.ct_nodes, obj); 
					this.data.crrm.ct_nodes = false; 
				}
				
				if(this.data.crrm.cp_nodes) {// copy 한것을 obj로
					this.move_node(this.data.crrm.cp_nodes, obj, false, true); 
				}
				
				this.__callback({ "obj" : obj, "nodes" : nodes });
			}
		}
	});
	// include the crr plugin by default
	// $.jstree.defaults.plugins.push("crrm");
})(jQuery);
// */

/*
 * jsTree themes plugin Handles loading and setting themes, as well as detecting
 * path to themes, etc.
 */
(function ($) {
	var themes_loaded = [];
	// this variable stores the path to the themes folder - if left as false -
	// it will be autodetected
	$.jstree._themes = false;
	$.jstree.plugin("themes", {
		__init : function () { 
			this.get_container()
				.bind("init.jstree", $.proxy(function () {
						var s = this._get_settings().themes;
						this.data.themes.dots = s.dots; 
						this.data.themes.icons = s.icons; 
						this.set_theme(s.theme, s.url);
					}, this))
				.bind("loaded.jstree", $.proxy(function () {
						// bound here too, as simple HTML tree's won't honor
						// dots & icons otherwise
						if(!this.data.themes.dots) { this.hide_dots(); }
						else { this.show_dots(); }
						if(!this.data.themes.icons) { this.hide_icons(); }
						else { this.show_icons(); }
					}, this));
		},
		defaults : { 
			theme : "default", 
			url : false,
			dots : true,
			icons : true
		},
		_fn : {
			set_theme : function (theme_name, theme_url) {
				if(!theme_name) { 
					return false; 
				}
				
				if(!theme_url) { // css 경로
					theme_url = $.jstree._themes + theme_name + '/style.css'; 
				}
				
				if($.inArray(theme_url, themes_loaded) == -1) {
					$.vakata.css.add_sheet({ "url" : theme_url });
					themes_loaded.push(theme_url);
				}
				if(this.data.themes.theme != theme_name) {
					this.get_container().removeClass('jstree-' + this.data.themes.theme);
					this.data.themes.theme = theme_name;
				}
				this.get_container().addClass('jstree-' + theme_name);
				
				if(!this.data.themes.dots) {// 점선
					this.hide_dots(); 
				}else { 
					this.show_dots(); 
				}
				
				if(!this.data.themes.icons) { // 아이콘
					this.hide_icons(); 
				}else { 
					this.show_icons(); 
				}
				
				this.__callback();
			},
			get_theme	: function () { return this.data.themes.theme; },

			show_dots	: function () { this.data.themes.dots = true; this.get_container().children("ul").removeClass("jstree-no-dots"); },
			hide_dots	: function () { this.data.themes.dots = false; this.get_container().children("ul").addClass("jstree-no-dots"); },
			toggle_dots	: function () { if(this.data.themes.dots) { this.hide_dots(); } else { this.show_dots(); } },

			show_icons	: function () { this.data.themes.icons = true; this.get_container().children("ul").removeClass("jstree-no-icons"); },
			hide_icons	: function () { this.data.themes.icons = false; this.get_container().children("ul").addClass("jstree-no-icons"); },
			toggle_icons: function () { if(this.data.themes.icons) { this.hide_icons(); } else { this.show_icons(); } }
		}
	});
	// autodetect themes path
	$(function () {
		if($.jstree._themes === false) {
			$("script").each(function () { 
				if(this.src.toString().match(/jquery\.jstree[^\/]*?\.js(\?.*)?$/)) { 
					$.jstree._themes = this.src.toString().replace(/jquery\.jstree[^\/]*?\.js(\?.*)?$/, "") + 'themes/'; 
					return false; 
				}
			});
		}
		if($.jstree._themes === false) { $.jstree._themes = "themes/"; }
	});
	// include the themes plugin by default
	$.jstree.defaults.plugins.push("themes");
})(jQuery);
// */

/*
 * jsTree hotkeys plugin Enables keyboard navigation for all tree instances
 * Depends on the jstree ui & jquery hotkeys plugins
 */
(function ($) {
	var bound = [];
	function exec(i, event) {
		var f = $.jstree._focused(), tmp;
		if(f && f.data && f.data.hotkeys && f.data.hotkeys.enabled) { 
			tmp = f._get_settings().hotkeys[i];
			if(tmp) { return tmp.call(f, event); }
		}
	}
	$.jstree.plugin("hotkeys", {
		__init : function () {
			if(typeof $.hotkeys === "undefined") { // jquery hotkeys 플러그인 필요
				throw "jsTree hotkeys: jQuery hotkeys plugin not included."; 
			}
			
			if(!this.data.ui) { // ui 플러그인 필요
				throw "jsTree hotkeys: jsTree UI plugin not included."; 
			}
			
			$.each(this._get_settings().hotkeys, function (i, v) {
				if(v !== false && $.inArray(i, bound) == -1) {
					$(document).bind("keydown", i, function (event) { return exec(i, event); });
					bound.push(i);
				}
			});
			this.get_container()
				.bind("lock.jstree", $.proxy(function () {
						if(this.data.hotkeys.enabled) { this.data.hotkeys.enabled = false; this.data.hotkeys.revert = true; }
					}, this))
				.bind("unlock.jstree", $.proxy(function () {
						if(this.data.hotkeys.revert) { this.data.hotkeys.enabled = true; }
					}, this));
			this.enable_hotkeys();
		},
		defaults : {
			"up" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected || -1;
				this.hover_node(this._get_prev(o));
				return false; 
			},
			"ctrl+up" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected || -1;
				this.hover_node(this._get_prev(o));
				return false; 
			},
			"shift+up" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected || -1;
				this.hover_node(this._get_prev(o));
				return false; 
			},
			"down" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected || -1;
				this.hover_node(this._get_next(o));
				return false;
			},
			"ctrl+down" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected || -1;
				this.hover_node(this._get_next(o));
				return false;
			},
			"shift+down" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected || -1;
				this.hover_node(this._get_next(o));
				return false;
			},
			"left" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected;
				if(o) {
					if(o.hasClass("jstree-open")) { this.close_node(o); }
					else { this.hover_node(this._get_prev(o)); }
				}
				return false;
			},
			"ctrl+left" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected;
				if(o) {
					if(o.hasClass("jstree-open")) { this.close_node(o); }
					else { this.hover_node(this._get_prev(o)); }
				}
				return false;
			},
			"shift+left" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected;
				if(o) {
					if(o.hasClass("jstree-open")) { this.close_node(o); }
					else { this.hover_node(this._get_prev(o)); }
				}
				return false;
			},
			"right" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected;
				if(o && o.length) {
					if(o.hasClass("jstree-closed")) { this.open_node(o); }
					else { this.hover_node(this._get_next(o)); }
				}
				return false;
			},
			"ctrl+right" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected;
				if(o && o.length) {
					if(o.hasClass("jstree-closed")) { this.open_node(o); }
					else { this.hover_node(this._get_next(o)); }
				}
				return false;
			},
			"shift+right" : function () { 
				var o = this.data.ui.hovered || this.data.ui.last_selected;
				if(o && o.length) {
					if(o.hasClass("jstree-closed")) { this.open_node(o); }
					else { this.hover_node(this._get_next(o)); }
				}
				return false;
			},
			"space" : function () { 
				if(this.data.ui.hovered) { this.data.ui.hovered.children("a:eq(0)").click(); } 
				return false; 
			},
			"ctrl+space" : function (event) { 
				event.type = "click";
				if(this.data.ui.hovered) { this.data.ui.hovered.children("a:eq(0)").trigger(event); } 
				return false; 
			},
			"shift+space" : function (event) { 
				event.type = "click";
				if(this.data.ui.hovered) { this.data.ui.hovered.children("a:eq(0)").trigger(event); } 
				return false; 
			},
			"f2" : function () { this.rename(this.data.ui.hovered || this.data.ui.last_selected); },
			"del" : function () { this.remove(this.data.ui.hovered || this._get_node(null)); }
		},
		_fn : {
			enable_hotkeys : function () {
				this.data.hotkeys.enabled = true;
			},
			disable_hotkeys : function () {
				this.data.hotkeys.enabled = false;
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree JSON plugin The JSON data store. Datastores are build by overriding
 * the `load_node` and `_is_loaded` functions.
 */
(function ($) {
	$.jstree.plugin("json_data", {
		__init : function() {
			var s = this._get_settings().json_data;
			if(s.progressive_unload) {
				this.get_container().bind("after_close.jstree", function (e, data) {
					data.rslt.obj.children("ul").remove();
				});
			}
		},
		defaults : { 
			// `data` can be a function:
			// * accepts two arguments - node being loaded and a callback to
			// pass the result to
			// * will be executed in the current tree's scope & ajax won't be
			// supported
			data : false, 
			ajax : false,
			correct_state : true,
			progressive_render : false,
			progressive_unload : false
		},
		_fn : {
			load_node : function (obj, s_call, e_call) { 
				var _this = this; 
				this.load_node_json(obj, function () { 
					_this.__callback({ "obj" : _this._get_node(obj)}); 
					s_call.call(this); 
					}, e_call); 
			},
			_is_loaded : function (obj) { 
				var s = this._get_settings().json_data;
				obj = this._get_node(obj); 
				return obj == -1 || !obj || (!s.ajax && !s.progressive_render && !$.isFunction(s.data)) || obj.is(".jstree-open, .jstree-leaf") || obj.children("ul").children("li").length > 0;
			},
			refresh : function (obj) {
				obj = this._get_node(obj);
				var s = this._get_settings().json_data;
				if(obj && obj !== -1 && s.progressive_unload && ($.isFunction(s.data) || !!s.ajax)) {
					obj.removeData("jstree_children");
				}
				return this.__call_old();
			},
			load_node_json : function (obj, s_call, e_call) {
				var s = this.get_settings().json_data,// 클라이언트 데이터
					d,
					error_func = function () {},
					success_func = function () {};
					
				obj = this._get_node(obj);

				if(obj && obj !== -1 && (s.progressive_render || s.progressive_unload) && !obj.is(".jstree-open, .jstree-leaf") && obj.children("ul").children("li").length === 0 && obj.data("jstree_children")) {
					d = this._parse_json(obj.data("jstree_children"), obj);
					if(d) {
						obj.append(d);
						if(!s.progressive_unload) { 
							obj.removeData("jstree_children"); 
						}
					}
					this.clean_node(obj);
					if(s_call) { 
						s_call.call(this); 
					}
					return;
				}

				if(obj && obj !== -1) {
					if(obj.data("jstree_is_loading")) { 
						return; 
					}else { 
						obj.data("jstree_is_loading",true); 
					}
				}
				switch(!0) {
					case (!s.data && !s.ajax): throw "Neither data nor ajax settings supplied.";
					// function option added here for easier model integration
					// (also supporting async - see callback)
					case ($.isFunction(s.data)):// 함수이면
						s.data.call(this, obj, $.proxy(function (d) {
							d = this._parse_json(d, obj);
							if(!d) { 
								if(obj === -1 || !obj) {
									if(s.correct_state) { 
										this.get_container().children("ul").empty(); 
									}
								}else {
									obj.children("a.jstree-loading").removeClass("jstree-loading");
									obj.removeData("jstree_is_loading");
									if(s.correct_state) { 
										this.correct_state(obj); 
									}
								}
								
								if(e_call) { 
									e_call.call(this); 
								}
							}else {
								if(obj === -1 || !obj) { 
									this.get_container().children("ul").empty().append(d.children()); 
								}else { 
									obj.append(d).children("a.jstree-loading").removeClass("jstree-loading"); obj.removeData("jstree_is_loading"); 
								}
								
								this.clean_node(obj);
								
								if(s_call) { 
									s_call.call(this); 
								}
							}
						}, this));
						break;
						// data 가 있고 ajax 아니면
					case (!!s.data && !s.ajax) || (!!s.data && !!s.ajax && (!obj || obj === -1)):
						if(!obj || obj == -1) {
							//json 을 태그로 변경
							d = this._parse_json(s.data, obj);
							if(d) {
								//최상위 node를 json 데이터로 변경 
								this.get_container().children("ul").empty().append(d.children());
								this.clean_node();
							}else { 
								if(s.correct_state) { 
									this.get_container().children("ul").empty(); 
								}
							}
						}
						
						if(s_call) { 
							s_call.call(this); 
						}
						break;
					case (!s.data && !!s.ajax) || (!!s.data && !!s.ajax && obj && obj !== -1):
						error_func = function (x, t, e) {
							var ef = this.get_settings().json_data.ajax.error; 
							if(ef) { // error 콜백 함수 실행ㄴ
								ef.call(this, x, t, e); 
							}
							
							//obj 객체가 있으면
							if(obj != -1 && obj.length) {
								//a 태그에서 jstree-loading class 제거
								obj.children("a.jstree-loading").removeClass("jstree-loading");
								//data 제거
								obj.removeData("jstree_is_loading");
								
								if(t === "success" && s.correct_state) { 
									this.correct_state(obj); 
								}
								
							}else {
								if(t === "success" && s.correct_state) { 
									this.get_container().children("ul").empty(); 
								}
							}
							
							if(e_call) { 
								e_call.call(this); 
							}
						};
						success_func = function (d, t, x) {
							// 클라이언트에서 설정한 콜백함수
							var sf = this.get_settings().json_data.ajax.success;
							
							//setting 에 success 함수가 있으면 호출
							if(sf) { 
								d = sf.call(this,d,t,x) || d; 
							}
							
							if(d === "" || (d && d.toString && d.toString().replace(/^[\s\n]+$/,"") === "") || (!$.isArray(d) && !$.isPlainObject(d))) {
								return error_func.call(this, x, t, "");
							}
							
							d = this._parse_json(d, obj);
							
							if(d) {
								if(obj === -1 || !obj) {// obj 가 없으면 최상위에 삽입
									this.get_container().children("ul").empty().append(d.children()); 
								}else { // obj 자식으로 삽입
									obj.append(d).children("a.jstree-loading").removeClass("jstree-loading"); 
									obj.removeData("jstree_is_loading"); 
								}
								
								this.clean_node(obj);// 노드 정럴
								
								if(s_call) { 
									s_call.call(this); 
								}
							}else {
								if(obj === -1 || !obj) {// obj 가 없으면
									if(s.correct_state) { // setting 에서 값이 있으면
										
										this.get_container().children("ul").empty();// 최상위 노드 제거
										
										if(s_call) { 
											s_call.call(this); 
										}
									}
								}else {
									obj.children("a.jstree-loading").removeClass("jstree-loading");
									obj.removeData("jstree_is_loading");
									if(s.correct_state) { 
										this.correct_state(obj);// 하위노드 제거
										if(s_call) { 
											s_call.call(this); 
										} 
									}
								}
							}
						};
						
						s.ajax.context = this;
						s.ajax.error = error_func;
						s.ajax.success = success_func;
						
						if(!s.ajax.dataType) { 
							s.ajax.dataType = "json"; 
						}
						
						if($.isFunction(s.ajax.url)) { 
							s.ajax.url = s.ajax.url.call(this, obj); 
						}
						
						if($.isFunction(s.ajax.data)) { 
							s.ajax.data = s.ajax.data.call(this, obj); 
						}
						
						$.ajax(s.ajax);
						break;
				}
			},
			_parse_json : function (js, obj, is_callback) {// json 데이터를 li 객체로 변경
				var d = false, 
					p = this._get_settings(),
					s = p.json_data,
					t = p.core.html_titles,
					tmp, 
					i, 
					j, 
					ul1, 
					ul2;

				if(!js) { // js 는 클라이언트 data
					return d; 
				}
				
				// json_data.progressive_unload, obj 가 있으면 data추가
				if(s.progressive_unload && obj && obj !== -1) { 
					obj.data("jstree_children", d);
				}
				
				// js 배열이면
				if($.isArray(js)) {
					d = $();
					
					if(!js.length) {// 크기가 0이면 리턴
						return false; 
					}
					
					for(i = 0, j = js.length; i < j; i++) {
						// json 데이터가 배열이기 때문에 하나씩 재귀호출
						tmp = this._parse_json(js[i], obj, true); 
						
						if(tmp.length) { // tmp(li element) 있으면 d에 추가
							d = d.add(tmp); 
						}
					}
				}else {// 클라이언트 json_data 를 li 객체 로 변경
					if(typeof js == "string") {// js가 문자열이면
						js = { data : js }; 
					}
					
					if(!js.data && js.data !== "") {// js.data 없거나 "" 아니면 d 리턴
						return d; 
					}
					
					d = $("<li />");
					
					if(js.attr) {// js 속성을 li추가
						d.attr(js.attr); 
					}
					
					if(js.metadata) { // data
						d.data(js.metadata); 
					}
					
					if(js.state) { 
						d.addClass("jstree-" + js.state); 
					}
					
					if(!$.isArray(js.data)) {// js.data 배열아니면 배열로 변경
						tmp = js.data; 
						js.data = []; 
						js.data.push(tmp); 
					}
					
					$.each(js.data, function (i, m) {
						tmp = $("<a />");
						
						if($.isFunction(m)) { // m 함수이면 함수실행
							m = m.call(this, js); 
						}
						
						if(typeof m == "string") { // 문자이면
							// core.html_titles 있으면 html 없으면 text
							tmp.attr('href','#')[ t ? "html" : "text" ](m);
						}else {
							if(!m.attr) { // m.attr 없으면 비어있는 객체 생성
								m.attr = {}; 
							}
							
							if(!m.attr.href) { // href 없으면 #
								m.attr.href = '#'; 
							}
							
							// li > a태그에 내용 삽입
							// tmp.attr(m.attr).text(), tmp.attr(m.attr).html()
							tmp.attr(m.attr)[ t ? "html" : "text" ](m.title);
							
							if(m.language) { 
								tmp.addClass(m.language); 
							}
						}
						
						tmp.prepend("<ins class='jstree-icon'>&#160;</ins>");
						
						if(!m.icon && js.icon) { 
							m.icon = js.icon; 
					
						}
						
						if(m.icon) {// icon 기본값 설정및 사용자설정
							if(m.icon.indexOf("/") === -1) { 
								tmp.children("ins").addClass(m.icon); 
							}else { 
								tmp.children("ins").css("background","url('" + m.icon + "') center center no-repeat"); 
							}
						}
						d.append(tmp);
					});
					
					d.prepend("<ins class='jstree-icon'>&#160;</ins>");
					
					if(js.children) { // 자식도 li 객체로 변경
						if(s.progressive_render && js.state !== "open") {
							d.addClass("jstree-closed").data("jstree_children", js.children);
						}else {
							if(s.progressive_unload) { 
								d.data("jstree_children", js.children); 
							}
							if($.isArray(js.children) && js.children.length) {
								tmp = this._parse_json(js.children, obj, true);
								if(tmp.length) {
									ul2 = $("<ul />");
									ul2.append(tmp);
									d.append(ul2);
								}
							}
						}
					}
				}
				if(!is_callback) {
					ul1 = $("<ul />");
					ul1.append(d);
					d = ul1;
				}
				return d;
			},
			get_json : function (obj, li_attr, a_attr, is_callback) {
				var result = [], 
					s = this._get_settings(), 
					_this = this,
					tmp1, tmp2, 
					li, 
					a, 
					t, 
					lang;
				
				obj = this._get_node(obj);
				
				if(!obj || obj === -1) {// obj 없으면 최상위 li객체 가져오기
					obj = this.get_container().find("> ul > li"); 
				}
				
				// 배열 검사
				li_attr = $.isArray(li_attr) ? li_attr : [ "id", "class" ];
				
				if(!is_callback && this.data.types) { 
					li_attr.push(s.types.type_attr); 
				}
				
				a_attr = $.isArray(a_attr) ? a_attr : [ ];

				obj.each(function () {
					li = $(this);
					tmp1 = { data : [] };
					
					if(li_attr.length) { // li_attr 있으면 temp1.attr 에 빈객체 생성
						tmp1.attr = { }; 
					}
					
					$.each(li_attr, function (i, v) { 
						tmp2 = li.attr(v); // li객체의 속성 값 가져오기
						if(tmp2 && tmp2.length && tmp2.replace(/jstree[^ ]*/ig,'').length) {
							// tmp1.attr 에 속성 값 생성
							tmp1.attr[v] = (" " + tmp2).replace(/ jstree[^ ]*/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,""); 
						}
					});
					
					if(li.hasClass("jstree-open")) { 
						tmp1.state = "open"; 
					}
					
					if(li.hasClass("jstree-closed")) {
						tmp1.state = "closed"; 
					}
					
					// data있으면 metadata 에
					if(li.data()) { 
						tmp1.metadata = li.data(); 
					}
					
					a = li.children("a");
					
					a.each(function () {
						t = $(this);
						if(
							a_attr.length || 
							$.inArray("languages", s.plugins) !== -1 || //languages plugins 사용하면 
							t.children("ins").get(0).style.backgroundImage.length || //아이콘이 이미지라면
							(t.children("ins").get(0).className && t.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').length)
						) { 
							lang = false;
							
							//languages plugins 사용하면
							if($.inArray("languages", s.plugins) !== -1 && $.isArray(s.languages) && s.languages.length) {
								$.each(s.languages, function (l, lv) {
									if(t.hasClass(lv)) {
										lang = lv;
										return false;
									}
								});
							}
							
							tmp2 = { attr : { }, title : _this.get_text(t, lang) }; 
							$.each(a_attr, function (k, z) {//a_attr 을 tmp2 에
								tmp2.attr[z] = (" " + (t.attr(z) || "")).replace(/ jstree[^ ]*/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,"");
							});
							
							//languages plugins 사용하면
							if($.inArray("languages", s.plugins) !== -1 && $.isArray(s.languages) && s.languages.length) {
								$.each(s.languages, function (k, z) {
									if(t.hasClass(z)) { 
										tmp2.language = z; 
										return true; 
									}
								});
							}
							
							if(t.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').replace(/^\s+$/ig,"").length) {
								tmp2.icon = t.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,"");
							}
							
							// 아이콘이 이미지라면
							if(t.children("ins").get(0).style.backgroundImage.length) {
								tmp2.icon = t.children("ins").get(0).style.backgroundImage.replace("url(","").replace(")","");
							}
						}else {
							tmp2 = _this.get_text(t);
						}
						
						if(a.length > 1) { 
							tmp1.data.push(tmp2); 
						}else { 
							tmp1.data = tmp2; 
						}
					});
					
					li = li.find("> ul > li");
					
					if(li.length) {// 자식이 있으면
						tmp1.children = _this.get_json(li, li_attr, a_attr, true); 
					}
					
					result.push(tmp1);
				});
				return result;
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree languages plugin Adds support for multiple language versions in one
 * tree This basically allows for many titles coexisting in one node, but only
 * one of them being visible at any given time This is useful for maintaining
 * the same structure in many languages (hence the name of the plugin)
 */
(function ($) {
	$.jstree.plugin("languages", {
		__init : function () { this._load_css();  },
		defaults : [],
		_fn : {
			set_lang : function (i) { 
				var langs = this._get_settings().languages,
					st = false,
					selector = ".jstree-" + this.get_index() + ' a';
				
				if(!$.isArray(langs) || langs.length === 0) { // setting 중 languages 없으면 리턴
					return false; 
				}
				
				if($.inArray(i,langs) == -1) {
					if(!!langs[i]) {// 값으 있으면
						i = langs[i]; 
					}else { 
						return false; 
					}
				}
				
				if(i == this.data.languages.current_language) {// i 하고 current_language 같으면 리턴
					return true; 
				}
				
				st = $.vakata.css.get_css(selector + "." + this.data.languages.current_language, false, this.data.languages.language_css);
				
				if(st !== false) {
					st.style.display = "none"; 
				}
				
				st = $.vakata.css.get_css(selector + "." + i, false, this.data.languages.language_css);
				
				if(st !== false) { // st true 이면 i
					st.style.display = ""; 
				}
				
				this.data.languages.current_language = i;
				this.__callback(i);
				return true;
			},
			get_lang : function () {
				return this.data.languages.current_language;
			},
			_get_string : function (key, lang) {
				var langs = this._get_settings().languages,
					s = this._get_settings().core.strings;
				
				if($.isArray(langs) && langs.length) {// languages 배열이고 객체 가 있으면
					// lang 가 없으면 current_language
					lang = (lang && $.inArray(lang,langs) != -1) ? lang : this.data.languages.current_language;
				}
				
				if(s[lang] && s[lang][key]) {// setting중 core.strings 에 lang 있고 core.strings[lang][key]이 있으면 리턴
					return s[lang][key]; 
				}
				
				if(s[key]) {// key 로 있으면 리턴
					return s[key]; 
				}
				return key; // 없으면 key 리턴
			},
			get_text : function (obj, lang) {
				obj = this._get_node(obj) || this.data.ui.last_selected;//obj 없으면 마지막 선택된거 가져오기
				
				if(!obj.size()) {//obj 가 없으면 리턴 
					return false; 
				}
				
				var langs = this._get_settings().languages,
					s = this._get_settings().core.html_titles;
				
				if($.isArray(langs) && langs.length) {
					lang = (lang && $.inArray(lang,langs) != -1) ? lang : this.data.languages.current_language;
					obj = obj.children("a." + lang);
				}else { 
					obj = obj.children("a:eq(0)"); 
				}
				
				if(s) {//title 있으면
					obj = obj.clone();//li객체 복사
					obj.children("INS").remove();//ins 태그 제거
					return obj.html();//li객체 html 리턴
				}else {
					obj = obj.contents().filter(function() { return this.nodeType == 3; })[0];
					return obj.nodeValue;//node title 리턴
				}
			},
			set_text : function (obj, val, lang) {
				obj = this._get_node(obj) || this.data.ui.last_selected;
				if(!obj.size()) { 
					return false; 
				}
				var langs = this._get_settings().languages,
					s = this._get_settings().core.html_titles,
					tmp;
				
				if($.isArray(langs) && langs.length) {
					lang = (lang && $.inArray(lang,langs) != -1) ? lang : this.data.languages.current_language;
					obj = obj.children("a." + lang);
				}else { 
					obj = obj.children("a:eq(0)"); 
				}
				
				if(s) {
					tmp = obj.children("INS").clone();
					obj.html(val).prepend(tmp);
					this.__callback({ "obj" : obj, "name" : val, "lang" : lang });
					return true;
				}else {
					obj = obj.contents().filter(function() { 
						return this.nodeType == 3; 
						})[0];
					this.__callback({ "obj" : obj, "name" : val, "lang" : lang });
					return (obj.nodeValue = val);
				}
			},
			_load_css : function () {
				var langs = this._get_settings().languages,
					str = "/* languages css */",
					selector = ".jstree-" + this.get_index() + ' a',
					ln;
				
				if($.isArray(langs) && langs.length) {
					this.data.languages.current_language = langs[0];
					for(ln = 0; ln < langs.length; ln++) {
						str += selector + "." + langs[ln] + " {";
						if(langs[ln] != this.data.languages.current_language) { 
							str += " display:none; "; 
						}
						str += " } ";
					}
					this.data.languages.language_css = $.vakata.css.add_sheet({ 'str' : str, 'title' : "jstree-languages" });
				}
			},
			create_node : function (obj, position, js, callback) {
				var t = this.__call_old(true, obj, position, js, function (t) {
					var langs = this._get_settings().languages,
						a = t.children("a"),
						ln;
					if($.isArray(langs) && langs.length) {
						for(ln = 0; ln < langs.length; ln++) {
							if(!a.is("." + langs[ln])) {
								t.append(a.eq(0).clone().removeClass(langs.join(" ")).addClass(langs[ln]));
							}
						}
						a.not("." + langs.join(", .")).remove();
					}
					if(callback) { callback.call(this, t); }
				});
				return t;
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree cookies plugin Stores the currently opened/selected nodes in a cookie
 * and then restores them Depends on the jquery.cookie plugin
 */
(function ($) {
	$.jstree.plugin("cookies", {
		__init : function () {
			// $.cookie  없으면 error
			if(typeof $.cookie === "undefined") { 
				throw "jsTree cookie: jQuery cookie plugin not included."; 
			}

			var s = this._get_settings().cookies,
				tmp;
			
			//setting 에서 save_loaded 있으면
			if(!!s.save_loaded) {
				tmp = $.cookie(s.save_loaded);
				if(tmp && tmp.length) {//값이 있으면 core.to_load 에 저장 
					this.data.core.to_load = tmp.split(","); 
				}
			}
			//setting 에서 save_opened 있으면
			if(!!s.save_opened) {
				tmp = $.cookie(s.save_opened);
				if(tmp && tmp.length) { 
					this.data.core.to_open = tmp.split(","); 
				}
			}
			if(!!s.save_selected) {
				tmp = $.cookie(s.save_selected);
				if(tmp && tmp.length && this.data.ui) { 
					this.data.ui.to_select = tmp.split(","); 
				}
			}
			this.get_container().one( ( this.data.ui ? "reselect" : "reopen" ) + ".jstree", $.proxy(function () {
					this.get_container().bind("open_node.jstree close_node.jstree select_node.jstree deselect_node.jstree", $.proxy(function (e) { 
								if(this._get_settings().cookies.auto_save) { 
									this.save_cookie((e.handleObj.namespace + e.handleObj.type).replace("jstree","")); 
								}
							}, this));
				}, this));
		},
		defaults : {
			save_loaded		: "jstree_load",
			save_opened		: "jstree_open",
			save_selected	: "jstree_select",
			auto_save		: true,
			cookie_options	: {}
		},
		_fn : {
			save_cookie : function (c) {
				if(this.data.core.refreshing) { 
					return; 
				}
				var s = this._get_settings().cookies;
				
				//c 없으면
				if(!c) { // if called manually and not by event
					if(s.save_loaded) {
						this.save_loaded();
						$.cookie(s.save_loaded, this.data.core.to_load.join(","), s.cookie_options);
					}
					if(s.save_opened) {
						this.save_opened();
						$.cookie(s.save_opened, this.data.core.to_open.join(","), s.cookie_options);
					}
					if(s.save_selected && this.data.ui) {
						this.save_selected();
						$.cookie(s.save_selected, this.data.ui.to_select.join(","), s.cookie_options);
					}
					return;
				}
				
				switch(c) {
					case "open_node":
					case "close_node":
						if(!!s.save_opened) { 
							this.save_opened(); 
							$.cookie(s.save_opened, this.data.core.to_open.join(","), s.cookie_options); 
						}
						if(!!s.save_loaded) { 
							this.save_loaded(); 
							$.cookie(s.save_loaded, this.data.core.to_load.join(","), s.cookie_options); 
						}
						break;
					case "select_node":
					case "deselect_node":
						if(!!s.save_selected && this.data.ui) { 
							this.save_selected(); 
							$.cookie(s.save_selected, this.data.ui.to_select.join(","), s.cookie_options); 
						}
						break;
				}
			}
		}
	});
	// include cookies by default
	// $.jstree.defaults.plugins.push("cookies");
})(jQuery);
// */

/*
 * jsTree sort plugin Sorts items alphabetically (or using any other function)
 */
(function ($) {
	$.jstree.plugin("sort", {
		__init : function () {
			this.get_container()
					//로드후 정렬
				.bind("load_node.jstree", $.proxy(function (e, data) {
						var obj = this._get_node(data.rslt.obj);
						obj = obj === -1 ? this.get_container().children("ul") : obj.children("ul");
						this.sort(obj);
					}, this))
					//이름변경, 생성 하면 정렬 실행
				.bind("rename_node.jstree create_node.jstree create.jstree", $.proxy(function (e, data) {
						this.sort(data.rslt.obj.parent());
					}, this))
					//이동 하면 정렬 실행
				.bind("move_node.jstree", $.proxy(function (e, data) {
						//np 없으면 전체 정렬
						var m = data.rslt.np == -1 ? this.get_container() : data.rslt.np;
						this.sort(m.children("ul"));
					}, this));
		},
		//정렬 조건 default
		defaults : function (a, b) { 
			return this.get_text(a) > this.get_text(b) ? 1 : -1; 
		},
		_fn : {
			sort : function (obj) {
				var s = this._get_settings().sort,//정렬 조건
					t = this;
				//정렬
				obj.append($.makeArray(obj.children("li")).sort($.proxy(s, t)));
				
				//자식 노드도 있으면 정렬
				obj.find("> li > ul").each(function() { 
					t.sort($(this)); 
				});
				
				//class 정리
				this.clean_node(obj);
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree DND plugin Drag and drop plugin for moving/copying nodes
 */
(function ($) {
	var o = false,
		r = false,
		m = false,
		ml = false,
		sli = false,
		sti = false,
		dir1 = false,
		dir2 = false,
		last_pos = false;
	$.vakata.dnd = {
		is_down : false,
		is_drag : false,
		helper : false,
		scroll_spd : 10,
		init_x : 0,
		init_y : 0,
		threshold : 5,
		helper_left : 5,
		helper_top : 10,
		user_data : {},

		drag_start : function (e, data, html) { 
			if($.vakata.dnd.is_drag) { $.vakata.drag_stop({}); }
			try {
				e.currentTarget.unselectable = "on";
				e.currentTarget.onselectstart = function() { return false; };
				if(e.currentTarget.style) { e.currentTarget.style.MozUserSelect = "none"; }
			} catch(err) { }
			$.vakata.dnd.init_x = e.pageX;
			$.vakata.dnd.init_y = e.pageY;
			$.vakata.dnd.user_data = data;
			$.vakata.dnd.is_down = true;
			$.vakata.dnd.helper = $("<div id='vakata-dragged' />").html(html); // .fadeTo(10,0.25);
			$(document).bind("mousemove", $.vakata.dnd.drag);
			$(document).bind("mouseup", $.vakata.dnd.drag_stop);
			return false;
		},
		drag : function (e) { 
			if(!$.vakata.dnd.is_down) { 
				return; 
			}
			
			if(!$.vakata.dnd.is_drag) {
				if(Math.abs(e.pageX - $.vakata.dnd.init_x) > 5 || Math.abs(e.pageY - $.vakata.dnd.init_y) > 5) { 
					$.vakata.dnd.helper.appendTo("body");
					$.vakata.dnd.is_drag = true;
					$(document).triggerHandler("drag_start.vakata", { "event" : e, "data" : $.vakata.dnd.user_data });
				}else { 
					return; 
				}
			}

			// maybe use a scrolling parent element instead of document?
			// thought of adding scroll in order to move the helper, but mouse poisition is n/a
			if(e.type === "mousemove") { 
				var d = $(document), 
					t = d.scrollTop(), 
					l = d.scrollLeft();
				
				if(e.pageY - t < 20) { 
					if(sti && dir1 === "down") { 
						clearInterval(sti); 
						sti = false; 
					}
					if(!sti) { 
						dir1 = "up"; sti = setInterval(function () { 
							$(document).scrollTop($(document).scrollTop() - $.vakata.dnd.scroll_spd); 
						}, 150); 
					}
				}else { 
					if(sti && dir1 === "up") { 
						clearInterval(sti); 
						sti = false; 
					}
				}
				
				if($(window).height() - (e.pageY - t) < 20) {
					if(sti && dir1 === "up") { 
						clearInterval(sti); 
						sti = false; 
					}
					
					if(!sti) { 
						dir1 = "down"; 
						sti = setInterval(function () { 
							$(document).scrollTop($(document).scrollTop() + $.vakata.dnd.scroll_spd); 
						}, 150); 
					}
				}else { 
					if(sti && dir1 === "down") { 
						clearInterval(sti); sti = false; 
					}
				}

				if(e.pageX - l < 20) {
					if(sli && dir2 === "right") { 
						clearInterval(sli); 
						sli = false; 
					}
					
					if(!sli) { 
						dir2 = "left"; 
						sli = setInterval(function () { 
							$(document).scrollLeft($(document).scrollLeft() - $.vakata.dnd.scroll_spd); 
						}, 150); 
					}
				}else { 
					if(sli && dir2 === "left") { 
						clearInterval(sli); 
						sli = false; 
					}
				}
				
				if($(window).width() - (e.pageX - l) < 20) {
					if(sli && dir2 === "left") { 
						clearInterval(sli); 
						sli = false; 
					}
					if(!sli) { 
						dir2 = "right"; 
						sli = setInterval(function () { 
								$(document).scrollLeft($(document).scrollLeft() + $.vakata.dnd.scroll_spd); 
							}, 150); 
					}
				}else { 
					if(sli && dir2 === "right") { 
						clearInterval(sli); 
						sli = false; 
					}
				}
			}

			$.vakata.dnd.helper.css({ left : (e.pageX + $.vakata.dnd.helper_left) + "px", top : (e.pageY + $.vakata.dnd.helper_top) + "px" });
			$(document).triggerHandler("drag.vakata", { "event" : e, "data" : $.vakata.dnd.user_data });
		},
		drag_stop : function (e) {
			if(sli) { clearInterval(sli); }
			if(sti) { clearInterval(sti); }
			$(document).unbind("mousemove", $.vakata.dnd.drag);
			$(document).unbind("mouseup", $.vakata.dnd.drag_stop);
			$(document).triggerHandler("drag_stop.vakata", { "event" : e, "data" : $.vakata.dnd.user_data });
			$.vakata.dnd.helper.remove();
			$.vakata.dnd.init_x = 0;
			$.vakata.dnd.init_y = 0;
			$.vakata.dnd.user_data = {};
			$.vakata.dnd.is_down = false;
			$.vakata.dnd.is_drag = false;
		}
	};
	$(function() {
		var css_string = '#vakata-dragged { display:block; margin:0 0 0 0; padding:4px 4px 4px 24px; position:absolute; top:-2000px; line-height:16px; z-index:10000; } ';
		$.vakata.css.add_sheet({ str : css_string, title : "vakata" });
	});

	$.jstree.plugin("dnd", {
		__init : function () {
			this.data.dnd = {
				active : false,
				after : false,
				inside : false,
				before : false,
				off : false,
				prepared : false,
				w : 0,
				to1 : false,
				to2 : false,
				cof : false,
				cw : false,
				ch : false,
				i1 : false,
				i2 : false,
				mto : false
			};
			this.get_container()
				.bind("mouseenter.jstree", $.proxy(function (e) {
						if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree) {
							if(this.data.themes) {//themes 가있으면
								m.attr("class", "jstree-" + this.data.themes.theme);//m class 변경 
								if(ml) { //ml 있으면 같이 변경
									ml.attr("class", "jstree-" + this.data.themes.theme); 
								}
								$.vakata.dnd.helper.attr("class", "jstree-dnd-helper jstree-" + this.data.themes.theme);
							}
							// if($(e.currentTarget).find("> ul > li").length === 0) {
							if(e.currentTarget === e.target && $.vakata.dnd.user_data.obj && $($.vakata.dnd.user_data.obj).length && $($.vakata.dnd.user_data.obj).parents(".jstree:eq(0)")[0] !== e.target) { // node should not be from the same tree
								var tr = $.jstree._reference(e.target), dc;
								if(tr.data.dnd.foreign) {
									dc = tr._get_settings().dnd.drag_check.call(this, { "o" : o, "r" : tr.get_container(), is_root : true });
									if(dc === true || dc.inside === true || dc.before === true || dc.after === true) {
										$.vakata.dnd.helper.children("ins").attr("class","jstree-ok");
									}
								}else {
									tr.prepare_move(o, tr.get_container(), "last");
									if(tr.check_move()) {
										$.vakata.dnd.helper.children("ins").attr("class","jstree-ok");
									}
								}
							}
						}
					}, this))
				.bind("mouseup.jstree", $.proxy(function (e) {
						// if($.vakata.dnd.is_drag &&
						// $.vakata.dnd.user_data.jstree &&
						// $(e.currentTarget).find("> ul > li").length === 0) {
						if(	$.vakata.dnd.is_drag && 
							$.vakata.dnd.user_data.jstree && 
							e.currentTarget === e.target && 
							$.vakata.dnd.user_data.obj && 
							$($.vakata.dnd.user_data.obj).length && 
							$($.vakata.dnd.user_data.obj).parents(".jstree:eq(0)")[0] !== e.target) { // node should not be from the same tree
							
							var tr = $.jstree._reference(e.currentTarget), dc;
							if(tr.data.dnd.foreign) {
								dc = tr._get_settings().dnd.drag_check.call(this, { "o" : o, "r" : tr.get_container(), is_root : true });
								if(dc === true || dc.inside === true || dc.before === true || dc.after === true) {
									tr._get_settings().dnd.drag_finish.call(this, { "o" : o, "r" : tr.get_container(), is_root : true });
								}
							}else {
								tr.move_node(o, tr.get_container(), "last", e[tr._get_settings().dnd.copy_modifier + "Key"]);
							}
						}
					}, this))
				.bind("mouseleave.jstree", $.proxy(function (e) {
						if(e.relatedTarget && e.relatedTarget.id && e.relatedTarget.id === "jstree-marker-line") {
							return false; 
						}
						if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree) {
							if(this.data.dnd.i1) { clearInterval(this.data.dnd.i1); }
							if(this.data.dnd.i2) { clearInterval(this.data.dnd.i2); }
							if(this.data.dnd.to1) { clearTimeout(this.data.dnd.to1); }
							if(this.data.dnd.to2) { clearTimeout(this.data.dnd.to2); }
							if($.vakata.dnd.helper.children("ins").hasClass("jstree-ok")) {
								$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");
							}
						}
					}, this))
				.bind("mousemove.jstree", $.proxy(function (e) {
						if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree) {
							var cnt = this.get_container()[0];

							// Horizontal scroll
							if(e.pageX + 24 > this.data.dnd.cof.left + this.data.dnd.cw) {
								if(this.data.dnd.i1) { 
									clearInterval(this.data.dnd.i1); 
								}
								this.data.dnd.i1 = setInterval($.proxy(function () { 
									this.scrollLeft += $.vakata.dnd.scroll_spd; 
									}, cnt), 100);
								
							}else if(e.pageX - 24 < this.data.dnd.cof.left) {
								if(this.data.dnd.i1) { 
									clearInterval(this.data.dnd.i1); 
								}
								
								this.data.dnd.i1 = setInterval($.proxy(function () { 
									this.scrollLeft -= $.vakata.dnd.scroll_spd; 
									}, cnt), 100);
								
							}else {
								if(this.data.dnd.i1) { 
									clearInterval(this.data.dnd.i1); 
								}
							}

							// Vertical scroll
							if(e.pageY + 24 > this.data.dnd.cof.top + this.data.dnd.ch) {
								if(this.data.dnd.i2) { clearInterval(this.data.dnd.i2); }
								this.data.dnd.i2 = setInterval($.proxy(function () { this.scrollTop += $.vakata.dnd.scroll_spd; }, cnt), 100);
							}else if(e.pageY - 24 < this.data.dnd.cof.top) {
								if(this.data.dnd.i2) { clearInterval(this.data.dnd.i2); }
								this.data.dnd.i2 = setInterval($.proxy(function () { this.scrollTop -= $.vakata.dnd.scroll_spd; }, cnt), 100);
							}else {
								if(this.data.dnd.i2) { clearInterval(this.data.dnd.i2); }
							}

						}
					}, this))
				.bind("scroll.jstree", $.proxy(function (e) { 
						if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree && m && ml) {
							m.hide();
							ml.hide();
						}
					}, this))
				.delegate("a", "mousedown.jstree", $.proxy(function (e) { 
						if(e.which === 1) {
							this.start_drag(e.currentTarget, e);
							return false;
						}
					}, this))
				.delegate("a", "mouseenter.jstree", $.proxy(function (e) { 
						if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree) {
							this.dnd_enter(e.currentTarget);
						}
					}, this))
				.delegate("a", "mousemove.jstree", $.proxy(function (e) { 
						if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree) {
							if(!r || !r.length || r.children("a")[0] !== e.currentTarget) {
								this.dnd_enter(e.currentTarget);
							}
							if(typeof this.data.dnd.off.top === "undefined") { this.data.dnd.off = $(e.target).offset(); }
							this.data.dnd.w = (e.pageY - (this.data.dnd.off.top || 0)) % this.data.core.li_height;
							if(this.data.dnd.w < 0) { this.data.dnd.w += this.data.core.li_height; }
							this.dnd_show();
						}
					}, this))
				.delegate("a", "mouseleave.jstree", $.proxy(function (e) { 
						if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree) {
							if(e.relatedTarget && e.relatedTarget.id && e.relatedTarget.id === "jstree-marker-line") {
								return false; 
							}
								if(m) { m.hide(); }
								if(ml) { ml.hide(); }
							/*
							 * var ec = $(e.currentTarget).closest("li"), er =
							 * $(e.relatedTarget).closest("li"); if(er[0] !==
							 * ec.prev()[0] && er[0] !== ec.next()[0]) { if(m) {
							 * m.hide(); } if(ml) { ml.hide(); } }
							 */
							this.data.dnd.mto = setTimeout( 
								(function (t) { return function () { t.dnd_leave(e); }; })(this),
							0);
						}
					}, this))
				.delegate("a", "mouseup.jstree", $.proxy(function (e) { 
						if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree) {
							this.dnd_finish(e);
						}
					}, this));

			$(document)
				.bind("drag_stop.vakata", $.proxy(function () {
						if(this.data.dnd.to1) { 
							clearTimeout(this.data.dnd.to1); 
						}
						if(this.data.dnd.to2) { 
							clearTimeout(this.data.dnd.to2); 
						}
						if(this.data.dnd.i1) { 
							clearInterval(this.data.dnd.i1); 
						}
						if(this.data.dnd.i2) { 
							clearInterval(this.data.dnd.i2); 
						}
						this.data.dnd.after		= false;
						this.data.dnd.before	= false;
						this.data.dnd.inside	= false;
						this.data.dnd.off		= false;
						this.data.dnd.prepared	= false;
						this.data.dnd.w			= false;
						this.data.dnd.to1		= false;
						this.data.dnd.to2		= false;
						this.data.dnd.i1		= false;
						this.data.dnd.i2		= false;
						this.data.dnd.active	= false;
						this.data.dnd.foreign	= false;
						if(m) { 
							m.css({ "top" : "-2000px" }); 
						}
						if(ml) { 
							ml.css({ "top" : "-2000px" }); 
						}
					}, this))
				.bind("drag_start.vakata", $.proxy(function (e, data) {
						if(data.data.jstree) { 
							var et = $(data.event.target);
							if(et.closest(".jstree").hasClass("jstree-" + this.get_index())) {
								this.dnd_enter(et);
							}
						}
					}, this));
				/*
				 * .bind("keydown.jstree-" + this.get_index() + " keyup.jstree-" +
				 * this.get_index(), $.proxy(function(e) {
				 * if($.vakata.dnd.is_drag && $.vakata.dnd.user_data.jstree &&
				 * !this.data.dnd.foreign) { var h =
				 * $.vakata.dnd.helper.children("ins");
				 * if(e[this._get_settings().dnd.copy_modifier + "Key"] &&
				 * h.hasClass("jstree-ok")) {
				 * h.parent().html(h.parent().html().replace(/ \(Copy\)$/, "") + "
				 * (Copy)"); } else {
				 * h.parent().html(h.parent().html().replace(/ \(Copy\)$/, "")); } } },
				 * this));
				 */



			var s = this._get_settings().dnd;
			if(s.drag_target) {
				$(document)
					.delegate(s.drag_target, "mousedown.jstree-" + this.get_index(), $.proxy(function (e) {
						o = e.target;
						$.vakata.dnd.drag_start(e, { jstree : true, obj : e.target }, "<ins class='jstree-icon'></ins>" + $(e.target).text() );
						//테마가 있으면
						if(this.data.themes) { 
							if(m) { 
								m.attr("class", "jstree-" + this.data.themes.theme); 
							}
							if(ml) { 
								ml.attr("class", "jstree-" + this.data.themes.theme); 
							}
							$.vakata.dnd.helper.attr("class", "jstree-dnd-helper jstree-" + this.data.themes.theme); 
						}
						$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");
						var cnt = this.get_container();
						this.data.dnd.cof = cnt.offset();
						this.data.dnd.cw = parseInt(cnt.width(),10);
						this.data.dnd.ch = parseInt(cnt.height(),10);
						this.data.dnd.foreign = true;
						e.preventDefault();
					}, this));
			}
			if(s.drop_target) {
				$(document)
					.delegate(s.drop_target, "mouseenter.jstree-" + this.get_index(), $.proxy(function (e) {
							if(this.data.dnd.active && this._get_settings().dnd.drop_check.call(this, { "o" : o, "r" : $(e.target), "e" : e })) {
								$.vakata.dnd.helper.children("ins").attr("class","jstree-ok");
							}
						}, this))
					.delegate(s.drop_target, "mouseleave.jstree-" + this.get_index(), $.proxy(function (e) {
							if(this.data.dnd.active) {
								$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");
							}
						}, this))
					.delegate(s.drop_target, "mouseup.jstree-" + this.get_index(), $.proxy(function (e) {
							if(this.data.dnd.active && $.vakata.dnd.helper.children("ins").hasClass("jstree-ok")) {
								this._get_settings().dnd.drop_finish.call(this, { "o" : o, "r" : $(e.target), "e" : e });
							}
						}, this));
			}
		},
		defaults : {
			copy_modifier	: "ctrl",
			check_timeout	: 100,
			open_timeout	: 500,
			drop_target		: ".jstree-drop",
			drop_check		: function (data) { return true; },
			drop_finish		: $.noop,
			drag_target		: ".jstree-draggable",
			drag_finish		: $.noop,
			drag_check		: function (data) { return { after : false, before : false, inside : true }; }
		},
		_fn : {
			dnd_prepare : function () {
				if(!r || !r.length) { 
					return; 
				}
				
				this.data.dnd.off = r.offset();
				if(this._get_settings().core.rtl) {
					this.data.dnd.off.right = this.data.dnd.off.left + r.width();
				}
				if(this.data.dnd.foreign) {
					var a = this._get_settings().dnd.drag_check.call(this, { "o" : o, "r" : r });
					this.data.dnd.after = a.after;
					this.data.dnd.before = a.before;
					this.data.dnd.inside = a.inside;
					this.data.dnd.prepared = true;
					return this.dnd_show();
				}
				this.prepare_move(o, r, "before");
				this.data.dnd.before = this.check_move();
				this.prepare_move(o, r, "after");
				this.data.dnd.after = this.check_move();
				if(this._is_loaded(r)) {
					this.prepare_move(o, r, "inside");
					this.data.dnd.inside = this.check_move();
				}else {
					this.data.dnd.inside = false;
				}
				this.data.dnd.prepared = true;
				return this.dnd_show();
			},
			dnd_show : function () {
				if(!this.data.dnd.prepared) { 
					return; 
				}
				var o = ["before","inside","after"],
					r = false,
					rtl = this._get_settings().core.rtl,
					pos;
				
				//dnd.w 크기에 따라
				if(this.data.dnd.w < this.data.core.li_height/3) { 
					o = ["before","inside","after"]; 
				}else if(this.data.dnd.w <= this.data.core.li_height*2/3) {
					o = this.data.dnd.w < this.data.core.li_height/2 ? ["inside","before","after"] : ["inside","after","before"];
				}else { 
					o = ["after","inside","before"]; 
				}
				
				//data.dnd 에 o 배열열에 있는 값이 있는경우
				$.each(o, $.proxy(function (i, val) { 
					if(this.data.dnd[val]) {
						$.vakata.dnd.helper.children("ins").attr("class","jstree-ok");
						r = val;
						return false;
					}
				}, this));
				
				if(r === false) { 
					$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid"); 
				}
				
				pos = rtl ? (this.data.dnd.off.right - 18) : (this.data.dnd.off.left + 10);
				
				switch(r) {
					case "before":
						m.css({ "left" : pos + "px", "top" : (this.data.dnd.off.top - 6) + "px" }).show();
						if(ml) { 
							ml.css({ "left" : (pos + 8) + "px", "top" : (this.data.dnd.off.top - 1) + "px" }).show(); 
						}
						break;
					case "after":
						m.css({ "left" : pos + "px", "top" : (this.data.dnd.off.top + this.data.core.li_height - 6) + "px" }).show();
						if(ml) { 
							ml.css({ "left" : (pos + 8) + "px", "top" : (this.data.dnd.off.top + this.data.core.li_height - 1) + "px" }).show(); 
						}
						break;
					case "inside":
						m.css({ "left" : pos + ( rtl ? -4 : 4) + "px", "top" : (this.data.dnd.off.top + this.data.core.li_height/2 - 5) + "px" }).show();
						if(ml) { 
							ml.hide(); 
						}
						break;
					default:
						m.hide();
						if(ml) { 
							ml.hide(); 
						}
						break;
				}
				last_pos = r;
				return r;
			},
			dnd_open : function () {
				this.data.dnd.to2 = false;
				this.open_node(r, $.proxy(this.dnd_prepare,this), true);
			},
			dnd_finish : function (e) {
				if(this.data.dnd.foreign) {
					if(this.data.dnd.after || this.data.dnd.before || this.data.dnd.inside) {
						this._get_settings().dnd.drag_finish.call(this, { "o" : o, "r" : r, "p" : last_pos });
					}
				}else {
					this.dnd_prepare();
					this.move_node(o, r, last_pos, e[this._get_settings().dnd.copy_modifier + "Key"]);
				}
				o = false;
				r = false;
				m.hide();
				if(ml) { 
					ml.hide(); 
				}
			},
			dnd_enter : function (obj) {
				if(this.data.dnd.mto) { 
					clearTimeout(this.data.dnd.mto);
					this.data.dnd.mto = false;
				}
				var s = this._get_settings().dnd;
				this.data.dnd.prepared = false;
				r = this._get_node(obj);
				if(s.check_timeout) { 
					// do the calculations after a minimal timeout (users tend
					// to drag quickly to the desired location)
					if(this.data.dnd.to1) { 
						clearTimeout(this.data.dnd.to1); 
					}
					
					this.data.dnd.to1 = setTimeout($.proxy(this.dnd_prepare, this), s.check_timeout); 
				}
				else { 
					this.dnd_prepare(); 
				}
				if(s.open_timeout) { 
					if(this.data.dnd.to2) { 
						clearTimeout(this.data.dnd.to2); 
					}
					if(r && r.length && r.hasClass("jstree-closed")) { 
						// if the node is closed - open it, then recalculate
						this.data.dnd.to2 = setTimeout($.proxy(this.dnd_open, this), s.open_timeout);
					}
				}
				else {
					if(r && r.length && r.hasClass("jstree-closed")) { 
						this.dnd_open();
					}
				}
			},
			dnd_leave : function (e) {
				this.data.dnd.after		= false;
				this.data.dnd.before	= false;
				this.data.dnd.inside	= false;
				$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");
				m.hide();
				if(ml) { ml.hide(); }
				if(r && r[0] === e.target.parentNode) {
					if(this.data.dnd.to1) {
						clearTimeout(this.data.dnd.to1);
						this.data.dnd.to1 = false;
					}
					if(this.data.dnd.to2) {
						clearTimeout(this.data.dnd.to2);
						this.data.dnd.to2 = false;
					}
				}
			},
			start_drag : function (obj, e) {
				o = this._get_node(obj);
				if(this.data.ui && this.is_selected(o)) { o = this._get_node(null, true); }
				var dt = o.length > 1 ? this._get_string("multiple_selection") : this.get_text(o),
					cnt = this.get_container();
				if(!this._get_settings().core.html_titles) { dt = dt.replace(/</ig,"&lt;").replace(/>/ig,"&gt;"); }
				$.vakata.dnd.drag_start(e, { jstree : true, obj : o }, "<ins class='jstree-icon'></ins>" + dt );
				if(this.data.themes) { 
					if(m) { m.attr("class", "jstree-" + this.data.themes.theme); }
					if(ml) { ml.attr("class", "jstree-" + this.data.themes.theme); }
					$.vakata.dnd.helper.attr("class", "jstree-dnd-helper jstree-" + this.data.themes.theme); 
				}
				this.data.dnd.cof = cnt.offset();
				this.data.dnd.cw = parseInt(cnt.width(),10);
				this.data.dnd.ch = parseInt(cnt.height(),10);
				this.data.dnd.active = true;
			}
		}
	});
	$(function() {
		var css_string = '' + 
			'#vakata-dragged ins { display:block; text-decoration:none; width:16px; height:16px; margin:0 0 0 0; padding:0; position:absolute; top:4px; left:4px; ' + 
			' -moz-border-radius:4px; border-radius:4px; -webkit-border-radius:4px; ' +
			'} ' + 
			'#vakata-dragged .jstree-ok { background:green; } ' + 
			'#vakata-dragged .jstree-invalid { background:red; } ' + 
			'#jstree-marker { padding:0; margin:0; font-size:12px; overflow:hidden; height:12px; width:8px; position:absolute; top:-30px; z-index:10001; background-repeat:no-repeat; display:none; background-color:transparent; text-shadow:1px 1px 1px white; color:black; line-height:10px; } ' + 
			'#jstree-marker-line { padding:0; margin:0; line-height:0%; font-size:1px; overflow:hidden; height:1px; width:100px; position:absolute; top:-30px; z-index:10000; background-repeat:no-repeat; display:none; background-color:#456c43; ' + 
			' cursor:pointer; border:1px solid #eeeeee; border-left:0; -moz-box-shadow: 0px 0px 2px #666; -webkit-box-shadow: 0px 0px 2px #666; box-shadow: 0px 0px 2px #666; ' + 
			' -moz-border-radius:1px; border-radius:1px; -webkit-border-radius:1px; ' +
			'}' + 
			'';
		$.vakata.css.add_sheet({ str : css_string, title : "jstree" });
		m = $("<div />").attr({ id : "jstree-marker" }).hide().html("&raquo;").bind("mouseleave mouseenter", function (e) { 
				m.hide();
				ml.hide();
				e.preventDefault(); 
				e.stopImmediatePropagation(); 
				return false; 
			}).appendTo("body");
		ml = $("<div />").attr({ id : "jstree-marker-line" }).hide().bind("mouseup", function (e) { 
				if(r && r.length) { 
					r.children("a").trigger(e); 
					e.preventDefault(); 
					e.stopImmediatePropagation(); 
					return false; 
				} 
			}).bind("mouseleave", function (e) { 
				var rt = $(e.relatedTarget);
				if(rt.is(".jstree") || rt.closest(".jstree").length === 0) {
					if(r && r.length) { 
						r.children("a").trigger(e); 
						m.hide();
						ml.hide();
						e.preventDefault(); 
						e.stopImmediatePropagation(); 
						return false; 
					}
				}
			}).appendTo("body");
		$(document).bind("drag_start.vakata", function (e, data) {
			if(data.data.jstree) { m.show(); if(ml) { ml.show(); } }
		});
		$(document).bind("drag_stop.vakata", function (e, data) {
			if(data.data.jstree) { m.hide(); if(ml) { ml.hide(); } }
		});
	});
})(jQuery);
// */

/*
 * jsTree checkbox plugin Inserts checkboxes in front of every node Depends on
 * the ui plugin DOES NOT WORK NICELY WITH MULTITREE DRAG'N'DROP
 */
(function ($) {
	$.jstree.plugin("checkbox", {
		__init : function () {
			this.data.checkbox.noui = this._get_settings().checkbox.override_ui;
			if(this.data.ui && this.data.checkbox.noui) {
				this.select_node = this.deselect_node = this.deselect_all = $.noop;
				this.get_selected = this.get_checked;
			}

			this.get_container()
				.bind("open_node.jstree create_node.jstree clean_node.jstree refresh.jstree", $.proxy(function (e, data) { 
						this._prepare_checkboxes(data.rslt.obj);
					}, this))
				.bind("loaded.jstree", $.proxy(function (e) {
						this._prepare_checkboxes();
					}, this))
				.delegate( (this.data.ui && this.data.checkbox.noui ? "a" : "ins.jstree-checkbox") , "click.jstree", $.proxy(function (e) {
						e.preventDefault();
						if(this._get_node(e.target).hasClass("jstree-checked")) { 
							this.uncheck_node(e.target); 
						}else { 
							this.check_node(e.target); 
						}
						
						if(this.data.ui && this.data.checkbox.noui) {
							this.save_selected();
							if(this.data.cookies) { 
								this.save_cookie("select_node"); 
							}
						}else {
							e.stopImmediatePropagation();
							return false;
						}
					}, this));
		},
		defaults : {
			override_ui : false,
			two_state : false,
			real_checkboxes : false,
			checked_parent_open : true,
			real_checkboxes_names : function (n) { 
				return [ ("check_" + (n[0].id || Math.ceil(Math.random() * 10000))) , 1]; 
			}
		},
		__destroy : function () {
			this.get_container()
				.find("input.jstree-real-checkbox").removeClass("jstree-real-checkbox").end()
				.find("ins.jstree-checkbox").remove();
		},
		_fn : {
			_checkbox_notify : function (n, data) {
				if(data.checked) {
					this.check_node(n, false);
				}
			},
			_prepare_checkboxes : function (obj) {
				obj = !obj || obj == -1 ? this.get_container().find("> ul > li") : this._get_node(obj);
				if(obj === false) { 
					return; 
				} // added for removing root nodes
				
				var c, 
					_this = this, 
					t, 
					ts = this._get_settings().checkbox.two_state, 
					rc = this._get_settings().checkbox.real_checkboxes, 
					rcn = this._get_settings().checkbox.real_checkboxes_names;
				
				obj.each(function () {
					t = $(this);
					
					c = t.is("li") && (t.hasClass("jstree-checked") || (rc && t.children(":checked").length)) ? "jstree-checked" : "jstree-unchecked";
					t.find("li").andSelf().each(function () {
						var $t = $(this), nm;
						$t.children("a" + (_this.data.languages ? "" : ":eq(0)") ).not(":has(.jstree-checkbox)").prepend("<ins class='jstree-checkbox'>&#160;</ins>").parent().not(".jstree-checked, .jstree-unchecked").addClass( ts ? "jstree-unchecked" : c );
						if(rc) {
							if(!$t.children(":checkbox").length) {
								nm = rcn.call(_this, $t);
								$t.prepend("<input type='checkbox' class='jstree-real-checkbox' id='" + nm[0] + "' name='" + nm[0] + "' value='" + nm[1] + "' />");
							}else {
								$t.children(":checkbox").addClass("jstree-real-checkbox");
							}
						}
						if(!ts) {
							if(c === "jstree-checked" || $t.hasClass("jstree-checked") || $t.children(':checked').length) {
								$t.find("li").andSelf().addClass("jstree-checked").children(":checkbox").prop("checked", true);
							}
						}
						else {
							if($t.hasClass("jstree-checked") || $t.children(':checked').length) {
								$t.addClass("jstree-checked").children(":checkbox").prop("checked", true);
							}
						}
					});
				});
				if(!ts) {
					obj.find(".jstree-checked").parent().parent().each(function () { 
						_this._repair_state(this); 
					}); 
				}
			},
			change_state : function (obj, state) {
				obj = this._get_node(obj);
				var coll = false, 
					rc = this._get_settings().checkbox.real_checkboxes;
				if(!obj || obj === -1) { 
					return false; 
				}
				state = (state === false || state === true) ? state : obj.hasClass("jstree-checked");
				if(this._get_settings().checkbox.two_state) {
					if(state) { 
						obj.removeClass("jstree-checked").addClass("jstree-unchecked"); 
						if(rc){ 
							obj.children(":checkbox").prop("checked", false); 
						}
					}else { 
						obj.removeClass("jstree-unchecked").addClass("jstree-checked"); 
						if(rc){ 
							obj.children(":checkbox").prop("checked", true); 
						}
					}
				}else {
					if(state) { 
						coll = obj.find("li").andSelf();
						if(!coll.filter(".jstree-checked, .jstree-undetermined").length) { 
							return false; 
						}
						coll.removeClass("jstree-checked jstree-undetermined").addClass("jstree-unchecked"); 
						if(rc) { 
							coll.children(":checkbox").prop("checked", false); 
						}
					}else { 
						coll = obj.find("li").andSelf();
						if(!coll.filter(".jstree-unchecked, .jstree-undetermined").length) { 
							return false; 
						}
						coll.removeClass("jstree-unchecked jstree-undetermined").addClass("jstree-checked"); 
						if(rc) { 
							coll.children(":checkbox").prop("checked", true); 
						}
						if(this.data.ui) { 
							this.data.ui.last_selected = obj; 
						}
						this.data.checkbox.last_selected = obj;
					}
					obj.parentsUntil(".jstree", "li").each(function () {
						var $this = $(this);
						if(state) {
							if($this.children("ul").children("li.jstree-checked, li.jstree-undetermined").length) {
								$this.parentsUntil(".jstree", "li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
								if(rc) { 
									$this.parentsUntil(".jstree", "li").andSelf().children(":checkbox").prop("checked", false); 
								}
								return false;
							}else {
								$this.removeClass("jstree-checked jstree-undetermined").addClass("jstree-unchecked");
								if(rc) { 
									$this.children(":checkbox").prop("checked", false); 
								}
							}
						}else {
							if($this.children("ul").children("li.jstree-unchecked, li.jstree-undetermined").length) {
								$this.parentsUntil(".jstree", "li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
								if(rc) { 
									$this.parentsUntil(".jstree", "li").andSelf().children(":checkbox").prop("checked", false); 
								}
								return false;
							}else {
								$this.removeClass("jstree-unchecked jstree-undetermined").addClass("jstree-checked");
								if(rc) { 
									$this.children(":checkbox").prop("checked", true); 
								}
							}
						}
					});
				}
				if(this.data.ui && this.data.checkbox.noui) { 
					this.data.ui.selected = this.get_checked(); 
				}
				this.__callback(obj);
				return true;
			},
			check_node : function (obj) {
				if(this.change_state(obj, false)) { 
					obj = this._get_node(obj);
					if(this._get_settings().checkbox.checked_parent_open) {
						var t = this;
						obj.parents(".jstree-closed").each(function () { 
							t.open_node(this, false, true); 
						});
					}
					this.__callback({ "obj" : obj }); 
				}
			},
			uncheck_node : function (obj) {
				if(this.change_state(obj, true)) { 
					this.__callback({ "obj" : this._get_node(obj) }); 
				}
			},
			check_all : function () {
				var _this = this, 
					coll = this._get_settings().checkbox.two_state ? this.get_container_ul().find("li") : this.get_container_ul().children("li");
				coll.each(function () {
					_this.change_state(this, false);
				});
				this.__callback();
			},
			uncheck_all : function () {
				var _this = this,
					coll = this._get_settings().checkbox.two_state ? this.get_container_ul().find("li") : this.get_container_ul().children("li");
				coll.each(function () {
					_this.change_state(this, true);
				});
				this.__callback();
			},

			is_checked : function(obj) {
				obj = this._get_node(obj);
				return obj.length ? obj.is(".jstree-checked") : false;
			},
			get_checked : function (obj, get_all) {
				obj = !obj || obj === -1 ? this.get_container() : this._get_node(obj);
				return get_all || this._get_settings().checkbox.two_state ? obj.find(".jstree-checked") : obj.find("> ul > .jstree-checked, .jstree-undetermined > ul > .jstree-checked");
			},
			get_unchecked : function (obj, get_all) { 
				obj = !obj || obj === -1 ? this.get_container() : this._get_node(obj);
				return get_all || this._get_settings().checkbox.two_state ? obj.find(".jstree-unchecked") : obj.find("> ul > .jstree-unchecked, .jstree-undetermined > ul > .jstree-unchecked");
			},

			show_checkboxes : function () { 
				this.get_container().children("ul").removeClass("jstree-no-checkboxes"); 
			},
			hide_checkboxes : function () { 
				this.get_container().children("ul").addClass("jstree-no-checkboxes"); 
			},
			_repair_state : function (obj) {
				obj = this._get_node(obj);
				if(!obj.length) { 
					return; 
				}
				
				if(this._get_settings().checkbox.two_state) {
					obj.find('li').andSelf().not('.jstree-checked').removeClass('jstree-undetermined').addClass('jstree-unchecked').children(':checkbox').prop('checked', true);
					return;
				}
				var rc = this._get_settings().checkbox.real_checkboxes,
					a = obj.find("> ul > .jstree-checked").length,
					b = obj.find("> ul > .jstree-undetermined").length,
					c = obj.find("> ul > li").length;
				
				if(c === 0) { 
					if(obj.hasClass("jstree-undetermined")) { 
						this.change_state(obj, false); 
					} 
				}else if(a === 0 && b === 0) { 
					this.change_state(obj, true); 
				}else if(a === c) { 
					this.change_state(obj, false); 
				}else { 
					obj.parentsUntil(".jstree","li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
					if(rc) { 
						obj.parentsUntil(".jstree", "li").andSelf().children(":checkbox").prop("checked", false); 
					}
				}
			},
			reselect : function () {
				if(this.data.ui && this.data.checkbox.noui) { 
					var _this = this,
						s = this.data.ui.to_select;
					s = $.map($.makeArray(s), function (n) { 
						return "#" + n.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:"); 
						});
					this.deselect_all();
					$.each(s, function (i, val) { 
						_this.check_node(val);
					});
					this.__callback();
				}else { 
					this.__call_old(); 
				}
			},
			save_loaded : function () {
				var _this = this;
				this.data.core.to_load = [];
				this.get_container_ul().find("li.jstree-closed.jstree-undetermined").each(function () {
					if(this.id) { _this.data.core.to_load.push("#" + this.id); }
				});
			}
		}
	});
	$(function() {
		var css_string = '.jstree .jstree-real-checkbox { display:none; } ';
		$.vakata.css.add_sheet({ str : css_string, title : "jstree" });
	});
})(jQuery);
// */

/*
 * jsTree XML plugin The XML data store. Datastores are build by overriding the
 * `load_node` and `_is_loaded` functions.
 */
(function ($) {
	$.vakata.xslt = function (xml, xsl, callback) {
		var rs = "", xm, xs, processor, support;
		// TODO: IE9 no XSLTProcessor, no document.recalc
		if(document.recalc) {
			xm = document.createElement('xml');
			xs = document.createElement('xml');
			xm.innerHTML = xml;
			xs.innerHTML = xsl;
			$("body").append(xm).append(xs);
			setTimeout( (function (xm, xs, callback) {
				return function () {
					callback.call(null, xm.transformNode(xs.XMLDocument));
					setTimeout( (function (xm, xs) { return function () { $(xm).remove(); $(xs).remove(); }; })(xm, xs), 200);
				};
			})(xm, xs, callback), 100);
			return true;
		}
		if(typeof window.DOMParser !== "undefined" && typeof window.XMLHttpRequest !== "undefined" && typeof window.XSLTProcessor === "undefined") {
			xml = new DOMParser().parseFromString(xml, "text/xml");
			xsl = new DOMParser().parseFromString(xsl, "text/xml");
			// alert(xml.transformNode());
			// callback.call(null, new XMLSerializer().serializeToString(rs));
			
		}
		if(typeof window.DOMParser !== "undefined" && typeof window.XMLHttpRequest !== "undefined" && typeof window.XSLTProcessor !== "undefined") {
			processor = new XSLTProcessor();
			support = $.isFunction(processor.transformDocument) ? (typeof window.XMLSerializer !== "undefined") : true;
			if(!support) { return false; }
			xml = new DOMParser().parseFromString(xml, "text/xml");
			xsl = new DOMParser().parseFromString(xsl, "text/xml");
			if($.isFunction(processor.transformDocument)) {
				rs = document.implementation.createDocument("", "", null);
				processor.transformDocument(xml, xsl, rs, null);
				callback.call(null, new XMLSerializer().serializeToString(rs));
				return true;
			}
			else {
				processor.importStylesheet(xsl);
				rs = processor.transformToFragment(xml, document);
				callback.call(null, $("<div />").append(rs).html());
				return true;
			}
		}
		return false;
	};
	var xsl = {
		'nest' : '<' + '?xml version="1.0" encoding="utf-8" ?>' + 
			'<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >' + 
			'<xsl:output method="html" encoding="utf-8" omit-xml-declaration="yes" standalone="no" indent="no" media-type="text/html" />' + 
			'<xsl:template match="/">' + 
			'	<xsl:call-template name="nodes">' + 
			'		<xsl:with-param name="node" select="/root" />' + 
			'	</xsl:call-template>' + 
			'</xsl:template>' + 
			'<xsl:template name="nodes">' + 
			'	<xsl:param name="node" />' + 
			'	<ul>' + 
			'	<xsl:for-each select="$node/item">' + 
			'		<xsl:variable name="children" select="count(./item) &gt; 0" />' + 
			'		<li>' + 
			'			<xsl:attribute name="class">' + 
			'				<xsl:if test="position() = last()">jstree-last </xsl:if>' + 
			'				<xsl:choose>' + 
			'					<xsl:when test="@state = \'open\'">jstree-open </xsl:when>' + 
			'					<xsl:when test="$children or @hasChildren or @state = \'closed\'">jstree-closed </xsl:when>' + 
			'					<xsl:otherwise>jstree-leaf </xsl:otherwise>' + 
			'				</xsl:choose>' + 
			'				<xsl:value-of select="@class" />' + 
			'			</xsl:attribute>' + 
			'			<xsl:for-each select="@*">' + 
			'				<xsl:if test="name() != \'class\' and name() != \'state\' and name() != \'hasChildren\'">' + 
			'					<xsl:attribute name="{name()}"><xsl:value-of select="." /></xsl:attribute>' + 
			'				</xsl:if>' + 
			'			</xsl:for-each>' + 
			'	<ins class="jstree-icon"><xsl:text>&#xa0;</xsl:text></ins>' + 
			'			<xsl:for-each select="content/name">' + 
			'				<a>' + 
			'				<xsl:attribute name="href">' + 
			'					<xsl:choose>' + 
			'					<xsl:when test="@href"><xsl:value-of select="@href" /></xsl:when>' + 
			'					<xsl:otherwise>#</xsl:otherwise>' + 
			'					</xsl:choose>' + 
			'				</xsl:attribute>' + 
			'				<xsl:attribute name="class"><xsl:value-of select="@lang" /> <xsl:value-of select="@class" /></xsl:attribute>' + 
			'				<xsl:attribute name="style"><xsl:value-of select="@style" /></xsl:attribute>' + 
			'				<xsl:for-each select="@*">' + 
			'					<xsl:if test="name() != \'style\' and name() != \'class\' and name() != \'href\'">' + 
			'						<xsl:attribute name="{name()}"><xsl:value-of select="." /></xsl:attribute>' + 
			'					</xsl:if>' + 
			'				</xsl:for-each>' + 
			'					<ins>' + 
			'						<xsl:attribute name="class">jstree-icon ' + 
			'							<xsl:if test="string-length(attribute::icon) > 0 and not(contains(@icon,\'/\'))"><xsl:value-of select="@icon" /></xsl:if>' + 
			'						</xsl:attribute>' + 
			'						<xsl:if test="string-length(attribute::icon) > 0 and contains(@icon,\'/\')"><xsl:attribute name="style">background:url(<xsl:value-of select="@icon" />) center center no-repeat;</xsl:attribute></xsl:if>' + 
			'						<xsl:text>&#xa0;</xsl:text>' + 
			'					</ins>' + 
			'					<xsl:copy-of select="./child::node()" />' + 
			'				</a>' + 
			'			</xsl:for-each>' + 
			'			<xsl:if test="$children or @hasChildren"><xsl:call-template name="nodes"><xsl:with-param name="node" select="current()" /></xsl:call-template></xsl:if>' + 
			'		</li>' + 
			'	</xsl:for-each>' + 
			'	</ul>' + 
			'</xsl:template>' + 
			'</xsl:stylesheet>',

		'flat' : '<' + '?xml version="1.0" encoding="utf-8" ?>' + 
			'<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >' + 
			'<xsl:output method="html" encoding="utf-8" omit-xml-declaration="yes" standalone="no" indent="no" media-type="text/xml" />' + 
			'<xsl:template match="/">' + 
			'	<ul>' + 
			'	<xsl:for-each select="//item[not(@parent_id) or @parent_id=0 or not(@parent_id = //item/@id)]">' + /*
																													 * the
																													 * last
																													 * `or`
																													 * may
																													 * be
																													 * removed
																													 */
			'		<xsl:call-template name="nodes">' + 
			'			<xsl:with-param name="node" select="." />' + 
			'			<xsl:with-param name="is_last" select="number(position() = last())" />' + 
			'		</xsl:call-template>' + 
			'	</xsl:for-each>' + 
			'	</ul>' + 
			'</xsl:template>' + 
			'<xsl:template name="nodes">' + 
			'	<xsl:param name="node" />' + 
			'	<xsl:param name="is_last" />' + 
			'	<xsl:variable name="children" select="count(//item[@parent_id=$node/attribute::id]) &gt; 0" />' + 
			'	<li>' + 
			'	<xsl:attribute name="class">' + 
			'		<xsl:if test="$is_last = true()">jstree-last </xsl:if>' + 
			'		<xsl:choose>' + 
			'			<xsl:when test="@state = \'open\'">jstree-open </xsl:when>' + 
			'			<xsl:when test="$children or @hasChildren or @state = \'closed\'">jstree-closed </xsl:when>' + 
			'			<xsl:otherwise>jstree-leaf </xsl:otherwise>' + 
			'		</xsl:choose>' + 
			'		<xsl:value-of select="@class" />' + 
			'	</xsl:attribute>' + 
			'	<xsl:for-each select="@*">' + 
			'		<xsl:if test="name() != \'parent_id\' and name() != \'hasChildren\' and name() != \'class\' and name() != \'state\'">' + 
			'		<xsl:attribute name="{name()}"><xsl:value-of select="." /></xsl:attribute>' + 
			'		</xsl:if>' + 
			'	</xsl:for-each>' + 
			'	<ins class="jstree-icon"><xsl:text>&#xa0;</xsl:text></ins>' + 
			'	<xsl:for-each select="content/name">' + 
			'		<a>' + 
			'		<xsl:attribute name="href">' + 
			'			<xsl:choose>' + 
			'			<xsl:when test="@href"><xsl:value-of select="@href" /></xsl:when>' + 
			'			<xsl:otherwise>#</xsl:otherwise>' + 
			'			</xsl:choose>' + 
			'		</xsl:attribute>' + 
			'		<xsl:attribute name="class"><xsl:value-of select="@lang" /> <xsl:value-of select="@class" /></xsl:attribute>' + 
			'		<xsl:attribute name="style"><xsl:value-of select="@style" /></xsl:attribute>' + 
			'		<xsl:for-each select="@*">' + 
			'			<xsl:if test="name() != \'style\' and name() != \'class\' and name() != \'href\'">' + 
			'				<xsl:attribute name="{name()}"><xsl:value-of select="." /></xsl:attribute>' + 
			'			</xsl:if>' + 
			'		</xsl:for-each>' + 
			'			<ins>' + 
			'				<xsl:attribute name="class">jstree-icon ' + 
			'					<xsl:if test="string-length(attribute::icon) > 0 and not(contains(@icon,\'/\'))"><xsl:value-of select="@icon" /></xsl:if>' + 
			'				</xsl:attribute>' + 
			'				<xsl:if test="string-length(attribute::icon) > 0 and contains(@icon,\'/\')"><xsl:attribute name="style">background:url(<xsl:value-of select="@icon" />) center center no-repeat;</xsl:attribute></xsl:if>' + 
			'				<xsl:text>&#xa0;</xsl:text>' + 
			'			</ins>' + 
			'			<xsl:copy-of select="./child::node()" />' + 
			'		</a>' + 
			'	</xsl:for-each>' + 
			'	<xsl:if test="$children">' + 
			'		<ul>' + 
			'		<xsl:for-each select="//item[@parent_id=$node/attribute::id]">' + 
			'			<xsl:call-template name="nodes">' + 
			'				<xsl:with-param name="node" select="." />' + 
			'				<xsl:with-param name="is_last" select="number(position() = last())" />' + 
			'			</xsl:call-template>' + 
			'		</xsl:for-each>' + 
			'		</ul>' + 
			'	</xsl:if>' + 
			'	</li>' + 
			'</xsl:template>' + 
			'</xsl:stylesheet>'
	},
	escape_xml = function(string) {
		return string
			.toString()
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');
	};
	$.jstree.plugin("xml_data", {
		defaults : { 
			data : false,
			ajax : false,
			xsl : "flat",
			clean_node : false,
			correct_state : true,
			get_skip_empty : false,
			get_include_preamble : true
		},
		_fn : {
			load_node : function (obj, s_call, e_call) { 
				var _this = this; this.load_node_xml(obj, function () { _this.__callback({ "obj" : _this._get_node(obj) }); s_call.call(this); }, e_call); 
			},
			_is_loaded : function (obj) { 
				var s = this._get_settings().xml_data;
				obj = this._get_node(obj);
				return obj == -1 || !obj || (!s.ajax && !$.isFunction(s.data)) || obj.is(".jstree-open, .jstree-leaf") || obj.children("ul").children("li").size() > 0;
			},
			load_node_xml : function (obj, s_call, e_call) {
				var s = this.get_settings().xml_data,
					error_func = function () {},
					success_func = function () {};

				obj = this._get_node(obj);
				if(obj && obj !== -1) {
					if(obj.data("jstree_is_loading")) { return; }
					else { obj.data("jstree_is_loading",true); }
				}
				switch(!0) {
					case (!s.data && !s.ajax): throw "Neither data nor ajax settings supplied.";
					case ($.isFunction(s.data)):
						s.data.call(this, obj, $.proxy(function (d) {
							this.parse_xml(d, $.proxy(function (d) {
								if(d) {
									d = d.replace(/ ?xmlns="[^"]*"/ig, "");
									if(d.length > 10) {
										d = $(d);
										if(obj === -1 || !obj) { this.get_container().children("ul").empty().append(d.children()); }
										else { obj.children("a.jstree-loading").removeClass("jstree-loading"); obj.append(d); obj.removeData("jstree_is_loading"); }
										if(s.clean_node) { this.clean_node(obj); }
										if(s_call) { s_call.call(this); }
									}
									else {
										if(obj && obj !== -1) { 
											obj.children("a.jstree-loading").removeClass("jstree-loading");
											obj.removeData("jstree_is_loading");
											if(s.correct_state) { 
												this.correct_state(obj);
												if(s_call) { s_call.call(this); } 
											}
										}
										else {
											if(s.correct_state) { 
												this.get_container().children("ul").empty();
												if(s_call) { s_call.call(this); } 
											}
										}
									}
								}
							}, this));
						}, this));
						break;
					case (!!s.data && !s.ajax) || (!!s.data && !!s.ajax && (!obj || obj === -1)):
						if(!obj || obj == -1) {
							this.parse_xml(s.data, $.proxy(function (d) {
								if(d) {
									d = d.replace(/ ?xmlns="[^"]*"/ig, "");
									if(d.length > 10) {
										d = $(d);
										this.get_container().children("ul").empty().append(d.children());
										if(s.clean_node) { this.clean_node(obj); }
										if(s_call) { s_call.call(this); }
									}
								}
								else { 
									if(s.correct_state) { 
										this.get_container().children("ul").empty(); 
										if(s_call) { s_call.call(this); }
									}
								}
							}, this));
						}
						break;
					case (!s.data && !!s.ajax) || (!!s.data && !!s.ajax && obj && obj !== -1):
						error_func = function (x, t, e) {
							var ef = this.get_settings().xml_data.ajax.error; 
							if(ef) { ef.call(this, x, t, e); }
							if(obj !== -1 && obj.length) {
								obj.children("a.jstree-loading").removeClass("jstree-loading");
								obj.removeData("jstree_is_loading");
								if(t === "success" && s.correct_state) { this.correct_state(obj); }
							}
							else {
								if(t === "success" && s.correct_state) { this.get_container().children("ul").empty(); }
							}
							if(e_call) { e_call.call(this); }
						};
						success_func = function (d, t, x) {
							d = x.responseText;
							var sf = this.get_settings().xml_data.ajax.success; 
							if(sf) { d = sf.call(this,d,t,x) || d; }
							if(d === "" || (d && d.toString && d.toString().replace(/^[\s\n]+$/,"") === "")) {
								return error_func.call(this, x, t, "");
							}
							this.parse_xml(d, $.proxy(function (d) {
								if(d) {
									d = d.replace(/ ?xmlns="[^"]*"/ig, "");
									if(d.length > 10) {
										d = $(d);
										if(obj === -1 || !obj) { this.get_container().children("ul").empty().append(d.children()); }
										else { obj.children("a.jstree-loading").removeClass("jstree-loading"); obj.append(d); obj.removeData("jstree_is_loading"); }
										if(s.clean_node) { this.clean_node(obj); }
										if(s_call) { s_call.call(this); }
									}
									else {
										if(obj && obj !== -1) { 
											obj.children("a.jstree-loading").removeClass("jstree-loading");
											obj.removeData("jstree_is_loading");
											if(s.correct_state) { 
												this.correct_state(obj);
												if(s_call) { s_call.call(this); } 
											}
										}
										else {
											if(s.correct_state) { 
												this.get_container().children("ul").empty();
												if(s_call) { s_call.call(this); } 
											}
										}
									}
								}
							}, this));
						};
						s.ajax.context = this;
						s.ajax.error = error_func;
						s.ajax.success = success_func;
						if(!s.ajax.dataType) { s.ajax.dataType = "xml"; }
						if($.isFunction(s.ajax.url)) { s.ajax.url = s.ajax.url.call(this, obj); }
						if($.isFunction(s.ajax.data)) { s.ajax.data = s.ajax.data.call(this, obj); }
						$.ajax(s.ajax);
						break;
				}
			},
			parse_xml : function (xml, callback) {
				var s = this._get_settings().xml_data;
				$.vakata.xslt(xml, xsl[s.xsl], callback);
			},
			get_xml : function (tp, obj, li_attr, a_attr, is_callback) {
				var result = "", 
					s = this._get_settings(), 
					_this = this,
					tmp1, 
					tmp2, 
					li, 
					a, 
					lang;
				
				if(!tp) { 
					tp = "flat"; 
				}
				
				if(!is_callback) { 
					is_callback = 0; 
				}
				
				obj = this._get_node(obj);
				
				if(!obj || obj === -1) { 
					obj = this.get_container().find("> ul > li"); 
				}
				
				li_attr = $.isArray(li_attr) ? li_attr : [ "id", "class" ];
				
				if(!is_callback && this.data.types && $.inArray(s.types.type_attr, li_attr) === -1) { 
					li_attr.push(s.types.type_attr); 
				}

				a_attr = $.isArray(a_attr) ? a_attr : [ ];

				if(!is_callback) { 
					if(s.xml_data.get_include_preamble) { 
						result += '<' + '?xml version="1.0" encoding="UTF-8"?' + '>'; 
					}
					result += "<root>"; 
				}
				obj.each(function () {
					result += "<item";
					li = $(this);
					$.each(li_attr, function (i, v) { 
						var t = li.attr(v);
						if(!s.xml_data.get_skip_empty || typeof t !== "undefined") {
							result += " " + v + "=\"" + escape_xml((" " + (t || "")).replace(/ jstree[^ ]*/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,"")) + "\""; 
						}
					});
					
					if(li.hasClass("jstree-open")) { 
						result += " state=\"open\""; 
					}
					
					if(li.hasClass("jstree-closed")) { 
						result += " state=\"closed\""; 
					}
					
					if(tp === "flat") { 
						result += " parent_id=\"" + escape_xml(is_callback) + "\""; 
					}
					
					result += ">";
					result += "<content>";
					a = li.children("a");
					a.each(function () {
						tmp1 = $(this);
						lang = false;
						result += "<name";
						if($.inArray("languages", s.plugins) !== -1) {
							$.each(s.languages, function (k, z) {
								if(tmp1.hasClass(z)) { result += " lang=\"" + escape_xml(z) + "\""; lang = z; return false; }
							});
						}
						if(a_attr.length) { 
							$.each(a_attr, function (k, z) {
								var t = tmp1.attr(z);
								if(!s.xml_data.get_skip_empty || typeof t !== "undefined") {
									result += " " + z + "=\"" + escape_xml((" " + t || "").replace(/ jstree[^ ]*/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,"")) + "\"";
								}
							});
						}
						if(tmp1.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').replace(/^\s+$/ig,"").length) {
							result += ' icon="' + escape_xml(tmp1.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,"")) + '"';
						}
						if(tmp1.children("ins").get(0).style.backgroundImage.length) {
							result += ' icon="' + escape_xml(tmp1.children("ins").get(0).style.backgroundImage.replace("url(","").replace(")","").replace(/'/ig,"").replace(/"/ig,"")) + '"';
						}
						result += ">";
						result += "<![CDATA[" + _this.get_text(tmp1, lang) + "]]>";
						result += "</name>";
					});
					
					result += "</content>";
					tmp2 = li[0].id || true;
					li = li.find("> ul > li");
					
					if(li.length) { 
						tmp2 = _this.get_xml(tp, li, li_attr, a_attr, tmp2); 
					}else { 
						tmp2 = ""; 
					}
					
					if(tp == "nest") { 
						result += tmp2; 
					}
					
					result += "</item>";
					
					if(tp == "flat") { 
						result += tmp2; 
					}
				});
				
				if(!is_callback) { 
					result += "</root>"; 
				}
				
				return result;
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree search plugin Enables both sync and async search on the tree DOES NOT
 * WORK WITH JSON PROGRESSIVE RENDER
 */
(function ($) {
	$.expr[':'].jstree_contains = function(a,i,m){
		return (a.textContent || a.innerText || "").toLowerCase().indexOf(m[3].toLowerCase())>=0;
	};
	$.expr[':'].jstree_title_contains = function(a,i,m) {
		return (a.getAttribute("title") || "").toLowerCase().indexOf(m[3].toLowerCase())>=0;
	};
	$.jstree.plugin("search", {
		__init : function () {
			this.data.search.str = "";
			this.data.search.result = $();
			if(this._get_settings().search.show_only_matches) {
				this.get_container()
					.bind("search.jstree", function (e, data) {
						$(this).children("ul").find("li").hide().removeClass("jstree-last");
						data.rslt.nodes.parentsUntil(".jstree").andSelf().show()
							.filter("ul").each(function () { $(this).children("li:visible").eq(-1).addClass("jstree-last"); });
					})
					.bind("clear_search.jstree", function () {
						$(this).children("ul").find("li").css("display","").end().end().jstree("clean_node", -1);
					});
			}
		},
		defaults : {
			ajax : false,
			search_method : "jstree_contains", // for case insensitive -jstree_contains
			show_only_matches : false
		},
		_fn : {
			//ajax 
			search : function (str, skip_async) {
				//str 빈 문자열이면 clear_search() 실행후 리턴
				if($.trim(str) === "") { 
					this.clear_search(); 
					return; 
				}
				
				var s = this.get_settings().search, 
					t = this,
					error_func = function () { },
					success_func = function () { };
				this.data.search.str = str;

				if(!skip_async && s.ajax !== false && this.get_container_ul().find("li.jstree-closed:not(:has(ul)):eq(0)").length > 0) {
					this.search.supress_callback = true;
					error_func = function () { };
					success_func = function (d, t, x) {
						//setting 콜백함수 
						var sf = this.get_settings().search.ajax.success; 
						
						//콜백함수 실행
						if(sf) { 
							d = sf.call(this,d,t,x) || d; 
						}
						
						this.data.search.to_open = d;
						this._search_open();
					};
					
					s.ajax.context = this;
					s.ajax.error = error_func;
					s.ajax.success = success_func;
					
					if($.isFunction(s.ajax.url)) { 
						s.ajax.url = s.ajax.url.call(this, str); 
					}
					
					if($.isFunction(s.ajax.data)) { 
						s.ajax.data = s.ajax.data.call(this, str); 
					}
					
					if(!s.ajax.data) { 
						s.ajax.data = { "search_string" : str }; 
					}
					
					if(!s.ajax.dataType || /^json/.exec(s.ajax.dataType)) { 
						s.ajax.dataType = "json"; 
					}
					
					$.ajax(s.ajax);
					return;
				}
				
				if(this.data.search.result.length) { 
					this.clear_search(); 
				}
				
				this.data.search.result = this.get_container().find("a" + (this.data.languages ? "." + this.get_lang() : "" ) + ":" + (s.search_method) + "(" + this.data.search.str + ")");
				this.data.search.result.addClass("jstree-search").parent().parents(".jstree-closed").each(function () {
					t.open_node(this, false, true);
				});
				this.__callback({ nodes : this.data.search.result, str : str });
			},
			//data 초기화
			clear_search : function (str) {
				this.data.search.result.removeClass("jstree-search");
				this.__callback(this.data.search.result);
				this.data.search.result = $();
			},
			_search_open : function (is_callback) {
				var _this = this,
					done = true,
					current = [],
					remaining = [];
				
				if(this.data.search.to_open.length) {
					
					//select 정보 가지고 closed, opend 객체 골라 내기
					$.each(this.data.search.to_open, function (i, val) {
						if(val == "#") { 
							return true; 
						}
						
						if($(val).length && $(val).is(".jstree-closed")) { 
							current.push(val); 
						}else { 
							remaining.push(val); 
						}
					});
					
					//node opend
					if(current.length) {
						this.data.search.to_open = remaining;
						$.each(current, function (i, val) { 
							_this.open_node(val, function () { _this._search_open(true); }); 
						});
						done = false;
					}
				}
				
				//closed 되어 있는 node 가 없으면 search 실행
				if(done) { 
					this.search(this.data.search.str, true); 
				}
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree contextmenu plugin
 */
(function ($) {
	$.vakata.context = {
		hide_on_mouseleave : false,
		cnt		: $("<div id='vakata-contextmenu' />"),
		vis		: false,
		tgt		: false,
		par		: false,
		func	: false,
		data	: false,
		rtl		: false,
		show	: function (s, t, x, y, d, p, rtl) {
			$.vakata.context.rtl = !!rtl;
			
			
			var html = $.vakata.context.parse(s),//node 태그 
				h, 
				w;
			
			if(!html) { 
				return; 
			}
			
			$.vakata.context.vis = true;
			$.vakata.context.tgt = t;
			$.vakata.context.par = p || t || null;
			$.vakata.context.data = d || null;
			$.vakata.context.cnt.html(html).css({ "visibility" : "hidden", "display" : "block", "left" : 0, "top" : 0 });

			if($.vakata.context.hide_on_mouseleave) {
				$.vakata.context.cnt.one("mouseleave", function(e) { $.vakata.context.hide(); });
			}

			h = $.vakata.context.cnt.height();
			w = $.vakata.context.cnt.width();
			if(x + w > $(document).width()) { 
				x = $(document).width() - (w + 5); 
				$.vakata.context.cnt.find("li > ul").addClass("right"); 
			}
			if(y + h > $(document).height()) { 
				y = y - (h + t[0].offsetHeight); 
				$.vakata.context.cnt.find("li > ul").addClass("bottom"); 
			}

			$.vakata.context.cnt
				.css({ "left" : x, "top" : y })
				.find("li:has(ul)")
					.bind("mouseenter", function (e) { 
						var w = $(document).width(),
							h = $(document).height(),
							ul = $(this).children("ul").show(); 
						
						if(w !== $(document).width()) { 
							ul.toggleClass("right"); 
						}
						
						if(h !== $(document).height()) { 
							ul.toggleClass("bottom"); 
						}
					})
					.bind("mouseleave", function (e) { 
						$(this).children("ul").hide(); 
					})
					.end()
				.css({ "visibility" : "visible" })
				.show();
			$(document).triggerHandler("context_show.vakata");
		},
		hide	: function () {
			$.vakata.context.vis = false;
			$.vakata.context.cnt.attr("class","").css({ "visibility" : "hidden" });
			$(document).triggerHandler("context_hide.vakata");
		},
		//li node 테그 만들기
		parse	: function (s, is_callback) {
			if(!s) { return false; }
			var str = "",
				tmp = false,
				was_sep = true;
			if(!is_callback) { 
				$.vakata.context.func = {}; 
			}
			str += "<ul>";
			$.each(s, function (i, val) {
				//값이 없으면 리턴
				if(!val) { 
					return true; 
				}
				
				//vakata 에 함수 추가
				$.vakata.context.func[i] = val.action;
				
				//was_sep 2번째 loop 에서 false
				if(!was_sep && val.separator_before) {
					str += "<li class='vakata-separator vakata-separator-before'></li>";
				}
				
				was_sep = false;
				
				//node li 객체
				str += "<li class='" + (val._class || "") + (val._disabled ? " jstree-contextmenu-disabled " : "") + "'><ins ";
				
				if(val.icon && val.icon.indexOf("/") === -1) { 
					str += " class='" + val.icon + "' "; 
				}
				
				
				if(val.icon && val.icon.indexOf("/") !== -1) { 
					str += " style='background:url(" + val.icon + ") center center no-repeat;' "; 
				}
				str += ">&#160;</ins><a href='#' rel='" + i + "'>";
				
				if(val.submenu) {
					str += "<span style='float:" + ($.vakata.context.rtl ? "left" : "right") + ";'>&raquo;</span>";
				}
				
				str += val.label + "</a>";
				
				if(val.submenu) {
					tmp = $.vakata.context.parse(val.submenu, true);
					if(tmp) { 
						str += tmp; 
					}
				}
				str += "</li>";
				if(val.separator_after) {
					str += "<li class='vakata-separator vakata-separator-after'></li>";
					was_sep = true;
				}
			});
			str = str.replace(/<li class\='vakata-separator vakata-separator-after'\><\/li\>$/,"");
			str += "</ul>";
			$(document).triggerHandler("context_parse.vakata");
			return str.length > 10 ? str : false;
		},
		exec	: function (i) {
			//parse 에서 생선한 함수 실행
			if($.isFunction($.vakata.context.func[i])) {
				// if is string - eval and call it!
				$.vakata.context.func[i].call($.vakata.context.data, $.vakata.context.par);
				return true;
			}else { 
				return false; 
			}
		}
	};//$.vakata.context 끝
	
	$(function () {
		var css_string = '' + 
			'#vakata-contextmenu { display:block; visibility:hidden; left:0; top:-200px; position:absolute; margin:0; padding:0; min-width:180px; background:#ebebeb; border:1px solid silver; z-index:10000; *width:180px; } ' + 
			'#vakata-contextmenu ul { min-width:180px; *width:180px; } ' + 
			'#vakata-contextmenu ul, #vakata-contextmenu li { margin:0; padding:0; list-style-type:none; display:block; } ' + 
			'#vakata-contextmenu li { line-height:20px; min-height:20px; position:relative; padding:0px; } ' + 
			'#vakata-contextmenu li a { padding:1px 6px; line-height:17px; display:block; text-decoration:none; margin:1px 1px 0 1px; } ' + 
			'#vakata-contextmenu li ins { float:left; width:16px; height:16px; text-decoration:none; margin-right:2px; } ' + 
			'#vakata-contextmenu li a:hover, #vakata-contextmenu li.vakata-hover > a { background:gray; color:white; } ' + 
			'#vakata-contextmenu li ul { display:none; position:absolute; top:-2px; left:100%; background:#ebebeb; border:1px solid gray; } ' + 
			'#vakata-contextmenu .right { right:100%; left:auto; } ' + 
			'#vakata-contextmenu .bottom { bottom:-1px; top:auto; } ' + 
			'#vakata-contextmenu li.vakata-separator { min-height:0; height:1px; line-height:1px; font-size:1px; overflow:hidden; margin:0 2px; background:silver; /* border-top:1px solid #fefefe; */ padding:0; } ';
		$.vakata.css.add_sheet({ str : css_string, title : "vakata" });
		$.vakata.context.cnt
			.delegate("a","click", function (e) { e.preventDefault(); })
			.delegate("a","mouseup", function (e) {
				if(!$(this).parent().hasClass("jstree-contextmenu-disabled") && $.vakata.context.exec($(this).attr("rel"))) {
					$.vakata.context.hide();
				}else { 
					$(this).blur(); 
				}
			})
			.delegate("a","mouseover", function () {
				$.vakata.context.cnt.find(".vakata-hover").removeClass("vakata-hover");
			})
			.appendTo("body");
		$(document).bind("mousedown", function (e) { if($.vakata.context.vis && !$.contains($.vakata.context.cnt[0], e.target)) { $.vakata.context.hide(); } });
		if(typeof $.hotkeys !== "undefined") {
			$(document)
				.bind("keydown", "up", function (e) { 
					if($.vakata.context.vis) { 
						var o = $.vakata.context.cnt.find("ul:visible").last().children(".vakata-hover").removeClass("vakata-hover").prevAll("li:not(.vakata-separator)").first();
						
						if(!o.length) { 
							o = $.vakata.context.cnt.find("ul:visible").last().children("li:not(.vakata-separator)").last(); 
						}
						
						o.addClass("vakata-hover");
						e.stopImmediatePropagation(); 
						e.preventDefault();
					} 
				})
				.bind("keydown", "down", function (e) { 
					if($.vakata.context.vis) { 
						var o = $.vakata.context.cnt.find("ul:visible").last().children(".vakata-hover").removeClass("vakata-hover").nextAll("li:not(.vakata-separator)").first();
						if(!o.length) { o = $.vakata.context.cnt.find("ul:visible").last().children("li:not(.vakata-separator)").first(); }
						o.addClass("vakata-hover");
						e.stopImmediatePropagation(); 
						e.preventDefault();
					} 
				})
				.bind("keydown", "right", function (e) { 
					if($.vakata.context.vis) { 
						$.vakata.context.cnt.find(".vakata-hover").children("ul").show().children("li:not(.vakata-separator)").removeClass("vakata-hover").first().addClass("vakata-hover");
						e.stopImmediatePropagation(); 
						e.preventDefault();
					} 
				})
				.bind("keydown", "left", function (e) { 
					if($.vakata.context.vis) { 
						$.vakata.context.cnt.find(".vakata-hover").children("ul").hide().children(".vakata-separator").removeClass("vakata-hover");
						e.stopImmediatePropagation(); 
						e.preventDefault();
					} 
				})
				.bind("keydown", "esc", function (e) { 
					$.vakata.context.hide(); 
					e.preventDefault();
				})
				.bind("keydown", "space", function (e) { 
					$.vakata.context.cnt.find(".vakata-hover").last().children("a").click();
					e.preventDefault();
				});
		}
	});

	$.jstree.plugin("contextmenu", {
		__init : function () {
			this.get_container()
				.delegate("a", "contextmenu.jstree", $.proxy(function (e) {
						e.preventDefault();
						if(!$(e.currentTarget).hasClass("jstree-loading")) {
							this.show_contextmenu(e.currentTarget, e.pageX, e.pageY);
						}
					}, this))
				.delegate("a", "click.jstree", $.proxy(function (e) {
						if(this.data.contextmenu) {
							$.vakata.context.hide();
						}
					}, this))
				.bind("destroy.jstree", $.proxy(function () {
						// TODO: move this to descruct method
						if(this.data.contextmenu) {
							$.vakata.context.hide();
						}
					}, this));
			$(document).bind("context_hide.vakata", $.proxy(function () { this.data.contextmenu = false; }, this));
		},
		defaults : { 
			select_node : false, // requires UI plugin
			show_at_node : true,
			items : { // Could be a function that should return an object like this one
				"create" : {
					"separator_before"	: false,
					"separator_after"	: true,
					"label"				: "Create",
					"action"			: function (obj) { this.create(obj); }
				},
				"rename" : {
					"separator_before"	: false,
					"separator_after"	: false,
					"label"				: "Rename",
					"action"			: function (obj) { this.rename(obj); }
				},
				"remove" : {
					"separator_before"	: false,
					"icon"				: false,
					"separator_after"	: false,
					"label"				: "Delete",
					"action"			: function (obj) { if(this.is_selected(obj)) { this.remove(); } else { this.remove(obj); } }
				},
				"ccp" : {
					"separator_before"	: true,
					"icon"				: false,
					"separator_after"	: false,
					"label"				: "Edit",
					"action"			: false,
					"submenu" : { 
						"cut" : {
							"separator_before"	: false,
							"separator_after"	: false,
							"label"				: "Cut",
							"action"			: function (obj) { this.cut(obj); }
						},
						"copy" : {
							"separator_before"	: false,
							"icon"				: false,
							"separator_after"	: false,
							"label"				: "Copy",
							"action"			: function (obj) { this.copy(obj); }
						},
						"paste" : {
							"separator_before"	: false,
							"icon"				: false,
							"separator_after"	: false,
							"label"				: "Paste",
							"action"			: function (obj) { this.paste(obj); }
						}
					}
				}
			}
		},
		_fn : {
			show_contextmenu : function (obj, x, y) {
				obj = this._get_node(obj);
				var s = this.get_settings().contextmenu,
					a = obj.children("a:visible:eq(0)"),
					o = false,
					i = false;
				
				//setting 에 select_node 있고 ui pugins 사용 obj 가 선택 안되어 있으면 
				if(s.select_node && this.data.ui && !this.is_selected(obj)) {
					this.deselect_all();//selected 초기화
					this.select_node(obj, true);//obj select
				}
				
				//setting 에 show_at_node 있거나 x 또는 y 가 없는경우
				if(s.show_at_node || typeof x === "undefined" || typeof y === "undefined") {
					o = a.offset();//obj 자식중 a:visible:eq(0) y,x 좌표
					x = o.left;
					y = o.top + this.data.core.li_height;
				}
				
				//캐쉬에 있으면 값이 있으면 가져오기
				i = obj.data("jstree") && obj.data("jstree").contextmenu ? obj.data("jstree").contextmenu : s.items;
				
				//함수이면 실행
				if($.isFunction(i)) { 
					i = i.call(this, obj); 
				}
				
				this.data.contextmenu = true;
				
				$.vakata.context.show(i, a, x, y, this, obj, this._get_settings().core.rtl);
				
				if(this.data.themes) { 
					$.vakata.context.cnt.attr("class", "jstree-" + this.data.themes.theme + "-context"); 
				}
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree types plugin Adds support types of nodes You can set an attribute on
 * each li node, that represents its type. According to the type setting the
 * node may get custom icon/validation rules
 */
(function ($) {
	$.jstree.plugin("types", {
		__init : function () {
			var s = this._get_settings().types;
			this.data.types.attach_to = [];
			this.get_container()
				.bind("init.jstree", $.proxy(function () { //core init ,스타일시트에 css 문자 만들기
						var types = s.types, 
							attr  = s.type_attr, 
							icons_css = "", 
							_this = this; //instance

						$.each(types, function (i, tp) {
							$.each(tp, function (k, v) {
								if(!/^(max_depth|max_children|icon|valid_children)$/.test(k)) { 
									_this.data.types.attach_to.push(k); 
								}
							});
							
							//icon 없으면 리턴
							if(!tp.icon) { 
								return true; 
							}
							
							//icon
							if( tp.icon.image || tp.icon.position) {
								if(i == "default")	{ 
									icons_css += '.jstree-' + _this.get_index() + ' a > .jstree-icon { '; 
								}else{ 
									icons_css += '.jstree-' + _this.get_index() + ' li[' + attr + '="' + i + '"] > a > .jstree-icon { '; 
								}
								
								if(tp.icon.image)	{ 
									icons_css += ' background-image:url(' + tp.icon.image + '); '; 
								}
								
								if(tp.icon.position){ 
									icons_css += ' background-position:' + tp.icon.position + '; '; 
								}else{ 
									icons_css += ' background-position:0 0; '; 
								}
								
								icons_css += '} ';
							}
						});
						
						//스타일시트에 css 추가하기
						if(icons_css !== "") { 
							$.vakata.css.add_sheet({ 'str' : icons_css, title : "jstree-types" }); 
						}
						
					}, this))
				.bind("before.jstree", $.proxy(function (e, data) { 
						var s, t, 
							o = this._get_settings().types.use_data ? this._get_node(data.args[0]) : false, 
							d = o && o !== -1 && o.length ? o.data("jstree") : false;
						if(d && d.types && d.types[data.func] === false) { 
							e.stopImmediatePropagation(); 
							return false; 
						}
						
						if($.inArray(data.func, this.data.types.attach_to) !== -1) {
							if(!data.args[0] || (!data.args[0].tagName && !data.args[0].jquery)) { 
								return; 
							}
							s = this._get_settings().types.types;
							t = this._get_type(data.args[0]);
							if(
								( 
									(s[t] && typeof s[t][data.func] !== "undefined") || 
									(s["default"] && typeof s["default"][data.func] !== "undefined") 
								) && this._check(data.func, data.args[0]) === false
							) {
								e.stopImmediatePropagation();
								return false;
							}
						}
					}, this));
			if(is_ie6) {
				this.get_container()
					.bind("load_node.jstree set_type.jstree", $.proxy(function (e, data) {
							var r = data && data.rslt && data.rslt.obj && data.rslt.obj !== -1 ? this._get_node(data.rslt.obj).parent() : this.get_container_ul(),
								c = false,
								s = this._get_settings().types;
							$.each(s.types, function (i, tp) {
								if(tp.icon && (tp.icon.image || tp.icon.position)) {
									c = i === "default" ? r.find("li > a > .jstree-icon") : r.find("li[" + s.type_attr + "='" + i + "'] > a > .jstree-icon");
									if(tp.icon.image) { 
										c.css("backgroundImage","url(" + tp.icon.image + ")"); 
									}
									c.css("backgroundPosition", tp.icon.position || "0 0");
								}
							});
						}, this));
			}
		},
		defaults : {
			// defines maximum number of root nodes (-1 means unlimited, -2
			// means disable max_children checking)
			max_children		: -1,
			// defines the maximum depth of the tree (-1 means unlimited, -2
			// means disable max_depth checking)
			max_depth			: -1,
			// defines valid node types for the root nodes
			valid_children		: "all",

			// whether to use $.data
			use_data : false, 
			// where is the type stores (the rel attribute of the LI element)
			type_attr : "rel",
			// a list of types
			types : {
				// the default type
				"default" : {
					"max_children"	: -1,
					"max_depth"		: -1,
					"valid_children": "all"

					// Bound functions - you can bind any other function here
					// (using boolean or function)
					// "select_node" : true
				}
			}
		},
		_fn : {
			_types_notify : function (n, data) {
				if(data.type && this._get_settings().types.use_data) {
					this.set_type(data.type, n);
				}
			},
			_get_type : function (obj) {
				obj = this._get_node(obj);
				//node 속성중 setting 값중 type_attr 의 속성이 있으면 가져오고 없으면 default 
				return (!obj || !obj.length) ? false : obj.attr(this._get_settings().types.type_attr) || "default";
			},
			set_type : function (str, obj) {
				obj = this._get_node(obj);
				
				//node 속성중 setting 값중 type_attr 의 속성이 값 set(str)
				var ret = (!obj.length || !str) ? false : obj.attr(this._get_settings().types.type_attr, str);
				
				if(ret) { 
					this.__callback({ obj : obj, type : str}); 
				}
				
				return ret;
			},
			_check : function (rule, obj, opts) {
				obj = this._get_node(obj);
				var v = false, 
					//setting의 type_attr값 가져오기
					t = this._get_type(obj), 
					d = 0, 
					_this = this, 
					s = this._get_settings().types, 
					data = false;
				
				if(obj === -1) {//node 없으드면 
					if(!!s[rule]) { //setting 에 rule 있으면 v에 할당
						v = s[rule]; 
					}else { 
						return; 
					}
				}else {
					if(t === false) {//type_attr값 없으면 리턴 
						return; 
					}
					
					//setting 에 use_data 있으면 node 에서 jstree 캐쉬값 가져오기
					data = s.use_data ? obj.data("jstree") : false;
					
					//s.use_data.types[rule] 값 vdp
					if(data && data.types && typeof data.types[rule] !== "undefined") { 
						v = data.types[rule];
					//setting 에 types[type_attr][rule]
					}else if(!!s.types[t] && typeof s.types[t][rule] !== "undefined") { 
						v = s.types[t][rule]; 
						
					//setting 에 types["default"][rule]
					}else if(!!s.types["default"] && typeof s.types["default"][rule] !== "undefined") { 
						v = s.types["default"][rule]; 
					}
				}
				if($.isFunction(v)) { 
					v = v.call(this, obj); 
				}
				if(rule === "max_depth" && obj !== -1 && opts !== false && s.max_depth !== -2 && v !== 0) {
					// also include the node itself - otherwise if root node it is not checked
					obj.children("a:eq(0)").parentsUntil(".jstree","li").each(function (i) {
						// check if current depth already exceeds global tree depth
						if(s.max_depth !== -1 && s.max_depth - (i + 1) <= 0) { 
							v = 0; 
							return false; 
						}
						d = (i === 0) ? v : _this._check(rule, this, false);
						// check if current node max depth is already matched or
						// exceeded
						if(d !== -1 && d - (i + 1) <= 0) { 
							v = 0; 
							return false; 
						}
						// otherwise - set the max depth to the current value
						// minus current depth
						if(d >= 0 && (d - (i + 1) < v || v < 0) ) { 
							v = d - (i + 1); 
						}
						// if the global tree depth exists and it minus the
						// nodes calculated so far is less than `v` or `v` is
						// unlimited
						if(s.max_depth >= 0 && (s.max_depth - (i + 1) < v || v < 0) ) { 
							v = s.max_depth - (i + 1); 
						}
					});
				}
				return v;
			},
			check_move : function () {
				if(!this.__call_old()) { return false; }
				var m  = this._get_move(),
					s  = m.rt._get_settings().types,
					mc = m.rt._check("max_children", m.cr),
					md = m.rt._check("max_depth", m.cr),
					vc = m.rt._check("valid_children", m.cr),
					ch = 0, d = 1, t;

				if(vc === "none") { return false; } 
				if($.isArray(vc) && m.ot && m.ot._get_type) {
					m.o.each(function () {
						if($.inArray(m.ot._get_type(this), vc) === -1) { d = false; return false; }
					});
					if(d === false) { return false; }
				}
				if(s.max_children !== -2 && mc !== -1) {
					ch = m.cr === -1 ? this.get_container().find("> ul > li").not(m.o).length : m.cr.find("> ul > li").not(m.o).length;
					if(ch + m.o.length > mc) { return false; }
				}
				if(s.max_depth !== -2 && md !== -1) {
					d = 0;
					if(md === 0) { return false; }
					if(typeof m.o.d === "undefined") {
						// TODO: deal with progressive rendering and async when
						// checking max_depth (how to know the depth of the
						// moved node)
						t = m.o;
						while(t.length > 0) {
							t = t.find("> ul > li");
							d ++;
						}
						m.o.d = d;
					}
					if(md - m.o.d < 0) { return false; }
				}
				return true;
			},
			create_node : function (obj, position, js, callback, is_loaded, skip_check) {
				if(!skip_check && (is_loaded || this._is_loaded(obj))) {
					var p  = (typeof position == "string" && position.match(/^before|after$/i) && obj !== -1) ? this._get_parent(obj) : this._get_node(obj),
						s  = this._get_settings().types,
						mc = this._check("max_children", p),
						md = this._check("max_depth", p),
						vc = this._check("valid_children", p),
						ch;
					if(typeof js === "string") { 
						js = { data : js }; 
					}
					
					if(!js) { 
						js = {}; 
					}
					
					if(vc === "none") { 
						return false; 
					}
					
					if($.isArray(vc)) {
						if(!js.attr || !js.attr[s.type_attr]) { 
							if(!js.attr) { 
								js.attr = {}; 
							}
							js.attr[s.type_attr] = vc[0]; 
						}else {
							if($.inArray(js.attr[s.type_attr], vc) === -1) { return false; }
						}
					}
					if(s.max_children !== -2 && mc !== -1) {
						ch = p === -1 ? this.get_container().find("> ul > li").length : p.find("> ul > li").length;
						if(ch + 1 > mc) { 
							return false; 
						}
					}
					if(s.max_depth !== -2 && md !== -1 && (md - 1) < 0) { 
						return false; 
					}
				}
				return this.__call_old(true, obj, position, js, callback, is_loaded, skip_check);
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree HTML plugin The HTML data store. Datastores are build by replacing the
 * `load_node` and `_is_loaded` functions.
 */
(function ($) {
	$.jstree.plugin("html_data", {
		__init : function () { 
			// this used to use html() and clean the whitespace, but this way
			// any attached data was lost
			this.data.html_data.original_container_html = this.get_container().find(" > ul > li").clone(true);
			// remove white space from LI node - otherwise nodes appear a bit to
			// the right
			this.data.html_data.original_container_html.find("li").andSelf().contents().filter(function() { return this.nodeType == 3; }).remove();
		},
		defaults : { 
			data : false,
			ajax : false,
			correct_state : true
		},
		_fn : {
			load_node : function (obj, s_call, e_call) { 
				var _this = this;
				
				this.load_node_html(obj, function () { 
					_this.__callback({ "obj" : _this._get_node(obj) 
				});
						
				s_call.call(this);
				
				}, e_call);
				
				
			},
			_is_loaded : function (obj) { 
				obj = this._get_node(obj); 
				return obj == -1 || !obj || (!this._get_settings().html_data.ajax && !$.isFunction(this._get_settings().html_data.data)) || obj.is(".jstree-open, .jstree-leaf") || obj.children("ul").children("li").size() > 0;
			},
			load_node_html : function (obj, s_call, e_call) {
				var d,
					s = this.get_settings().html_data,
					error_func = function () {},
					success_func = function () {};
				obj = this._get_node(obj);
				
				if(obj && obj !== -1) {
					if(obj.data("jstree_is_loading")) { 
						return; 
					}else { 
						obj.data("jstree_is_loading",true); 
					}
				}
				
				switch(!0) {
					case ($.isFunction(s.data))://함수이면
						s.data.call(this, obj, $.proxy(function (d) {//함수실행
							if(d && d !== "" && d.toString && d.toString().replace(/^[\s\n]+$/,"") !== "") {
								d = $(d);//jquery 함수로
								
								if(!d.is("ul")) {//ul 태그 없으면 
									d = $("<ul />").append(d); 
								}
								
								if(obj == -1 || !obj) { //obj 가 없으면
									//상위 노드 제거후 다시 삽입
									this.get_container().children("ul").empty().append(d.children()).find("li, a").filter(function () {
											//자식중 INS 태그가 아닌것
											return !this.firstChild || !this.firstChild.tagName || this.firstChild.tagName !== "INS"; 
										}).prepend("<ins class='jstree-icon'>&#160;</ins>")//아이콘 앞에 삽입
										.end()
										.filter("a")
										.children("ins:first-child")
										.not(".jstree-icon")
										.addClass("jstree-icon"); //ins 태그중 class 없는것에 class 추가
								}else { 
									obj.children("a.jstree-loading").removeClass("jstree-loading");//jstree-loading 제거 
									
									obj.append(d).children("ul").find("li, a").filter(function () { 
										return !this.firstChild || !this.firstChild.tagName || this.firstChild.tagName !== "INS"; 
									}).prepend("<ins class='jstree-icon'>&#160;</ins>")
									.end()
									.filter("a")
									.children("ins:first-child")
									.not(".jstree-icon")
									.addClass("jstree-icon");
									
									obj.removeData("jstree_is_loading"); 
								}
								
								this.clean_node(obj);
								
								if(s_call) { 
									s_call.call(this); 
								}
							}else {
								if(obj && obj !== -1) {
									obj.children("a.jstree-loading").removeClass("jstree-loading");
									obj.removeData("jstree_is_loading");
									if(s.correct_state) { 
										this.correct_state(obj);
										if(s_call) { 
											s_call.call(this); 
										} 
									}
								}else {
									if(s.correct_state) { 
										this.get_container().children("ul").empty();
										if(s_call) { 
											s_call.call(this); 
										} 
									}
								}
							}
						}, this));
						break;
					case (!s.data && !s.ajax)://s.data없고 ajax 아닌거
						if(!obj || obj == -1) {
							this.get_container()
								.children("ul").empty()//모든 노드 제거
								.append(this.data.html_data.original_container_html)//본사했었든 노드 삽입
								.find("li, a").filter(function () { 
									return !this.firstChild || !this.firstChild.tagName || this.firstChild.tagName !== "INS"; 
									}).prepend("<ins class='jstree-icon'>&#160;</ins>")
									.end()
									.filter("a")
									.children("ins:first-child")
									.not(".jstree-icon")
									.addClass("jstree-icon");
							
							this.clean_node();
						}
					
						if(s_call) { 
							s_call.call(this); 
						}
						
						break;
					case (!!s.data && !s.ajax) || (!!s.data && !!s.ajax && (!obj || obj === -1)):
						if(!obj || obj == -1) {
							d = $(s.data);
							
							if(!d.is("ul")) { 
								d = $("<ul />").append(d); 
							}
							
							this.get_container()
								.children("ul").empty().append(d.children())
								.find("li, a").filter(function () { 
									return !this.firstChild || !this.firstChild.tagName || this.firstChild.tagName !== "INS"; 
									}).prepend("<ins class='jstree-icon'>&#160;</ins>")
									.end()
									.filter("a")
									.children("ins:first-child")
									.not(".jstree-icon")
									.addClass("jstree-icon");
							this.clean_node();
						}
					
						if(s_call) { 
							s_call.call(this); 
						}
						
						break;
					case (!s.data && !!s.ajax) || (!!s.data && !!s.ajax && obj && obj !== -1):
						obj = this._get_node(obj);
						error_func = function (x, t, e) {
							var ef = this.get_settings().html_data.ajax.error; 
							if(ef) { 
								ef.call(this, x, t, e); 
							}
							
							if(obj != -1 && obj.length) {
								obj.children("a.jstree-loading").removeClass("jstree-loading");
								obj.removeData("jstree_is_loading");
								if(t === "success" && s.correct_state) { 
									this.correct_state(obj); 
								}
							}else {
								if(t === "success" && s.correct_state) { 
									this.get_container().children("ul").empty(); 
								}
							}
							
							if(e_call) { 
								e_call.call(this); 
							}
							
						};
						success_func = function (d, t, x) {
							var sf = this.get_settings().html_data.ajax.success; 
							if(sf) { 
								d = sf.call(this,d,t,x) || d; 
							}
							
							if(d === "" || (d && d.toString && d.toString().replace(/^[\s\n]+$/,"") === "")) {
								return error_func.call(this, x, t, "");
							}
							
							if(d) {
								d = $(d);
								if(!d.is("ul")) { 
									d = $("<ul />").append(d); 
								}
								
								if(obj == -1 || !obj) { 
									this.get_container().children("ul").empty().append(d.children()).find("li, a").filter(function () { return !this.firstChild || !this.firstChild.tagName || this.firstChild.tagName !== "INS"; }).prepend("<ins class='jstree-icon'>&#160;</ins>").end().filter("a").children("ins:first-child").not(".jstree-icon").addClass("jstree-icon"); 
								}else { 
									obj.children("a.jstree-loading").removeClass("jstree-loading"); obj.append(d).children("ul").find("li, a").filter(function () { return !this.firstChild || !this.firstChild.tagName || this.firstChild.tagName !== "INS"; }).prepend("<ins class='jstree-icon'>&#160;</ins>").end().filter("a").children("ins:first-child").not(".jstree-icon").addClass("jstree-icon"); obj.removeData("jstree_is_loading"); 
								}
								
								this.clean_node(obj);
								
								if(s_call) { 
									s_call.call(this); 
								}
							}else {
								if(obj && obj !== -1) {
									obj.children("a.jstree-loading").removeClass("jstree-loading");
									obj.removeData("jstree_is_loading");
									if(s.correct_state) { 
										this.correct_state(obj);
										if(s_call) { 
											s_call.call(this); 
										} 
									}
								}else {
									if(s.correct_state) { 
										this.get_container().children("ul").empty();
										if(s_call) { 
											s_call.call(this); 
										} 
									}
								}
							}
						};
						s.ajax.context = this;
						s.ajax.error = error_func;
						s.ajax.success = success_func;
						
						if(!s.ajax.dataType) {//type
							s.ajax.dataType = "html"; 
						}
						
						if($.isFunction(s.ajax.url)) {//url
							s.ajax.url = s.ajax.url.call(this, obj); 
						}
						
						if($.isFunction(s.ajax.data)) {//data 
							s.ajax.data = s.ajax.data.call(this, obj); 
						}
						
						$.ajax(s.ajax);
						
						break;
				}
			}
		}
	});
	// include the HTML data plugin by default
	$.jstree.defaults.plugins.push("html_data");
})(jQuery);
// */

/*
 * jsTree themeroller plugin Adds support for jQuery UI themes. Include this at
 * the end of your plugins list, also make sure "themes" is not included.
 */
(function ($) {
	$.jstree.plugin("themeroller", {
		__init : function () {
			var s = this._get_settings().themeroller;
			this.get_container()
				.addClass("ui-widget-content")
				.addClass("jstree-themeroller")
				.delegate("a","mouseenter.jstree", function (e) {
					if(!$(e.currentTarget).hasClass("jstree-loading")) {
						$(this).addClass(s.item_h);
					}
				})
				.delegate("a","mouseleave.jstree", function () {
					$(this).removeClass(s.item_h);
				})
				.bind("init.jstree", $.proxy(function (e, data) { 
						data.inst.get_container().find("> ul > li > .jstree-loading > ins").addClass("ui-icon-refresh");
						this._themeroller(data.inst.get_container().find("> ul > li"));
					}, this))
				.bind("open_node.jstree create_node.jstree", $.proxy(function (e, data) { 
						this._themeroller(data.rslt.obj);
					}, this))
				.bind("loaded.jstree refresh.jstree", $.proxy(function (e) {
						this._themeroller();
					}, this))
				.bind("close_node.jstree", $.proxy(function (e, data) {
						this._themeroller(data.rslt.obj);
					}, this))
				.bind("delete_node.jstree", $.proxy(function (e, data) {
						this._themeroller(data.rslt.parent);
					}, this))
				.bind("correct_state.jstree", $.proxy(function (e, data) {
						data.rslt.obj
							.children("ins.jstree-icon").removeClass(s.opened + " " + s.closed + " ui-icon").end()
							.find("> a > ins.ui-icon")
								.filter(function() { 
									return this.className.toString()
										.replace(s.item_clsd,"").replace(s.item_open,"").replace(s.item_leaf,"")
										.indexOf("ui-icon-") === -1; 
								}).removeClass(s.item_open + " " + s.item_clsd).addClass(s.item_leaf || "jstree-no-icon");
					}, this))
				.bind("select_node.jstree", $.proxy(function (e, data) {
						data.rslt.obj.children("a").addClass(s.item_a);
					}, this))
				.bind("deselect_node.jstree deselect_all.jstree", $.proxy(function (e, data) {
						this.get_container()
							.find("a." + s.item_a).removeClass(s.item_a).end()
							.find("a.jstree-clicked").addClass(s.item_a);
					}, this))
				.bind("dehover_node.jstree", $.proxy(function (e, data) {
						data.rslt.obj.children("a").removeClass(s.item_h);
					}, this))
				.bind("hover_node.jstree", $.proxy(function (e, data) {
						this.get_container()
							.find("a." + s.item_h).not(data.rslt.obj).removeClass(s.item_h);
						data.rslt.obj.children("a").addClass(s.item_h);
					}, this))
				.bind("move_node.jstree", $.proxy(function (e, data) {
						this._themeroller(data.rslt.o);
						this._themeroller(data.rslt.op);
					}, this));
		},
		__destroy : function () {
			var s = this._get_settings().themeroller,
				c = [ "ui-icon" ];
			$.each(s, function (i, v) {
				v = v.split(" ");
				if(v.length) { c = c.concat(v); }
			});
			this.get_container()
				.removeClass("ui-widget-content")
				.find("." + c.join(", .")).removeClass(c.join(" "));
		},
		_fn : {
			_themeroller : function (obj) {
				var s = this._get_settings().themeroller;
				obj = !obj || obj == -1 ? this.get_container_ul() : this._get_node(obj).parent();
				obj
					.find("li.jstree-closed")
						.children("ins.jstree-icon").removeClass(s.opened).addClass("ui-icon " + s.closed).end()
						.children("a").addClass(s.item)
							.children("ins.jstree-icon").addClass("ui-icon")
								.filter(function() { 
									return this.className.toString()
										.replace(s.item_clsd,"").replace(s.item_open,"").replace(s.item_leaf,"")
										.indexOf("ui-icon-") === -1; 
								}).removeClass(s.item_leaf + " " + s.item_open).addClass(s.item_clsd || "jstree-no-icon")
								.end()
							.end()
						.end()
					.end()
					.find("li.jstree-open")
						.children("ins.jstree-icon").removeClass(s.closed).addClass("ui-icon " + s.opened).end()
						.children("a").addClass(s.item)
							.children("ins.jstree-icon").addClass("ui-icon")
								.filter(function() { 
									return this.className.toString()
										.replace(s.item_clsd,"").replace(s.item_open,"").replace(s.item_leaf,"")
										.indexOf("ui-icon-") === -1; 
								}).removeClass(s.item_leaf + " " + s.item_clsd).addClass(s.item_open || "jstree-no-icon")
								.end()
							.end()
						.end()
					.end()
					.find("li.jstree-leaf")
						.children("ins.jstree-icon").removeClass(s.closed + " ui-icon " + s.opened).end()
						.children("a").addClass(s.item)
							.children("ins.jstree-icon").addClass("ui-icon")
								.filter(function() { 
									return this.className.toString()
										.replace(s.item_clsd,"").replace(s.item_open,"").replace(s.item_leaf,"")
										.indexOf("ui-icon-") === -1; 
								}).removeClass(s.item_clsd + " " + s.item_open).addClass(s.item_leaf || "jstree-no-icon");
			}
		},
		defaults : {
			"opened"	: "ui-icon-triangle-1-se",
			"closed"	: "ui-icon-triangle-1-e",
			"item"		: "ui-state-default",
			"item_h"	: "ui-state-hover",
			"item_a"	: "ui-state-active",
			"item_open"	: "ui-icon-folder-open",
			"item_clsd"	: "ui-icon-folder-collapsed",
			"item_leaf"	: "ui-icon-document"
		}
	});
	$(function() {
		var css_string = '' + 
			'.jstree-themeroller .ui-icon { overflow:visible; } ' + 
			'.jstree-themeroller a { padding:0 2px; } ' + 
			'.jstree-themeroller .jstree-no-icon { display:none; }';
		$.vakata.css.add_sheet({ str : css_string, title : "jstree" });
	});
})(jQuery);
// */

/*
 * jsTree unique plugin Forces different names amongst siblings (still a bit
 * experimental) NOTE: does not check language versions (it will not be possible
 * to have nodes with the same title, even in different languages)
 */
(function ($) {
	$.jstree.plugin("unique", {
		__init : function () {
			this.get_container()
				//함수 실행전에 트리거에 의해서 before.jstree 호출
				.bind("before.jstree", $.proxy(function (e, data) { 
						var nms = [], 
							res = true, 
							p, 
							t;
						
						//move_node 함수일때
						if(data.func == "move_node") {
							// obj, ref, position, is_copy, is_prepared,skip_check
							if(data.args[4] === true) {
								if(data.args[0].o && data.args[0].o.length) {
									data.args[0].o.children("a").each(function () { 
										nms.push($(this).text().replace(/^\s+/g,"")); 
									});
									res = this._check_unique(nms, data.args[0].np.find("> ul > li").not(data.args[0].o), "move_node");
								}
							}
						}
						
						if(data.func == "create_node") {
							// obj, position, js, callback, is_loaded
							if(data.args[4] || this._is_loaded(data.args[0])) {
								p = this._get_node(data.args[0]);
								if(data.args[1] && (data.args[1] === "before" || data.args[1] === "after")) {
									p = this._get_parent(data.args[0]);
									if(!p || p === -1) { 
										p = this.get_container(); 
									}
								}
								
								if(typeof data.args[2] === "string") { 
									nms.push(data.args[2]); 
								}else if(!data.args[2] || !data.args[2].data) { 
									nms.push(this._get_string("new_node")); 
								}else { 
									nms.push(data.args[2].data); 
								}
								
								res = this._check_unique(nms, p.find("> ul > li"), "create_node");
							}
						}
						
						if(data.func == "rename_node") {
							// obj, val
							nms.push(data.args[1]);
							t = this._get_node(data.args[0]);
							p = this._get_parent(t);
							
							if(!p || p === -1) { 
								p = this.get_container(); 
							}
							
							res = this._check_unique(nms, p.find("> ul > li").not(t), "rename_node");
						}
						
						if(!res) {
							e.stopPropagation();
							return false;
						}
					}, this));
		},
		defaults : { 
			error_callback : $.noop
		},
		_fn : { 
			_check_unique : function (nms, p, func) {
				var cnms = [];
				p.children("a").each(function () { 
					cnms.push($(this).text().replace(/^\s+/g,"")); 
				});
				
				if(!cnms.length || !nms.length) { 
					return true; 
				}
				
				cnms = cnms.sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g,"$1$2$4").replace(/,,+/g,",").replace(/,$/,"").split(",");
				if((cnms.length + nms.length) != cnms.concat(nms).sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g,"$1$2$4").replace(/,,+/g,",").replace(/,$/,"").split(",").length) {
					this._get_settings().unique.error_callback.call(null, nms, p, func);
					return false;
				}
				return true;
			},
			check_move : function () {
				if(!this.__call_old()) { return false; }
				var p = this._get_move(), nms = [];
				if(p.o && p.o.length) {
					p.o.children("a").each(function () { nms.push($(this).text().replace(/^\s+/g,"")); });
					return this._check_unique(nms, p.np.find("> ul > li").not(p.o), "check_move");
				}
				return true;
			}
		}
	});
})(jQuery);
// */

/*
 * jsTree wholerow plugin Makes select and hover work on the entire width of the
 * node MAY BE HEAVY IN LARGE DOM
 */
(function ($) {
	$.jstree.plugin("wholerow", {
		__init : function () {
			if(!this.data.ui) {//ui plugin 필수 
				throw "jsTree wholerow: jsTree UI plugin not included."; 
			}
			this.data.wholerow.html = false;
			this.data.wholerow.to = false;
			this.get_container()
				.bind("init.jstree", $.proxy(function (e, data) { 
						this._get_settings().core.animation = 0;
					}, this))
				.bind("open_node.jstree create_node.jstree clean_node.jstree loaded.jstree", $.proxy(function (e, data) { 
						this._prepare_wholerow_span( data && data.rslt && data.rslt.obj ? data.rslt.obj : -1 );
					}, this))
				.bind("search.jstree clear_search.jstree reopen.jstree after_open.jstree after_close.jstree create_node.jstree delete_node.jstree clean_node.jstree", $.proxy(function (e, data) { 
						if(this.data.to) { clearTimeout(this.data.to); }
						this.data.to = setTimeout( (function (t, o) { return function() { t._prepare_wholerow_ul(o); }; })(this,  data && data.rslt && data.rslt.obj ? data.rslt.obj : -1), 0);
					}, this))
				.bind("deselect_all.jstree", $.proxy(function (e, data) { 
						this.get_container().find(" > .jstree-wholerow .jstree-clicked").removeClass("jstree-clicked " + (this.data.themeroller ? this._get_settings().themeroller.item_a : "" ));
					}, this))
				.bind("select_node.jstree deselect_node.jstree ", $.proxy(function (e, data) { 
						data.rslt.obj.each(function () { 
							var ref = data.inst.get_container().find(" > .jstree-wholerow li:visible:eq(" + ( parseInt((($(this).offset().top - data.inst.get_container().offset().top + data.inst.get_container()[0].scrollTop) / data.inst.data.core.li_height),10)) + ")");
							// ref.children("a")[e.type === "select_node" ?
							// "addClass" : "removeClass"]("jstree-clicked");
							ref.children("a").attr("class",data.rslt.obj.children("a").attr("class"));
						});
					}, this))
				.bind("hover_node.jstree dehover_node.jstree", $.proxy(function (e, data) { 
						this.get_container().find(" > .jstree-wholerow .jstree-hovered").removeClass("jstree-hovered " + (this.data.themeroller ? this._get_settings().themeroller.item_h : "" ));
						if(e.type === "hover_node") {
							var ref = this.get_container().find(" > .jstree-wholerow li:visible:eq(" + ( parseInt(((data.rslt.obj.offset().top - this.get_container().offset().top + this.get_container()[0].scrollTop) / this.data.core.li_height),10)) + ")");
							// ref.children("a").addClass("jstree-hovered");
							ref.children("a").attr("class",data.rslt.obj.children(".jstree-hovered").attr("class"));
						}
					}, this))
				.delegate(".jstree-wholerow-span, ins.jstree-icon, li", "click.jstree", function (e) {
						var n = $(e.currentTarget);
						if(e.target.tagName === "A" || (e.target.tagName === "INS" && n.closest("li").is(".jstree-open, .jstree-closed"))) { 
							return; 
						}
						n.closest("li").children("a:visible:eq(0)").click();
						e.stopImmediatePropagation();
					})
				.delegate("li", "mouseover.jstree", $.proxy(function (e) {
						e.stopImmediatePropagation();
						if($(e.currentTarget).children(".jstree-hovered, .jstree-clicked").length) { 
							return false; 
						}
						this.hover_node(e.currentTarget);
						return false;
					}, this))
				.delegate("li", "mouseleave.jstree", $.proxy(function (e) {
						if($(e.currentTarget).children("a").hasClass("jstree-hovered").length) { 
							return; 
						}
						this.dehover_node(e.currentTarget);
					}, this));
			
			if(is_ie7 || is_ie6) {
				$.vakata.css.add_sheet({ str : ".jstree-" + this.get_index() + " { position:relative; } ", title : "jstree" });
			}
		},
		defaults : {
		},
		__destroy : function () {
			this.get_container().children(".jstree-wholerow").remove();
			this.get_container().find(".jstree-wholerow-span").remove();
		},
		_fn : {
			_prepare_wholerow_span : function (obj) {
				obj = !obj || obj == -1 ? this.get_container().find("> ul > li") : this._get_node(obj);
				
				if(obj === false) { 
					return; 
				} // added for removing root nodes
				
				obj.each(function () {
					$(this).find("li").andSelf().each(function () {
						var $t = $(this);
						if($t.children(".jstree-wholerow-span").length) { 
							return true; 
						}
						$t.prepend("<span class='jstree-wholerow-span' style='width:" + ($t.parentsUntil(".jstree","li").length * 18) + "px;'>&#160;</span>");
					});
				});
			},
			_prepare_wholerow_ul : function () {
				var o = this.get_container().children("ul").eq(0), h = o.html();
				o.addClass("jstree-wholerow-real");
				if(this.data.wholerow.last_html !== h) {
					this.data.wholerow.last_html = h;
					this.get_container().children(".jstree-wholerow").remove();
					this.get_container().append(
						o.clone().removeClass("jstree-wholerow-real")
							.wrapAll("<div class='jstree-wholerow' />").parent()
							.width(o.parent()[0].scrollWidth)
							.css("top", (o.height() + ( is_ie7 ? 5 : 0)) * -1 )
							.find("li[id]").each(function () { this.removeAttribute("id"); }).end()
					);
				}
			}
		}
	});
	$(function() {
		var css_string = '' + 
			'.jstree .jstree-wholerow-real { position:relative; z-index:1; } ' + 
			'.jstree .jstree-wholerow-real li { cursor:pointer; } ' + 
			'.jstree .jstree-wholerow-real a { border-left-color:transparent !important; border-right-color:transparent !important; } ' + 
			'.jstree .jstree-wholerow { position:relative; z-index:0; height:0; } ' + 
			'.jstree .jstree-wholerow ul, .jstree .jstree-wholerow li { width:100%; } ' + 
			'.jstree .jstree-wholerow, .jstree .jstree-wholerow ul, .jstree .jstree-wholerow li, .jstree .jstree-wholerow a { margin:0 !important; padding:0 !important; } ' + 
			'.jstree .jstree-wholerow, .jstree .jstree-wholerow ul, .jstree .jstree-wholerow li { background:transparent !important; }' + 
			'.jstree .jstree-wholerow ins, .jstree .jstree-wholerow span, .jstree .jstree-wholerow input { display:none !important; }' + 
			'.jstree .jstree-wholerow a, .jstree .jstree-wholerow a:hover { text-indent:-9999px; !important; width:100%; padding:0 !important; border-right-width:0px !important; border-left-width:0px !important; } ' + 
			'.jstree .jstree-wholerow-span { position:absolute; left:0; margin:0px; padding:0; height:18px; border-width:0; padding:0; z-index:0; }';
		if(is_ff2) {
			css_string += '' + 
				'.jstree .jstree-wholerow a { display:block; height:18px; margin:0; padding:0; border:0; } ' + 
				'.jstree .jstree-wholerow-real a { border-color:transparent !important; } ';
		}
		if(is_ie7 || is_ie6) {
			css_string += '' + 
				'.jstree .jstree-wholerow, .jstree .jstree-wholerow li, .jstree .jstree-wholerow ul, .jstree .jstree-wholerow a { margin:0; padding:0; line-height:18px; } ' + 
				'.jstree .jstree-wholerow a { display:block; height:18px; line-height:18px; overflow:hidden; } ';
		}
		$.vakata.css.add_sheet({ str : css_string, title : "jstree" });
	});
})(jQuery);
// */

/*
 * jsTree model plugin This plugin gets jstree to use a class model to retrieve
 * data, creating great dynamism
 */
(function ($) {
	var nodeInterface = ["getChildren","getChildrenCount","getAttr","getName","getProps"],
		validateInterface = function(obj, inter) {
			var valid = true;
			obj = obj || {};
			inter = [].concat(inter);
			$.each(inter, function (i, v) {
				if(!$.isFunction(obj[v])) {//obj 중 함수가 아닌게 있으면 false
					valid = false; 
					return false; 
				}
			});
			return valid;
		};
	$.jstree.plugin("model", {
		__init : function () {
			//json_data plugin 사용 안하면 error
			if(!this.data.json_data) { 
				throw "jsTree model: jsTree json_data plugin not included."; 
			}
			
			this._get_settings().json_data.data = function (n, b) {
				var obj = (n == -1) ? this._get_settings().model.object : n.data("jstree_model");
				
				//obj 에 nodeInterface 있는 함수가 있으면 콜백 실행
				if(!validateInterface(obj, nodeInterface)) { 
					return b.call(null, false); 
				}
				
				if(this._get_settings().model.async) {
					obj.getChildren($.proxy(function (data) {
						this.model_done(data, b);
					}, this));
				}else {
					this.model_done(obj.getChildren(), b);
				}
			};
		},
		defaults : {
			object : false,
			id_prefix : false,
			async : false
		},
		_fn : {
			model_done : function (data, callback) {
				var ret = [], 
					s = this._get_settings(),
					_this = this;

				if(!$.isArray(data)) { //배열로 변경
					data = [data]; 
				}
				
				$.each(data, function (i, nd) {
					var r = nd.getProps() || {};
					r.attr = nd.getAttr() || {};
					
					if(nd.getChildrenCount()) { 
						r.state = "closed"; 
					}
					
					r.data = nd.getName();
					
					if(!$.isArray(r.data)) { 
						r.data = [r.data]; 
					}
					
					if(_this.data.types && $.isFunction(nd.getType)) {
						r.attr[s.types.type_attr] = nd.getType();
					}
					
					if(r.attr.id && s.model.id_prefix) { 
						r.attr.id = s.model.id_prefix + r.attr.id; 
					}
					
					if(!r.metadata) { 
						r.metadata = { }; 
					}
					
					r.metadata.jstree_model = nd;
					ret.push(r);
				});
				callback.call(null, ret);
			}
		}
	});
})(jQuery);
// */

})();
