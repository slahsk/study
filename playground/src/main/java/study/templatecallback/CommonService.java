package study.templatecallback;

import java.util.List;

public interface CommonService<T> {
	int insert(List<T> list);
	int update(List<T> list);
	int delete(List<T> list);
}
