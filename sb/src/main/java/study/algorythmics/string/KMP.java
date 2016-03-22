package study.algorythmics.string;

public class KMP {

	
	
	
	public int[] preProcessPattern(char[] ptrn) {
	    int i = 0, j = -1;
	    int ptrnLen = ptrn.length;
	    int[] b = new int[ptrnLen + 1]; //���� ũ�⺸�� 1��ū ���� �迭 ����
	 
	    b[i] = j;	//���ڹ迭 0 ������ -1 ����
	    while (i < ptrnLen) {	//���� ũ�� ��ŭ
	    	
	    	
	    	
	       while (j >= 0 && ptrn[i] != ptrn[j]) {
	            j = b[j]; //���� ���̺� �� ��������
	        }
	        i++;
	        j++;
	        b[i] = j;
	    }
	    return b;
	}
	
    public void searchSubString(char[] text, char[] ptrn) {
        int i = 0, j = 0;
        // pattern and text lengths
        int ptrnLen = ptrn.length;
        int txtLen = text.length;
 
        // initialize new array and preprocess the pattern
        int[] b = preProcessPattern(ptrn);
        //	a b a b  c  a  b 
        // 
        while (i < txtLen) { 
            while (j >= 0 && text[i] != ptrn[j]) { //���� ���� �ϰ� ���� ���� �ϰ� �ٸ���
                j = b[j];	//j �� ���Ͽ��� ������ ���� ���� �ʱ�ȭ
            }
            i++;
            j++;
 
            // a match is found
            if (j == ptrnLen) { //���� ���� �ϰ� j�ϰ� ������ (������ ��ġ��)
                j = b[j];
            }
        }
    }
 
    // only for test purposes
    public static void main(String[] args) {
    	KMP stm = new KMP();
        // pattern
        char[] ptrn = "ababcab".toCharArray(); //����
 
        char[] text = "abcabdabcabeabcabdabcabd".toCharArray(); //�˻��� ����
    
        // search for pattern in the string
        stm.searchSubString(text, ptrn);
    }
}
