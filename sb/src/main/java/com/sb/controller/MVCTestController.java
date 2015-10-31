package com.sb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class MVCTestController {
	
	@RequestMapping("/test")
    public String test() {
        return "test";
    }
	
	@RequestMapping("/ajaxTest")
	@ResponseBody
	public String ajaxTest(){
		return "test";
	}
	
	
}
