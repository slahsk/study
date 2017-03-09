package utils.field;

import java.lang.reflect.Field;

public class PrefixValid <T> implements ObjectFieldValid<T>, DataCombine<T>{
	
	private final static String PREFIX = "~";
	
	
	
	/**
	 * 최상위 클레스 값까지 검사하며 존재 유무 검사
	 * @param object
	 * @return
	 */
	@Override
	public  boolean allCheckObject(Object object){
		boolean isPrefix =  false;
		
		Class<?> clazz = object.getClass();
		
		while(true){
			if( isObjectClass(clazz) || isPrefix == true){
				break;
			}
				
			isPrefix = checkFieldValue(object,clazz.getDeclaredFields());
			clazz = clazz.getSuperclass();
		}
		
		return isPrefix;
	}
	
	/**
	 * 필드 리스트중 prefix 값이 있는지 검사하기
	 * @param object
	 * @param fields
	 * @return
	 */
	private boolean checkFieldValue(Object object,Field[] fields) {
		
		for(Field field : fields){
			
			field.setAccessible(true);
			Object result = getValue(object,field);
			
			if(checkStringIndexOf(result) == 0){
				return true;
			}
			
			field.setAccessible(false);
		}
		return false;
	}
	
	/**
	 * 최상의 클레스 이름 가져오기
	 * @param clazz
	 * @return
	 */
	private boolean isObjectClass(Class<?> clazz){
		return "java.lang.Object".equals(clazz.getName());
	}
	
	/**
	 * 필드 값 가져오기
	 * @param object
	 * @param field
	 * @return
	 */
	private Object getValue(Object object,Field field){
		try {
			return field.get(object);
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
	
	
	/**
	 * 필드에 prefix 존재 유무 검사
	 * @param object
	 * @param field
	 * @return
	 */
	private int checkStringIndexOf(Object object){
		if(object instanceof String){
			return ((String) object).indexOf(PREFIX);
		}
		return -1;
	}
	
	
	/**
	 * client 비어있는 변수에
	 * server 데이터를  client 데이터를 주입해준다.(server -> client)
	 * @param client 
	 * @param server
	 */
	@Override
	public void combine(T client,T server){
		Class<?> clazz = server.getClass();
		
		while(true){
			if(isObjectClass(clazz)){
				break;
			}
				
			Object dbVal = null;
			Object gridVal = null;
			
			//grid 데이터에 db데이터 set
			for(Field field : clazz.getDeclaredFields()){
				field.setAccessible(true);
				
				dbVal = getValue(server,field);
				gridVal = getValue(client,field);
					try {
						if(gridVal == null){
							
							field.set(client,(String)dbVal);
						}
						
					} catch (IllegalArgumentException e) {
						e.printStackTrace();
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					}
					
				
				field.setAccessible(false);
			}
			
			clazz = clazz.getSuperclass();
		}
	}
	
	/**
	 * object 필드에 있는 값중 특정 문자를 제거 해준다.
	 * ~test -> test
	 * @param object
	 * @return
	 */
	@Override
	public T replaceObject(T object){
		Class<?> clazz = object.getClass();
		
		while(true){
			if(isObjectClass(clazz)){
				break;
			}
				
			Object val = null;
			
			
			for(Field field : clazz.getDeclaredFields()){
				field.setAccessible(true);
				
				val = getValue(object,field);
				
				if(checkStringIndexOf(val) == 0){
					try {
						field.set(object,((String) val).substring(1,((String) val).length()));
					} catch (IllegalArgumentException e) {
						e.printStackTrace();
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					}
					
				}
				
				
				field.setAccessible(false);
			}
			
			clazz = clazz.getSuperclass();
		}
	
	return object;
}
	
	
}
