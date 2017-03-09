package study.closure;


public class Callee2 extends MyIncrement{

	private int i = 0;
	
	@Override
	public void increment(){
		super.increment();
		i++;
		System.out.println(i);
	}
	
	Incrementable getCallBackReference(){
		return new Colsure();
	}
	
	private class Colsure implements Incrementable{

		@Override
		public void increment() {
			Callee2.this.increment();
		}
		
	}
}
