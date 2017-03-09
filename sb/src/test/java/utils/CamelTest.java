package utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class CamelTest{
    @Test
    public void myTest(){
          String str = "call-forwardingL1l-ways-on";
          String repStr = "";

          Pattern p = Pattern.compile("\\-[a-z]{1}");
          Matcher m = p.matcher(str);
          int cnt = 0;
          while (m.find()) {
              repStr = m.replaceFirst(m.group().replaceAll("\\-","").toUpperCase());
              m = p.matcher(repStr);

              System.out.println("repCnt : " + cnt + " / repStr : " + repStr);

              cnt++;
          }
          System.out.println("====== repStr result ======\r\n" + repStr);


    }
  }
