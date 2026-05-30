/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Categorias.Repository;

import Edu.Udistrital.BackEnd.Categorias.Model.CategoriaDTO;
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
public interface CategoriaRepository extends JpaRepository<CategoriaDTO,Long > {
    
     /**
     * Actualiza SOLO la descripcion
     * 
     * @param id de categoria
     * @param nuevaDes la nueva descripcion
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE CategoriaDTO c SET c.descripcion = :nuevaDesc WHERE c.id = :id")
    int actualizarDesc( @Param("id") Long id, @Param("nuevaDesc") String nuevaDesc);
    
     /**
     * Actualiza SOLO la recomendacion
     * 
     * @param id de categoria
     * @param nuevaRecom la nueva recomendacion
     * @return Número de filas afectadas (0 o 1)
     */
    @Modifying
    @Transactional
    @Query("UPDATE CategoriaDTO c SET c.recomendacion = :nuevaRecom WHERE c.id = :id")
    int actualizarRecomendacion( @Param("id") Long id, @Param("nuevaRecom") String nuevarRecom);
    
    /**
     * Busca una categoria  por su tipo
     * 
     * @param id
     * @return Optional  si la carrera existe
     */
    List<CategoriaDTO> findByTipo(String tipo);
    
    
}
