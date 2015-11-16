package study.closure;

//인터페이스만으로 구현
public class Callee1 implements Incrementable{
	
	private int i = 0;
	
	@Override
	public void increment() {
		i++;
		System.out.println(i);
	}

	
}
