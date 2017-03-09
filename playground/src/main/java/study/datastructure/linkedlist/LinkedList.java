package study.datastructure.linkedlist;




public interface LinkedList {
	
	public int getSize();
	public LinkedList insert(LinkedList nodeToInsert,int position);
	public LinkedList delte(int position);
	public LinkedList getNext();
	public void setNext(LinkedList next);
	public int getDate();
}
