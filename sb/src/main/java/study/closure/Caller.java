package study.closure;

public class Caller {
	private Incrementable callbackReference;
	
	Caller(Incrementable cbn){
		this.callbackReference = cbn;
	}
	
	void go(){
		callbackReference.increment();
	}
}
