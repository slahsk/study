package study.datastructure.linkedlist;




public abstract class AbstractLinkedList implements LinkedList {
	private int date;
	private LinkedList next;
	
	public AbstractLinkedList(int date){
		this.date = date;
	}
	
	@Override
	public int getSize(){
		int length = 0;
		LinkedList currentNode = this;
		while(currentNode != null){
			length++;
			
			currentNode = currentNode.getNext();
		}
		
		return length;
	}
	
	public int getDate() {
		return date;
	}
	public void setDate(int date) {
		this.date = date;
	}
	public LinkedList getNext() {
		return next;
	}
	public void setNext(LinkedList next) {
		this.next = next;
	}
	
	
}
