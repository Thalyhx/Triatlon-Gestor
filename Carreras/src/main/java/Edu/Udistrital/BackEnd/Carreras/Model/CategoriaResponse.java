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
public class CategoriaResponse {
    
    private Long id;
    private String nombreCategoria;
    private String tipo;
    private String descripcion;
    private String recomendacion;
    
}
