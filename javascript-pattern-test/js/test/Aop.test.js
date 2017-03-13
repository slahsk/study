var Aop = require('../lib/Aop.js');

describe('Aop', function() {

	var targetObj,
			excutionPoints;

	var argPassingAdvice,
			argsToTatget;

	beforeEach(function(){


		targetObj = {
			targetFn : function(){
				excutionPoints.push('targetFn');
				argsToTatget = Array.prototype.slice.call(arguments,0);
			}
		};

		excutionPoints = [];

		argPassingAdvice = function(targetInfo){
			targetInfo.fn.apply(this,targetInfo.args);
		};
		argsToTatget = [];
	});

	describe('Aop.around(fnName, advice, targetObj)',function(){
		it('타켓 함수를 호출 시 어드바이스를 실행하도록 한다.',function(){


			var excutedAdvice = false;
			var advice = function(){
					excutedAdvice = true;
			};
			console.log(Aop);
			Aop.around('targetFn',advice,targetObj);
			targetObj.targetFn();
			expect(excutedAdvice).toBe(true);

		});

		it('어드바이스가 타깃 호출을 래핑한다',function(){
			var wrappingAdvice = function(targetInfo){
				excutionPoints.push('wrappingAdvice - 처음');
				targetInfo.fn();
				excutionPoints.push('wrappingAdvice - 끝');
			};

			Aop.around('targetFn',wrappingAdvice,targetObj);
			targetObj.targetFn();
			expect(excutionPoints).toEqual(['wrappingAdvice - 처음','targetFn','wrappingAdvice - 끝']);
		});

		it('마지막 어드바이스가 기존 어드바이스에 대해 실행되는 방식으로 체이닝할 수 있다.',function(){
			var adviceFactory = function(adviceID){
				return (function(targetInfo){
					excutionPoints.push('wrappingAdvice - 처음 ' + adviceID);
					targetInfo.fn();
					excutionPoints.push('wrappingAdvice - 끝 ' + adviceID);
				});
			};

			Aop.around('targetFn',adviceFactory('안쪽'),targetObj);
			Aop.around('targetFn',adviceFactory('바깥쪽'),targetObj);
			targetObj.targetFn();
			expect(excutionPoints).toEqual(
				[
					'wrappingAdvice - 처음 바깥쪽',
					'wrappingAdvice - 처음 안쪽',
					'targetFn',
					'wrappingAdvice - 끝 안쪽',
					'wrappingAdvice - 끝 바깥쪽'
				]
			);
		});

		it('어드바이스에서 타깃으로 일반 인자를 넘길 수 있다.',function(){
			Aop.around('targetFn',argPassingAdvice,targetObj);
			targetObj.targetFn('a','b');
			expect(argsToTatget).toEqual(['a','b']);
		});


		// it('타깃의 반환값도 어드바이스에서 참조할 수 있다.',function(){
		// 	Aop.around('targetFn',argPassingAdvice,targetObj);
		// 	var returnValue = targetObj.targetFn();
		// 	expect(returnValue).toBe(argPassingAdvice);
		// });

		it('타깃 함수를 해당 객체의 콘텍스트에서 실행한다',function(){
			var Target = function(){
				var self = this;
				this.targetFn = function(){
					expect(this).toBe(self);
				};
			};

			var targetInstance = new Target;
			var spyOnInstance = spyOn(targetInstance,'targetFn').and.callThrough();
			Aop.around('targetFn',argPassingAdvice, targetInstance);
			targetInstance.targetFn();

			expect(spyOnInstance).toHaveBeenCalled();

		});
	});

	var Target = function(){
		var self = this;
		this.targetFn = function(){
			expect(this).toBe(self);
		}
	};

	describe('Aop.next(Context,targetInfo)',function(){
		var advice = function(targetInfo){
			return Aop.next.call(this, targetInfo);
		};

		var originFn;

		beforeEach(function(){
				originFn = targetObj.targetFn;
				Aop.around('targetFn',advice, targetObj);
		});

		it('주이진 컨텍스트에서 타깃 함수를 실행한다.',function(){
			var targetInstance = new Target();
			var spyOnInstance = spyOn(targetInstance, 'targetFn').and.callThrough();

			Aop.around('targetFn',advice,targetInstance);
			targetInstance.targetFn();
			expect(spyOnInstance).toHaveBeenCalled();
		});


	});


});
