package study.datastructure.linkedlist;

public abstract class AbstractDoubleLinkedList extends AbstractLinkedList {
	private LinkedList previous;
	
	public AbstractDoubleLinkedList(int date) {
		super(date);
	}


	public LinkedList getPrevious() {
		return previous;
	}

	public void setPrevious(LinkedList previous) {
		this.previous = previous;
	}
	
	

}
