/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Categorias.Model;

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
    
    private Long idCarrera;
    private String nombre;
    private String ubicacion;
    private LocalDate fecha;
    private String dificultad;
    private Long idCategoria;
    private String publico;
   
}
