package study.datastructure.tree.binary;


public class BinaryTreeNode {
	private int data;
	private BinaryTreeNode left;
	private BinaryTreeNode right;
	
	//�쟾�쐞 �깘�깋
/*	private void preOrder(BinaryTreeNode node){
		System.out.println(node.getData());
		preOrder(node.getLeft());
		preOrder(node.getRight());
	}

	//以묒쐞 �깘�깋
	private void inOrder(BinaryTreeNode node){
		preOrder(node.getLeft());
		System.out.println(node.getData());
		preOrder(node.getRight());
	}
	
	//�썑�쐞 �깘�깋
	private void postOrder(BinaryTreeNode node){
		preOrder(node.getLeft());
		preOrder(node.getRight());
		System.out.println(node.getData());
	}
	*/

	public int getData() {
		return data;
	}

	public BinaryTreeNode getLeft() {
		return left;
	}

	public BinaryTreeNode getRight() {
		return right;
	}
	
	
}
