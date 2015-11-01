package com.sb;

import javax.sql.DataSource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@SpringBootApplication
public class SbApplication {

    public static void main(String[] args) {
        SpringApplication.run(SbApplication.class, args);
    }
    
    @Bean
    public DataSource dataSource(){
    	DriverManagerDataSource ds = new DriverManagerDataSource();
    	ds.setUrl("jdbc:h2:mem:jap");
    	ds.setUsername("aa");
    	ds.setPassword("");
    	ds.setDriverClassName("org.h2.Driver");
    	
    	return ds;
    }
   
}
