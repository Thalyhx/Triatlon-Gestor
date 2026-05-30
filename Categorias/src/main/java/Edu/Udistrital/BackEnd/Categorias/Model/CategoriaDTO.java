/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Categorias.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author nath
 */

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "categorias")
public class CategoriaDTO {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "el nombre es obligatorio")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "el tipo es obligatorio")
    @Column(nullable = false)
    private String tipo;
    
    @NotBlank(message = "la descripcion es obligatoria")
    @Column(length = 500,nullable = false)
    private String descripcion;
    
    @Column(length = 500)
    private String recomendacion;
    
    
    
    
}
