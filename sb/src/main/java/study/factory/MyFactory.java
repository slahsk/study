package study.factory;

import study.TestVO;

public class MyFactory {
	private static Stats<TestVO> POWER = new PowerStats();
	private static Stats<TestVO> SOFT = new SoftStats();
	
	
	public static Stats<TestVO> get(boolean isPower){
		Stats<TestVO> stats = null;
		
		if(isPower){
			stats = POWER;
		}else{
			stats = SOFT;
		}
		
		return stats;
	}
}
