/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Carreras.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author nath
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtletaResponse {
    
    private String identificacion;
    private String nombre;
    private String genero;
    private String correo;
    private Integer edad;
    private String categoria;
    private String especialidad;
    private Boolean modalidadCross;
    private String foto;
    private String idCarrera;
    
}
