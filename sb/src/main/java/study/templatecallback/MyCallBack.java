package study.templatecallback;

import java.util.List;

public interface MyCallBack<T> {
	int call(List<T> list, CommonService<T> service);
}
