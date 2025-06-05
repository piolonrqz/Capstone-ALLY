package com.wachichaw;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AllyApplication {

	public static void main(String[] args) {
		SpringApplication.run(AllyApplication.class, args);
	}

	@Bean
	CommandLineRunner commandLineRunner(ChatClient.Builder builder){
		return args -> {
			var client = builder.build();

			String response = client.prompt("Tell me a joke")
				.call()
				.content();

			System.out.println(response);
		};
	}

}
