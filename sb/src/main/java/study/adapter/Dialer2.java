package study.adapter;

/**
 * adapter 사용 안하고 만든 클레스
 * Dialer 은 ButtonListener에서 입력이 들어 올것이라고 기대 해야 하는가?
 * adapter 을 사용하면 Dialer 하고 ButtonListener 하고 불리 시킬수 있다
 */
public class Dialer2 implements ButtonListener{
	public void digit(){
		
	}

	@Override
	public void buttonPressed() {
		digit();
	}
	
	
}
