package utils;

public interface ObjectFieldValid<T> {
	boolean allCheckObject(T object);
	public T replaceObject(T object);
}
