package com.sb.study;

import static org.hamcrest.CoreMatchers.is;
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
import com.sb.SbApplication;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = SbApplication.class)
@WebAppConfiguration
@Transactional
public class StudyControllerTest {
	
	@Autowired
	WebApplicationContext wac;
	
	@Autowired
	ObjectMapper mapper;
	
	MockMvc mockMvc;
	
	@Before
	public void setUp(){
		mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
	}
	 
	@Test
	public void createMemberTest() throws Exception {
		Member member = new Member();
		member.setAge(30);
		member.setName("KHJ");
		member.setId(1);
		
		
		ResultActions result = mockMvc.perform(
				post("/member/create").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(member))
				);
		
		result.andDo(print());
		result.andExpect(status().isCreated());
		result.andExpect(jsonPath("$.name", is("KHJ")));
		
		
	}
}
