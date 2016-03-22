package study.algorythmics.quicksort;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;

public class QuickSortTest {
	int data[] = null;
	
	@Before
	public void setUp(){
		data = new int[]{4,8,1,7,9,2,0};
	}
	
	@Test
	public void sort(){
		QuickSort.quickSort(data);
		
		assertEquals(data[0],0);
		assertEquals(data[data.length-1],9);
		
	}
}
