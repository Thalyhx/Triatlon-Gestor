/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Carreras.Model;

import java.time.LocalDate;
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
public class CarreraResponse {
    
    private String nombre;
    private String ubicacion;
    private LocalDate fecha;
    private String nivelDificultad;
    private String publico;
    private Long idCategoria;

    
    
}
