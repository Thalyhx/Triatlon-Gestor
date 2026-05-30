/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Carreras.Repository;

import Edu.Udistrital.BackEnd.Carreras.Model.CarreraDTO;
import jakarta.transaction.Transactional;
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
    
    List<CarreraDTO> findByIdCategoria(Long idCategoria);
    
     /**
     * Busca una carrera  por su id
     * 
     * @param id
     * @return Optional  si la carrera existe
     */
    Optional<CarreraDTO> findByIdentificacion(String id);
    
    /**
     * Elimina carrera por id
     * 
     * @param id
     */
    @Transactional
    void deleteByIdentificacion(String id);
    
     /**
     * Actualiza SOLO la ubicacion
     * 
     * @param id de carrera
     * @param nuevaUbicacion
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE CarreraDTO a SET c.ubicacion = :nuevaUbicacion WHERE c.id = :id")
    int actualizarUbicacion( @Param("id") String id, @Param("nuevaUbicacion") String nuevaUbicacion);
    
     /**
     * Actualiza SOLO la fecha
     * 
     * @param id de carrera
     * @param nuevaFecha
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE CarreraDTO a SET c.fecha = :nuevaFecha WHERE c.id = :id")
    int actualizarFecha( @Param("id") String id, @Param("nuevaFecha") String nuevaFecha);
    
}
