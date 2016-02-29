

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;


//@RunWith(SpringJUnit4ClassRunner.class)
/*@ContextConfiguration(locations={
		"file:WebContent/WEB-INF/config/spring/spring-aspect.xml", 
		"file:WebContent/WEB-INF/config/spring/spring-component.xml", 
		"file:WebContent/WEB-INF/config/spring/spring-properties.xml", 
		"file:WebContent/WEB-INF/config/spring/spring-security.xml", 
		"file:WebContent/WEB-INF/config/spring/spring-transaction.xml", 
		"file:WebContent/WEB-INF/config/spring/test-datasource.xml", 
		"file:WebContent/WEB-INF/config/spring/picm-servlet.xml"})
@Transactional*/
@RunWith(MockitoJUnitRunner.class)
public class MailAndSMSSendServiceImpTest {
	/*
	@InjectMocks
	MailAndSMSSendServiceImp mailAndSMSSendService;
	
	@Mock
	SMSSenderWebService smsSenderWebService;
	
	@Mock
	TmsCommonEmailService tmsCommonEmailService;
	
	@Mock
	TmsFmSndMsgService tmsFmSndMsgService;
	
	@Mock
	SessionServiceIf sessionService;
	
	
	TmsFmSndMsgVO vo;
	
	@Before
	public void initMocks() throws Exception{
		
		List<TmsFmSndMsgVO> list= new ArrayList<TmsFmSndMsgVO>();
		TmsFmSndMsgVO vo1 = new TmsFmSndMsgVO();
		vo1.setHdp("001-0000-0000");
		vo1.setEmail("aa@aa.com");
		TmsFmSndMsgVO vo2 = new TmsFmSndMsgVO();
		vo2.setHdp("002-0000-0000");
		vo2.setEmail("bb@aa.com");
		
		list.add(vo1);
		list.add(vo2);
		doReturn(list).when(tmsFmSndMsgService).selectTbNotiSendTmpListByHdp(isA(TmsFmSndMsgVO.class));
		doReturn(list).when(tmsFmSndMsgService).selectTbNotiSendTmpListByEmail(isA(TmsFmSndMsgVO.class));
		
		
		vo = new TmsFmSndMsgVO();
		vo.setPrbmNo("test");
		vo.setSid("test");
		vo.setIntUserid("PP42917");
		
		vo.setBfPrbmMsgTitle("BEFORE TITLE");
		vo.setBfPrbmMsg("BEFORE 내용");
		vo.setPrbmMsgTitle("AFTER TITLE");
		vo.setPrbmMsg("AFTER 내용");
		
		TmsFmSndMsgSessionVO sndIfo = new TmsFmSndMsgSessionVO();
		when(sessionService.read(isA(String.class))).thenReturn(sndIfo);
		
		
	}
	
	
	@Test
	public void splitHDPTest(){

		List<String> hdpList = Arrays.asList(new String[]{
				 "001-0000-0000"
				,"002-0000-0000"
				,"003-0000-0000"
				,"004-0000-0000"
				,"005-0000-0000"
				,"006-0000-0000"
				,"007-0000-0000"
				,"008-0000-0000"
				,"009-0000-0000"
				,"010-0000-0000"
				,"011-0000-0000"
				,"012-0000-0000"
				,"013-0000-0000"
				,"014-0000-0000"
				,"015-0000-0000"
				,"016-0000-0000"
				,"017-0000-0000"
				,"018-0000-0000"
				,"019-0000-0000"
				,"020-0000-0000"
				,"021-0000-0000"
				,"022-0000-0000"
				,"023-0000-0000"
				,"024-0000-0000"
				,"025-0000-0000"
		});
		
		List<String[]> result = mailAndSMSSendService.splitHDP(hdpList);
		
		
		assertEquals(result.size(),2);
		assertEquals(result.get(0)[0],"001-0000-0000");
		assertEquals(result.get(1)[0],"021-0000-0000");
	}
	
	private final String SERVICE_CHANGE_BEFORE = "BFNOTI";
	//private final String SERVICE_CHANGE_AFTER = "AFNOTI";
	
	private final String SUCCESS = "M00405";//장애전파 해결완료 코드
	
	private void smsSucces() throws Exception {
		MultiRequestVo multi = new MultiRequestVo();
		multi.setResultCode("0");
		multi.setResultMessage("sms 성공");
		when(smsSenderWebService.sendSMS(isA(AbstractModel.class))).thenReturn(multi);
	}
	
	private void smsFail() throws Exception {
		MultiRequestVo multi = new MultiRequestVo();
		multi.setResultCode("1");
		multi.setResultMessage("sms 실패");
		when(smsSenderWebService.sendSMS(isA(AbstractModel.class))).thenReturn(multi);
	}
	
	private void mailSuccess() {
		CommonEmailVO emailVo = new CommonEmailVO();
		emailVo.setResultMsg("mail 성공");
		emailVo.setSuccessFlag(true);
		when(tmsCommonEmailService.sendWkMonitor(isA(CommonEmailVO.class))).thenReturn(emailVo);
	}
	
	private void mailFail() {
		CommonEmailVO emailVo = new CommonEmailVO();
		emailVo.setResultMsg("mail 실패");
		emailVo.setSuccessFlag(false);
		when(tmsCommonEmailService.sendWkMonitor(isA(CommonEmailVO.class))).thenReturn(emailVo);
	}
	
	@Test
	public void smsSendTestSuccess() throws Exception{
		smsSucces();
		boolean result = mailAndSMSSendService.smsSendProcess(vo, SERVICE_CHANGE_BEFORE);
		assertTrue(result);
	}

	
	@Test
	public void smsSendTestFail() throws Exception{
		smsFail();
		boolean result = mailAndSMSSendService.smsSendProcess(vo, SERVICE_CHANGE_BEFORE);
		assertFalse(result);
	}
	
	@Test
	public void mailSendProcessSuccess() throws Exception{
		mailSuccess();
		boolean result = mailAndSMSSendService.mailSendProcess(vo, SERVICE_CHANGE_BEFORE);
		assertTrue(result);
	}
	
	@Test
	public void mailSendProcessFail() throws Exception{
		mailFail();
		vo.setNotiStag(SUCCESS); 
		boolean result = mailAndSMSSendService.mailSendProcess(vo, SERVICE_CHANGE_BEFORE);
		assertFalse(result);
	}
	
	@Test
	public void sendMessageEmpnoNullTest() throws Exception{
		mailSuccess();
		smsSucces();
		vo.setIntUserid(null);
		Map<String,Object> map = mailAndSMSSendService.sendMessage(vo);
		assertEquals(map.get("result"),"2");
		assertEquals(map.get("msg"),"전송중 시스템 장애가 발생하여 SMS 전송을 실패 하였습니다.");
	}
	
	
	
	@Test
	public void sendMessageSuccessTest() throws Exception{
		mailSuccess();
		smsSucces();
		
		Map<String,Object> map = mailAndSMSSendService.sendMessage(vo);
		assertEquals(map.get("result"),"1");
		assertEquals(map.get("msg"),"전송하였습니다.");
	}
	
	@Test
	public void sendMessageFailTest() throws Exception{
		mailFail();
		smsFail();
		Map<String,Object> map = mailAndSMSSendService.sendMessage(vo);
		assertEquals(map.get("result"),"2");
		assertEquals(map.get("msg"),"전송중 시스템 장애가 발생하여 SMS 전송을 실패 하였습니다.");
	}
	
	@Test
	public void sendMessageSMSFailTest() throws Exception{
		mailSuccess();
		smsFail();
		vo.setNotiStag(SUCCESS);
		Map<String,Object> map = mailAndSMSSendService.sendMessage(vo);
		assertEquals(map.get("result"),"2");
		assertEquals(map.get("msg"),"전송중 시스템 장애가 발생하여( SMS전송 : 실패, 메일전송 : 성공 )하였습니다.");
	}
	
	@Test
	public void sendMessageMailFailTest() throws Exception{
		mailFail();
		smsSucces();
		vo.setNotiStag(SUCCESS);
		Map<String,Object> map = mailAndSMSSendService.sendMessage(vo);
		assertEquals(map.get("result"),"2");
		assertEquals(map.get("msg"),"전송중 시스템 장애가 발생하여( SMS전송 : 성공, 메일전송 : 실패 )하였습니다.");
	}
	*/
}
