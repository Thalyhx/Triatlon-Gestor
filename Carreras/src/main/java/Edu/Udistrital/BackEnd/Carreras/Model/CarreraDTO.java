/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Carreras.Model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.time.LocalDate;
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
@Table(name = "carreras")
public class CarreraDTO {
    
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "el nombre es obligatorio")
    @Column(unique = true, nullable = false)
    private String nombre;
    
    @NotBlank(message = "la ubicacion es obligatoria")
    @Column(nullable = false)
    private String ubicacion;
    
    @NotNull(message = "la fecha es obligatoria")
    @Column(nullable = false)
    private LocalDate fecha;
    
    private String nivelDificultad;
    private String publico;
    private Long idCategoria;

    
    @ElementCollection
    @CollectionTable(name = "atletas_inscritos", joinColumns = @JoinColumn(name = "carrera_id"))
    private List<String> identificacionesAtletas;
    
}
