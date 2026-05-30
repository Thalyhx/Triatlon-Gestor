/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Triatletas.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 *
 * @author nath
 */
@Service
@RequiredArgsConstructor

public class EmailService {
    
             private final JavaMailSender mailSender;
    
          /**
         * Envía un correo de bienvenida al atleta registrado.
         * @param correo Correo del atleta.
         * @param nombre Nombre del atleta.
         */
        public void enviarCorreoBienvenida(String correo, String nombre) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(correo);
                message.setSubject("Registro Exitoso - Sistema Gestor de Triatlón");
                message.setText("Hola " + nombre + ",\n\nsu registro en el sistema gestor Triatlón ha sido exitoso.\n¡Bienvenido!");
                mailSender.send(message);
            } catch (Exception e) {
            }
        }
        
}
