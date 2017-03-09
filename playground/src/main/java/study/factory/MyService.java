package study.factory;

import java.util.List;

import study.TestVO;


public class MyService {
	
	public List<TestVO> select(TestVO vo){
		Stats<TestVO> stats = MyFactory.get(false);
		List<TestVO> statsList = stats.get(vo);
		return null;
	}
}
