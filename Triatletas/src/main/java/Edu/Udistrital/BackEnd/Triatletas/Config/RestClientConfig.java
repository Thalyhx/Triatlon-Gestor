/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Triatletas.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 *
 * @author nath
 */

@Configuration
public class RestClientConfig {
    
@Bean
    public RestClient RestClient(RestClient.Builder builder) {
        return builder
                .baseUrl("http://localhost:9001/api/carreras") 
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
