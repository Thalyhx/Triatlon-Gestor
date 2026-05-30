/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Categorias.Controller;

import Edu.Udistrital.BackEnd.Categorias.Model.CarreraResponse;
import Edu.Udistrital.BackEnd.Categorias.Model.CategoriaDTO;
import Edu.Udistrital.BackEnd.Categorias.Model.CategoriaResponse;
import Edu.Udistrital.BackEnd.Categorias.Service.CategoriaService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author nath
 */

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categorias")
public class CategoriaRestControlller {
    
    private final CategoriaService categoriaService;
     
      /**
     * Registra una categoria
     * 
     * @param dto Objeto categoriaDTO con los datos
     * @return Response con categoriaResponse y  HTTP CREATED
     * @throws RuntimeException si hay error 
     */
    @RequestMapping(value = "/categoria", method = RequestMethod.POST)
    public ResponseEntity<CategoriaResponse> registrarCategoria(@Valid @RequestBody CategoriaDTO dto) {
        CategoriaResponse nueva = categoriaService.registrarCategoria(dto);
        return new ResponseEntity<>(nueva, HttpStatus.CREATED);
    }
     /**
     * Consulta una categoria por su id
     * @param id Id de la categoria
     * @return Response con datos y  HTTP OK
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<CategoriaResponse> consultarCarrera(@PathVariable Long id) {
        CategoriaResponse categoria = categoriaService.consultarPorId(id);
        return ResponseEntity.ok(categoria);
    }
    
    /**
     * Elimina una categoríia
     * @param id de la categoría a eliminar.
     * @return Response vacío y http OK.
     */
    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Consulta todas las categorías
     * @return Response con la lista de categorías
     */
    @RequestMapping( method = RequestMethod.GET)
    public ResponseEntity<List<CategoriaResponse>> listarTodas() {
        List<CategoriaResponse> lista = categoriaService.listarTodas();
        return ResponseEntity.ok(lista);
    }
    
      /**
     * Actualiza la descripcion
     * 
     * @param id de la categoria
     * @param nuevaDesc nueva descripcion 
     * @return Response con la categoria actualizada
     */
    @RequestMapping(value = "/{id}/descripcion", method = RequestMethod.PATCH)
    public ResponseEntity<CategoriaResponse> actualizarDescripcion(@PathVariable Long id, @RequestBody String nuevaDesc) {
        return ResponseEntity.ok(categoriaService.actualizarDesc(id, nuevaDesc));
    } 
    
      /**
     * Actualiza la recomendacion
     * 
     * @param id de la categoria
     * @param nuevaRecom nueva recomendacion
     * @return Response con la categoria actualizada
     */
    @RequestMapping(value = "/{id}/recomendacion", method = RequestMethod.PATCH)
    public ResponseEntity<CategoriaResponse> actualizarRecomendacion(@PathVariable Long id, @RequestBody String nuevaRecom) {
        return ResponseEntity.ok(categoriaService.actualizarRecom(id, nuevaRecom));
    } 
    
    /**
     * Consulta todas las carreras de una categoría.
     * @param id Id de la categoría.
     * @return ResponseEntity con las carreras 
     */
    @RequestMapping(value = "/{id}/carreras", method = RequestMethod.GET)
    public ResponseEntity<List<CarreraResponse>> CarrerasPorCategoria(@PathVariable Long id) {
        List<CarreraResponse> carreras = categoriaService.consultarCarreras(id);
        return ResponseEntity.ok(carreras);
    }
    
    /**
     * elimina una carrera de la categoria
     * @param id Idde la categoría 
     * @param idCarrera Id de la carrera
     * @return ResponseEntity vacío y http OK.
     */
    @RequestMapping(value = "/{id}/Eliminarcarrera/{idCarrera}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> eliminarCarreraDeCategoria( @PathVariable Long id, @PathVariable Long idCarrera) {
        categoriaService.eliminarCarreraDeCategoria(id, idCarrera);
        return ResponseEntity.ok().build();
    }
    
}
