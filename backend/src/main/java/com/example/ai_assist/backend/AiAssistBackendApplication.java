package com.example.ai_assist.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class AiAssistBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AiAssistBackendApplication.class, args);
		System.out.println("Backend Started ");
	}

}
