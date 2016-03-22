package study.datastructure.heap;



public class Heap {
	private int count;
	private int capacity;
	private int[] array;

	public Heap(int capacity){
		this.count = 0;
		this.capacity = capacity;
		this.array = new int[capacity];
	}
	
/*	private int parent(int i){
		if(i <=0 || i >= count){
			return -1;
		}
		return i-1/2;
	}*/
	
	private int leftChild(int i){
		int left = 2*i+1;
		if(left >= count){
			return -1;
		}
		return left;
	}
	
	private int rightCheild(int i){
		int right = 2*i+2;
		if(right >= count){
			return -1;
		}
		return right;
	}
	
	public int getMax(){
		if(count == 0){
			return -1;
		}
		return array[0];
	}
	
	public void insert(int data){
		int i;
		if(count == capacity){
			resizeHeap();
		}
		
		count++;
		i = count - 1;
		while(i > 0 && data > array[(i-1)/2]){
			array[i] = array[(i-1)/2];
			i = (i-1)/2;
		}
		array[i] = data;
		
	}
	public int insert(int a[]){
		int dataSize = a.length;
		
		
		if(dataSize < -1){
			return -1;
		}
		
		while(dataSize+count > capacity ){
			resizeHeap();
		}
		
		for(int i = 0; i < dataSize; i++){
			array[count] = a[i];
			count++;
		}
		for(int i = (dataSize+count-1/2); i >= 0; i--){
			percolateDown(i);
		}
		return count;
	}

	private int resizeHeap() {
		int[] arrayOld = new int[capacity];
		System.arraycopy(array, 0, arrayOld, 0,count);
		array = new int[capacity * 2];
		if(array == null){
			System.out.println("Memory Error");
			return -1;
		}
		for(int i = 0; i < capacity; i++){
			array[i] = arrayOld[i];
		}
		
		capacity = capacity * 2;
		arrayOld = null;
		return 0;
	}
	
	public int deleteMax(){
		if(count == 0){
			return -1;
		}
		int data = array[0];
		array[0] = array[count-1];
		array[count-1] = 0;
		count--;
		percolateDown(0);
		return data;
	}
	
	private void percolateDown(int i){
		int left, right, max, temp;
		left = leftChild(i);
		right = rightCheild(i);
		
		if(left != -1 && array[left] > array[i]){
			max = left;
		}else{
			max = i;
		}
		
		if(right != -1 && array[right] > array[max]){
			max = right;
		}
		
		if(max != i){
			temp = array[i];
			array[i] = array[max];
			array[max] = temp;
			percolateDown(max);
		}
		
	}
	
	public int findMin(){
		int min = Integer.MAX_VALUE;
		for(int i = (count+1)/2 ; i < count ; i++ ){
			if(array[i] < min){
				min = array[i];
			}
		}
		return min;
	}

	public int[] getArray() {
		return array;
	}
	
	
	public int getCount() {
		return count;
	}

	public void clean(){
		count = 0;
		array = null;
	}
	
	
}
