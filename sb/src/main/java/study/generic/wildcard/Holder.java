package study.generic.wildcard;

public class Holder <T>{
	private T value;
	public Holder(){};
	public Holder(T val){
		value = val;
	};
	
	public void set(T val){
		value = val;
	}
	
	public T get(){
		return value;
	}
	
	public boolean equals(Object obj){
		return value.equals(obj);
	}
	
	public static void main(String[] args){
		Holder<Apple> apple = new Holder<Apple>(new Apple());
		
		Apple a = apple.get();
		apple.set(a);
	}
} 

