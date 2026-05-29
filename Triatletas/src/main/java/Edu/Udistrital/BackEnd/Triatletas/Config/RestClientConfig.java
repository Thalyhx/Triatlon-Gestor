/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Triatletas.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestClient;

/**
 *
 * @author nath
 */


public class RestClientConfig {
    
 @Bean
public RestClient restClient() {
     return RestClient.create(); // Un cliente totalmente en blanco
}
    
}
