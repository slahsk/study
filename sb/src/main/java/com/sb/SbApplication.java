package com.sb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SbApplication {

    public static void main(String[] args) {
        SpringApplication.run(SbApplication.class, args);
    }
 /*   
    @Bean
    public DataSource dataSource(){
    	DriverManagerDataSource ds = new DriverManagerDataSource();
    	ds.setUrl("jdbc:h2:mem:jap");
    	ds.setUsername("");
    	ds.setPassword("");
    	ds.setDriverClassName("org.h2.Driver");
    	
    	return ds;
    }*/
   
}
