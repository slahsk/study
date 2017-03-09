package study.templatecallback;

import java.util.List;

import study.TestVO;


public class MyService implements CommonService<TestVO> {
	
	private EmptyAddressUpdate emptyAddressUpdate;
	
	@Override
	public int insert(List<TestVO> list) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int update(List<TestVO> list) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int delete(List<TestVO> list) {
		// TODO Auto-generated method stub
		return 0;
	}
	
	public int myServiceUpdate(List<TestVO> list){
		
		return emptyAddressUpdate.call(list, this);
	}

}
