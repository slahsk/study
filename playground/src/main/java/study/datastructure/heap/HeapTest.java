package study.datastructure.heap;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;

public class HeapTest {
	Heap heap = null;
	
	@Before
	public void setUp(){
		heap = new Heap(10);
		heap.insert(4);
		heap.insert(8);
		heap.insert(2);
		heap.insert(3);
		heap.insert(10);
		heap.insert(1);
		heap.insert(15);
		heap.insert(20);
	}
	

	@Test
	public void heapMaxTest(){
		assertEquals(heap.getMax(), 20);
		
	}
	
	@Test
	public void arrayInsertTest(){
		int array[] = {5,99,80,44};
		heap.insert(array);
		assertEquals(heap.getMax(), 99);
	}
	
	@Test
	public void heapDeleteTest(){
		assertEquals(heap.deleteMax(), 20);
		assertEquals(heap.getMax(), 15);
		
	//	System.out.println(Arrays.toString(heap.getArray()));
		assertEquals(heap.deleteMax(), 15);
		assertEquals(heap.getMax(), 10);
			
	}
	
	@Test
	public void findMinTest(){
		assertEquals(heap.findMin(), 1);
	}
	
	@Test
	public void cleanTest(){
		heap.clean();
		assertEquals(heap.getMax(), -1);
	}
	
	
	
}
