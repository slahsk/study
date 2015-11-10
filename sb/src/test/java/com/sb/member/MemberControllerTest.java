package com.sb.member;

import static org.hamcrest.CoreMatchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.sb.SbApplication;
import com.sb.entity.Member;

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
	MemberService service;
	
	@Before
	public void setUp(){
		gson = new Gson();
		mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
	}
	 
	@Test
	public void createMemberTest() throws Exception {
		Member member = createMemberObject();
		
		
		ResultActions result = mockMvc.perform(
				post("/member/create")
				.contentType(MediaType.APPLICATION_JSON)
				.content(gson.toJson(member))
				);
		result.andDo(print());
		result.andExpect(status().isCreated());
		result.andExpect(jsonPath("$.name", is("KHJ")));
	}

	private Member createMemberObject() {
		Member member = new Member();
		member.setAge(30);
		member.setName("KHJ");
		return member;
	}
	
	@Test
	public void getMemberTest() throws Exception{
		Member member = createMemberObject();
		service.createMember(member);
		
		ResultActions result = mockMvc.perform(get("/member/1"));
		result.andDo(print());
		result.andExpect(status().isOk());
		result.andExpect(jsonPath("$.name", is("KHJ")));
		
	}
	
}
