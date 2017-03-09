package study.factory;

import java.util.List;

public interface Stats<T> {
	public List<T> get(T t);
}
