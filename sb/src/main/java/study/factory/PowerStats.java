package study.factory;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import study.TestVO;

public class PowerStats implements Stats<TestVO>{
	
	@Autowired
	private MyDAO dao;

	@Override
	public List<TestVO> get(TestVO vo) {
		return dao.select(vo);
	}
	
	
	
}
