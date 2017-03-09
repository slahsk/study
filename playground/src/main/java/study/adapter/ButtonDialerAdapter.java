package study.adapter;

/**
 * Adapter 을 통해서 button 클레스하고 Dialer 클레스하고 서로 의존을 안한다.
 * 역시 Adapter은 DI 기본으로 설계가 된다.
 * Dialer을 주입 받아서 사용한다.
 *
 */
public class ButtonDialerAdapter implements ButtonListener{
	
	private Dialer dialer;
	
	@Override
	public void buttonPressed() {
		dialer.digit();
	}
	
	
	
	
}
