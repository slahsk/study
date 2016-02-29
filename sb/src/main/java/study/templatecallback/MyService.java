package study.templatecallback;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;


public class MyService implements CommonService<TestVO> {
	
	@Autowired
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
