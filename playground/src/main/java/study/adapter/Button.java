package study.adapter;

public class Button {

	

	/**
	 * Dialer 클레스에 의존 하고 있다. 의존을 하고 있기에 재사용이 불가하다.
	 */
	private Dialer dialer;

	public void noAdapterClick() {
		dialer.digit();
	}
	
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Dialer 클레스에 의존하지 않는다.
	 * 재사용이 가능하다.
	 */
	private ButtonListener buttonListener;

	public void setButtonListener(ButtonListener buttonListener) {
		this.buttonListener = buttonListener;
	}

	public void adapterClick() {
		buttonListener.buttonPressed();
	}

}
