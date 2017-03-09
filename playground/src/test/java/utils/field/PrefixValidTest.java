package utils.field;


import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

public class PrefixValidTest {

	private PrefixValid<TestVo2> prefixValid;
	private List<TestVo> vo = new ArrayList<PrefixValidTest.TestVo>();
	private List<TestVo2> parent = new ArrayList<PrefixValidTest.TestVo2>();
	
	@Before
	public void setUp(){ 
	prefixValid = new PrefixValid<TestVo2>();
	 vo.add(new TestVo("test1","~test2","test3",0));
	 vo.add(new TestVo("test5","test6","test7",1));
	 vo.add(new TestVo("te~st9","test10","test11",2));
	 vo.add(new TestVo("test13~","test14","test15",3));
	 vo.add(new TestVo("test13~","test14","~test15",4));
	 
	 TestVo2 vo1 = new TestVo2();
	 TestVo2 vo2 = new TestVo2();
	 TestVo2 vo3 = new TestVo2();
	 TestVo2 vo4 = new TestVo2();
	 TestVo2 vo5 = new TestVo2();
	 
	 vo1.setCbNo("~test1");
	 vo1.setAsNo("test2");
	 vo1.setSmNo("~test3"); 
	 
	 vo2.setCbNo("test4");
	 vo2.setAsNo("test5");
	 vo2.setSmNo("test6");
	 
	 vo3.setCbNo("test7");
	 vo3.setAsNo("te~st8");
	 vo3.setSmNo("test9");
	 
	 vo4.setCbNo("test10");
	 vo4.setAsNo("test11~");
	 vo4.setSmNo("test12");
	 
	 vo5.setCbNo("test13~");
	 vo5.setAsNo("~test4");
	 vo5.setSmNo("test15");
	 
	 
	 
	 parent.add(vo1);
	 parent.add(vo2);
	 parent.add(vo3);
	 parent.add(vo4);
	 parent.add(vo5);
	 
	}
	
	
	
	@Test
	public void firstPrefix(){
		assertEquals(prefixValid.allCheckObject(vo.get(0)), true);
	}
	@Test
	public void valueString(){
		assertEquals(prefixValid.allCheckObject(vo.get(1)), false);
	}
	@Test
	public void endPrefix(){
		assertEquals(prefixValid.allCheckObject(vo.get(3)), false);
	}
	@Test
	public void middlePrefix(){
		assertEquals(prefixValid.allCheckObject(vo.get(2)), false);
	}
	@Test
	public void firstAndEndPrefix(){
		assertEquals(prefixValid.allCheckObject(vo.get(4)), true);
	}
	
	@Test
	public void parentFirstPrefix(){
		assertEquals(prefixValid.allCheckObject(parent.get(0)), true);
	}
	@Test
	public void parentNonePrefix(){ 
		assertEquals(prefixValid.allCheckObject(parent.get(1)), false);
	}
	@Test
	public void parentMiddlePrefix(){
		assertEquals(prefixValid.allCheckObject(parent.get(2)), false);
	}
	@Test 
	public void parentEndPrefix(){
		assertEquals(prefixValid.allCheckObject(parent.get(3)), false);
	}
	@Test
	public void parentFirstAndEndPrefix(){
		assertEquals(prefixValid.allCheckObject(parent.get(4)), true);
	}
	
	@Test
	public void replacePrefixTest(){
		 TestVo2 vo1 = new TestVo2();
		 vo1.setCbNo("~test1");
		 vo1.setAsNo("test2");
		 vo1.setSmNo("~test3"); 
		 TestVo2 returnVo = prefixValid.replaceObject(vo1);
		 assertEquals(returnVo.getSmNo(),"test3"); 
	}
	
	@Test
	public void setGridDataToDbDataTest(){
		 TestVo2 db = new TestVo2();
		 db.setCbNo("test1");
		 db.setSmNo("test3");
		 
		 TestVo2 grid = new TestVo2();
		 grid.setAsNo("test2");
		 
		 
		 prefixValid.combine(grid, db);
		 
		 assertEquals(grid.getCbNo(),"test1");
		 assertEquals(grid.getAsNo(),"test2");
		 assertEquals(grid.getSmNo(),"test3");
	}
	
	
	class TestVo{
		String test1;
		String test2;
		String test3;  
		int test4;
		
		TestVo(String test1,String test2,String test3,int test4){
			this.test1 = test1;
			this.test2 = test2;
			this.test3 = test3;
			this.test4 = test4;
		}
		TestVo(){
			
		}
		
		
		public String getTest1() {
			return test1;
		}
		public void setTest1(String test1) {
			this.test1 = test1;
		}
		public String getTest2() {
			return test2;
		}
		public void setTest2(String test2) {
			this.test2 = test2;
		}
		public String getTest3() {
			return test3;
		}
		public void setTest3(String test3) {
			this.test3 = test3;
		}
		public int getTest4() {
			return test4;
		}
		public void setTest4(int test4) {
			this.test4 = test4;
			
		}
	}
	
	class TestVo2{
		private String cbNo;
		private String asNo;
		private String smNo;
		
		public String getCbNo() {
			return cbNo;
		}
		public void setCbNo(String cbNo) {
			this.cbNo = cbNo;
		}
		public String getAsNo() {
			return asNo;
		}
		public void setAsNo(String asNo) {
			this.asNo = asNo;
		}
		public String getSmNo() {
			return smNo;
		}
		public void setSmNo(String smNo) {
			this.smNo = smNo;
		}
		
		
		
	}
}
