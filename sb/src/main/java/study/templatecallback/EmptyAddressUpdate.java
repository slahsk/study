package study.templatecallback;

import java.util.List;

public class EmptyAddressUpdate implements MyCallBack<TestVO>{

	@Override
	public int call(List<TestVO> list, CommonService<TestVO> service) {
		
		for(TestVO vo : list){
			vo.setAddress("");
		}
		
		
		
		return service.update(list);
	}

	

}
