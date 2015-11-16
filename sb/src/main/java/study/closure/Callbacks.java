package study.closure;

public class Callbacks {
	public static void main(String[] args){
		Callee1 c1 = new Callee1();
		Callee2 c2 = new Callee2();
		
		MyIncrement.f(c2); //c2.increment() 호출
		System.out.println("============================================");
		
		//의존 주입
		Caller caller1 = new Caller(c1);
		Caller caller2 = new Caller(c2.getCallBackReference());
		
		caller1.go();
		caller1.go();
		System.out.println("===============caller1 END=============");
		caller2.go();
		caller2.go();
	}
}
