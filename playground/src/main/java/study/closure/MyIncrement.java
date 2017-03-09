package study.closure;

public class MyIncrement {
	
	static void f(MyIncrement mi){
		mi.increment();
	}
	
	public void increment(){
		System.out.println("Other operaion");
	}
	
}
