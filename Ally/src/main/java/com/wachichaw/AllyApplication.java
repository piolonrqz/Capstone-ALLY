package com.wachichaw;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
@SpringBootApplication
@EnableScheduling
public class AllyApplication {	

	public static void main(String[] args) {
		SpringApplication.run(AllyApplication.class, args);
	}
}
 