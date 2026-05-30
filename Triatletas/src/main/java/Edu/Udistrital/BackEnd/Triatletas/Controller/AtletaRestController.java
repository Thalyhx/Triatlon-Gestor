/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Triatletas.Controller;

import Edu.Udistrital.BackEnd.Triatletas.Model.AtletaDTO;
import Edu.Udistrital.BackEnd.Triatletas.Model.AtletaResponse;
import Edu.Udistrital.BackEnd.Triatletas.Service.AtletaService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author nath
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/atletas")
public class AtletaRestController {
    
    private final AtletaService atletaService;
    
     /**
     * Registra un nuevo triatleta en el sistema.
     * 
     * @param dto Objeto AtletaDTO con los datos del triatleta
     * @return ResponseEntity con AtletaResponse y código HTTP 201 (CREATED)
     * @throws RuntimeException si hay error en la validación de datos
     */
    @RequestMapping(value = "/atleta", method = RequestMethod.POST)
    public ResponseEntity<AtletaResponse> registrar(@Valid @RequestBody AtletaDTO dto) {
        return new ResponseEntity<>(atletaService.registrarAtleta(dto), HttpStatus.CREATED);
    }
    
      /**
     * Elimina un triatleta del sistema por su identificación.
     * 
     * @param identificacion Número de identificación del triatleta a eliminar
     * @return ResponseEntity vacío con código 204 (NO CONTENT)
     */
    @RequestMapping(value = "/delete/{identificacion}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> eliminar(@PathVariable String identificacion) {
        atletaService.eliminarAtleta(identificacion);
        return ResponseEntity.noContent().build();
    }
    
     /**
     * Actualiza el nombre de un triatleta
     * 
     * @param identificacion Número de identificación del atleta
     * @param nuevoNombre Nuevo nombre del triatleta
     * @return ResponseEntity con AtletaResponse actualizado
     */
    @RequestMapping(value = "/{identificacion}/nombre", method = RequestMethod.PATCH)
    public ResponseEntity<AtletaResponse> actualizarNombre(@PathVariable String identificacion, @RequestParam String nuevoNombre) {
        return ResponseEntity.ok(atletaService.actualizarNombre(identificacion, nuevoNombre));
    }
    
    

    /**
     * Actualiza el número de identificación del atleta
     * 
     * @param identificacion Número de identificación actual del triatleta
     * @param nuevaIdentificacion Nuevo número de identificación
     * @return ResponseEntity con AtletaResponse actualizado
     */
    @RequestMapping(value = "/{identificacion}/identificacion", method = RequestMethod.PATCH)
    public ResponseEntity<AtletaResponse> actualizarIdentificacion( @PathVariable String identificacion, @RequestParam String nuevaIdentificacion) {
        return ResponseEntity.ok(atletaService.actualizarIdentificacion(identificacion, nuevaIdentificacion));
    }
    
     /**
     * Actualiza la categoría de un triatleta
     * @param identificacion Número de identificación del triatleta
     * @param nuevaCategoria Nueva categoría asignada
     * @return ResponseEntity con AtletaResponse actualizado
     */
    @RequestMapping(value = "/{identificacion}/categoria", method = RequestMethod.PATCH)
    public ResponseEntity<AtletaResponse> actualizarCategoria( @PathVariable String identificacion,  @RequestParam String nuevaCategoria) {
        return ResponseEntity.ok(atletaService.actualizarCategoria(identificacion, nuevaCategoria));
    }
    
    
    /**
     * Actualización completa de un triatleta
     * 
     * 
     * @param identificacion Número de identificación del triatleta a actualizar
     * @param dto Objeto AtletaDTO con todos los datos nuevos
     * @return ResponseEntity con AtletaResponse actualizado
     */
    @RequestMapping(value = "/{identificacion}", method = RequestMethod.PUT)
    public ResponseEntity<AtletaResponse> actualizarAtletaCompleto(@PathVariable String identificacion, @Valid @RequestBody AtletaDTO dto) {
        return ResponseEntity.ok(atletaService.actualizarAtletaCompleto(identificacion, dto));
    }
    
     /**
     * Obtiene un triatleta por su número de identificación.
     * 
     * @param identificacion Número de identificación único del triatleta (cédula)
     * @return ResponseEntity con AtletaResponse encontrado
     * @throws RuntimeException si el triatleta no existe
     */
    @RequestMapping(value = "/{identificacion}", method = RequestMethod.GET)
    public ResponseEntity<AtletaResponse> obtenerPorIdentificacion(@PathVariable String identificacion) {
        return ResponseEntity.ok(atletaService.consultarPorIdentificacion(identificacion));
    }
    
     /**
     * Lista todos los triatletas registrados en el sistema.
     * 
     * @return Lista de AtletaResponse con todos los triatletas
     */
        @RequestMapping(method = RequestMethod.GET)
        public List<AtletaResponse> listarTodos(
                @RequestParam(required = false) String genero,
                @RequestParam(required = false) String categoria,
                @RequestParam(required = false) String especialidad,
                @RequestParam(required = false) Boolean modalidadCross) {

            // Si hay filtro de genero
            if (genero != null && !genero.isEmpty()) {
                return atletaService.listarPorGenero(genero);
            }
            // Si hay filtro de categoria
            if (categoria != null && !categoria.isEmpty()) {
                return atletaService.listarPorCategoria(categoria);
            }
            // Si hay filtro de especialidad
            if (especialidad != null && !especialidad.isEmpty()) {
                return atletaService.listarPorEspecialidad(especialidad);
            }
            // Si hay filtro de modalidad cross
            if (modalidadCross != null) {
                return atletaService.listarPorModalidadCross(modalidadCross);
            }

            // Sin filtros, retorna todos
            return atletaService.listarTodos();
        }
        
     /**
     * Endpoint para registrar en carrera
     */
    @RequestMapping(value = "/{identificacion}/carrera/{idCarrera}", method = RequestMethod.POST)
    public ResponseEntity<AtletaResponse> registrarEnCarrera( @PathVariable String identificacion, @PathVariable Long idCarrera ) {
        return ResponseEntity.ok(atletaService.registrarEnCarrera(identificacion, idCarrera));
    }
    
         /**
     * Endpoint para consultar carrera
     */
    @RequestMapping(value = "/{identificacion}/carrera", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> consultarCarrera( @PathVariable String identificacion ) {
        return ResponseEntity.ok(atletaService.consultarCarrera(identificacion));
    }
    
    /**
     * Endpoint de eliminar la carrera .
     */
    @RequestMapping(value = "/{identificacion}/eliminarCarrera", method = RequestMethod.PATCH)
    public ResponseEntity<Void> eliminarCarrera( @PathVariable String identificacion) {
        
        atletaService.eliminarCarrera(identificacion);
        return ResponseEntity.ok().build();
    }
    
}
