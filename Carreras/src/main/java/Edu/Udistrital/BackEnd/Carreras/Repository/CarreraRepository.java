/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Carreras.Repository;

import Edu.Udistrital.BackEnd.Carreras.Model.CarreraDTO;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author nath
 */

@Repository
public interface CarreraRepository extends JpaRepository<CarreraDTO, Long>{
    
      /**
     * Busca todas las carreras que tengan la categoría
     * 
     * @param id
     * @return List  si  existen carreras
     */
    List<CarreraDTO> findByIdCategoria(Long idCategoria);
    
     /**
     * Actualiza SOLO la ubicacion
     * 
     * @param id de carrera
     * @param nuevaUbicacion
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE CarreraDTO c SET c.ubicacion = :nuevaUbicacion WHERE c.id = :id")
    int actualizarUbicacion( @Param("id") Long id, @Param("nuevaUbicacion") String nuevaUbicacion);
    
     /**
     * Actualiza SOLO la fecha
     * 
     * @param id de carrera
     * @param nuevaFecha
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE CarreraDTO c SET c.fecha = :nuevaFecha WHERE c.id = :id")
    int actualizarFecha( @Param("id") Long id, @Param("nuevaFecha") LocalDate nuevaFecha);
    
}
