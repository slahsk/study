package com.sb.member;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.google.gson.Gson;
import com.sb.SbApplication;
import com.sb.entity.Member;
import com.sb.entity.Order;
import com.sb.item.ItemService;
import com.sb.order.OrderService;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = SbApplication.class)
@WebAppConfiguration
@Transactional
public class MemberControllerTest {
	
	@Autowired
	WebApplicationContext wac;
	
	@Autowired
	ObjectMapper mapper;
	
	MockMvc mockMvc;
	
	Gson gson;
	
	@Autowired
	MemberService memverService;
	
	@Autowired
	ItemService itemService;
	
	@Autowired
	OrderService orderItemService; 
	
	@Before
	public void setUp(){
		gson = new Gson();
		mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
		createOrder();
	}
	 
	@Test
	public void createMemberTest() throws Exception {
		Member member = new Member();
		member.setAge(10);
		member.setName("AAA");
		
		
		ResultActions result = mockMvc.perform(
				post("/member/create")
				.contentType(MediaType.APPLICATION_JSON)
				.content(gson.toJson(member))
				);
		result.andDo(print());
		result.andExpect(status().isCreated());
		result.andExpect(jsonPath("$.name", is("AAA")));
	}

	
	@Test
	public void getMemberTest() throws Exception{
		
		ResultActions result = mockMvc.perform(get("/member/1"));
		result.andDo(print());
		result.andExpect(status().isOk());
		result.andExpect(jsonPath("$.name", is("KHJ")));
		result.andExpect(jsonPath("$.orders", hasSize(3)));
	}
	
	private Member createMemberObject() {
		Member member = new Member();
		member.setAge(30);
		member.setName("KHJ");
		return member;
	}
	
	private void createOrder(){
		Order order1 = new Order();
		Order order2 = new Order();
		Order order3 = new Order();
		
		Member member = memverService.createMember(createMemberObject());
		
		
		order1.setMember(member);
		orderItemService.saveOrderItem(order1);
		order2.setMember(member);
		orderItemService.saveOrderItem(order2);
		order3.setMember(member);
		orderItemService.saveOrderItem(order3);
		
	}
	
}
