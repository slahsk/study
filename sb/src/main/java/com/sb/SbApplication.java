package com.sb;

import javax.sql.DataSource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

@SpringBootApplication
public class SbApplication {

    public static void main(String[] args) {
        SpringApplication.run(SbApplication.class, args);
    }
    @Bean
    public DataSource dataSource(){
    	DriverManagerDataSource ds = new DriverManagerDataSource();
    	ds.setUrl("jdbc:h2:~/test");
    	ds.setUsername("sa");
    	ds.setPassword("");
    	ds.setDriverClassName("org.h2.Driver");
    	
    	return ds;
    }
    
    
    
//    @Bean
//    public EntityManager entityManager() {
//        return entityManagerFactory().getObject().createEntityManager();
//    }

//    @Bean/    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
//        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
//        em.setDataSource(dataSource());
//        em.setPackagesToScan("com.sb");
//        return em;
//    }
//   
}
