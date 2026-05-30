/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Carreras.Controller;

import Edu.Udistrital.BackEnd.Carreras.Model.AtletaResponse;
import Edu.Udistrital.BackEnd.Carreras.Model.CarreraDTO;
import Edu.Udistrital.BackEnd.Carreras.Model.CarreraResponse;
import Edu.Udistrital.BackEnd.Carreras.Model.CategoriaResponse;
import Edu.Udistrital.BackEnd.Carreras.Service.CarreraService;
import jakarta.validation.Valid;
import java.time.LocalDate;
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
@RequestMapping("/api/carreras")
public class CarreraRestController {
    
        private final CarreraService carreraService;
     
     /**
     * Consulta una carrera por su id
     * @param id Id de la carrera.
     * @return ResponseEntity con datos código HTTP OK
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<CarreraResponse> consultarCarrera(@PathVariable Long id) {
        CarreraResponse carrera = carreraService.consultarPorId(id);
        return ResponseEntity.ok(carrera);
    }
    
     /**
     * Registra una carrera
     * 
     * @param dto Objeto carreraDTO con los datos
     * @return ResponseEntity con carrera Response y código HTTP CREATED
     * @throws RuntimeException si hay error 
     */
    @RequestMapping(value = "/carrera", method = RequestMethod.POST)
    public ResponseEntity<CarreraResponse> registrar(@Valid @RequestBody CarreraDTO dto) {
        return new ResponseEntity<>(carreraService.registrarCarrera(dto), HttpStatus.CREATED);
    }
    
      /**
     * Elimina una carrera por su id 
     * 
     * @param id de carrera
     * @return ResponseEntity vacío con código Ok
     */
    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        carreraService.eliminarCarrera(id);
        return ResponseEntity.ok().build();
    } 
    
      /**
     * Actualiza la ubicacion
     * 
     * @param id de la carrera
     * @param nuevaUbicacion nueva ubicacion de la carrera
     * @return ResponseEntity con carrreraResponse actualizado
     */
    @RequestMapping(value = "/{id}/ubicacion", method = RequestMethod.PATCH)
    public ResponseEntity<CarreraResponse> actualizarUbicacion(@PathVariable Long id, @RequestBody String nuevaUbicacion) {
        return ResponseEntity.ok(carreraService.actualizarUbicacion(id, nuevaUbicacion));
    } 
    
      /**
     * Actualiza la fecha
     * 
     * @param id de la carrera
     * @param nuevaFecha 
     * @return ResponseEntity con carrreraResponse actualizado
     */
    @RequestMapping(value = "/{id}/fecha", method = RequestMethod.PATCH)
    public ResponseEntity<CarreraResponse> actualizarFecha(@PathVariable Long id, @RequestBody LocalDate nuevaFecha) {
        return ResponseEntity.ok(carreraService.actualizarFecha(id, nuevaFecha));
    } 
    
    /**
     * registrar atleta en carrera
     * @param id  de la carrera.
     * @param idAtleta Identificacion del atleta.
     * @return ResponseEntity vacío
     */
    @RequestMapping(value = "/{id}/registrarAtleta/{idAtleta}", method = RequestMethod.POST)
    public ResponseEntity<Void> registrarAtleta( @PathVariable Long id, @PathVariable String idAtleta) {
        carreraService.registrarAtleta(id, idAtleta);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Elimina atleta de la carrera
     * @param id Id de la carrera.
     * @param idAtleta Identificacion del triatleta.
     * @return ResponseEntity vacío de confirmacion
     */
    @RequestMapping(value = "/{id}/eliminarAtleta/{idAtleta}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> eliminarAtletaDeCarrera( @PathVariable Long id,   @PathVariable String idAtleta) {
        carreraService.eliminarAtletaDeCarrera(id, idAtleta);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Consulta la categoría de  una carrera.
     * @param id de la carrera.
     * @return ResponseEntity con los datos de la categoría.
     */
    @RequestMapping(value = "/{id}/categoria", method = RequestMethod.GET)
    public ResponseEntity<CategoriaResponse> consultarCategoriaDeCarrera(@PathVariable Long id) {
        CategoriaResponse categoria = carreraService.consultarCategoriaDeCarrera(id);
        return ResponseEntity.ok(categoria);
    }
    
    /**
     * Consulta todos los triatletas de una carrera
     * @param id  de la carrera.
     * @return ResponseEntity con la lista de atletas i
     */
    @RequestMapping(value = "/{id}/atletas", method = RequestMethod.GET)
    public ResponseEntity<List<AtletaResponse>> consultarAtletasInscritos(@PathVariable Long id) {
        List<AtletaResponse> atletas = carreraService.consultarAtletasInscritos(id);
        return ResponseEntity.ok(atletas);
    }
    
    /**
     * consulta todas  las carreras de una categoria
     *  @param idCategoria Id de la categoría.
     * @return ResponseEntity con la lista de carreras
     */
    @RequestMapping(value = "/Categoria/{idCategoria}", method = RequestMethod.GET)
    public ResponseEntity<List<CarreraResponse>> consultarPorCategoria(@PathVariable Long idCategoria) {
        
        List<CarreraResponse> carreras = carreraService.listaCategoria(idCategoria);
        return ResponseEntity.ok(carreras);
    }
}
