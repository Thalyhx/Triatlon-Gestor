/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Triatletas.Repository;

import Edu.Udistrital.BackEnd.Triatletas.Model.AtletaDTO;
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
public interface  AtletaRepository extends JpaRepository<AtletaDTO, Long> {
    
        /**
     * Busca un triatleta por su número de identificación.
     * 
     * @param identificacion Número de identificación único del triatleta
     * @return Optional con el triatleta si existe
     */
    Optional<AtletaDTO> findByIdentificacion(String identificacion);
    
    /**
     * Lista todos los triatletas de un género específico.
     * 
     * @param genero Género a buscar ('M' o 'F')
     * @return Lista de triatletas del género especificado
     */
    List<AtletaDTO> findByGenero(String genero);
    
    /**
     * Lista todos los triatletas de una categoría específica.
     * 
     * @param categoria Categoría a buscar
     * @return Lista de triatletas de la categoría especificada
     */
    List<AtletaDTO> findByCategoria(String categoria);
    
    /**
     * Lista todos los triatletas de una especialidad específica.
     * 
     * @param especialidad Especialidad a buscar
     * @return Lista de triatletas de la especialidad especificada
     */
    List<AtletaDTO> findByEspecialidad(String especialidad);
    
    /**
     * Lista triatletas por modalidad Cross.
     * 
     * @param modalidadCross true para triatletas con Cross, false para sin Cross
     * @return Lista de triatletas con la modalidad Cross especificada
     */
    List<AtletaDTO> findByModalidadCross(Boolean modalidadCross);
    
    /**
     * Elimina un triatleta por su número de identificación.
     * 
     * @param identificacion Número de identificación del triatleta a eliminar
     */
    @Transactional
    void deleteByIdentificacion(String identificacion);
    
    /**
     * Actualiza SOLO el nombre de un triatleta.
     * 
     * @param identificacion Número de identificación del triatleta
     * @param nuevoNombre Nuevo nombre
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE AtletaDTO a SET a.nombre = :nuevoNombre WHERE a.identificacion = :identificacion")
    int actualizarNombre(
            @Param("identificacion") String identificacion, 
            @Param("nuevoNombre") String nuevoNombre);
    
    /**
     * Actualiza SOLO la identificación de un triatleta.
     * 
     * Cambia el número de identificación manteniendo todos los demás datos.
     * 
     * @param identificacionActual Número de identificación actual
     * @param nuevaIdentificacion Nuevo número de identificación
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE AtletaDTO a SET a.identificacion = :nuevaIdentificacion WHERE a.identificacion = :identificacionActual")
    int actualizarIdentificacion(
            @Param("identificacionActual") String identificacionActual, 
            @Param("nuevaIdentificacion") String nuevaIdentificacion);
    
    /**
     * Actualiza SOLO la categoría de un triatleta.
     * 
     * @param identificacion Número de identificación del triatleta
     * @param nuevaCategoria Nueva categoría
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE AtletaDTO a SET a.categoria = :nuevaCategoria WHERE a.identificacion = :identificacion")
    int actualizarCategoria(
            @Param("identificacion") String identificacion, 
            @Param("nuevaCategoria") String nuevaCategoria);
   
}
