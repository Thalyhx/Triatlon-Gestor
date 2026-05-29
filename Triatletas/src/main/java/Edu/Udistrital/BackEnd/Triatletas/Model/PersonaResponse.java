/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Triatletas.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 *
 * @author nath
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class PersonaResponse {

    private String identificacion;
    private String nombre;
    private Integer edad;
    private String genero;
    private String correo;
}


