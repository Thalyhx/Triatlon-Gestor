/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Carreras.Service;

import Edu.Udistrital.BackEnd.Carreras.Model.AtletaResponse;
import Edu.Udistrital.BackEnd.Carreras.Model.CarreraDTO;
import Edu.Udistrital.BackEnd.Carreras.Model.CarreraResponse;
import Edu.Udistrital.BackEnd.Carreras.Model.CategoriaResponse;
import Edu.Udistrital.BackEnd.Carreras.Repository.CarreraRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 *
 * @author nath
 */

@Service
@RequiredArgsConstructor
public class CarreraService {
    
    private final ModelMapper modelMapper;
    private final RestClient restClient;
    private final CarreraRepository carreraRepository;
    
    
      /**
     * Elimina una carrera
     * 
     * @param id de la carrera
     */
    @Transactional
    public void eliminarCarrera(Long id) {
        carreraRepository.deleteById(id);
    }
    
     /**
     * Registra una carrera
     * 
     * @param dto Objeto CarreraDTO con los datos
     * @return CarreraResponse con la nueva carrera
     * @throws RuntimeException si hay error 
     */
    @Transactional
    public CarreraResponse registrarCarrera(CarreraDTO dto) {
        
           if (dto.getIdentificacionesAtletas() == null) {
            dto.setIdentificacionesAtletas(new ArrayList<>());
        }
        // guardar en db
        CarreraDTO carreraGuardada = carreraRepository.save(dto);
      
        return modelMapper.map(carreraGuardada, CarreraResponse.class);
    }
    
     /**
     * Consulta carrera por id
     * 
     * @param id
     * @return Carrera Response con los datos
     * @throws RuntimeException si no hay carrera
     */
    public CarreraResponse consultarPorId(Long id) {
        CarreraDTO carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("carrera no encontrada"));
        return modelMapper.map(carrera, CarreraResponse.class);
    }
    
    
    /**
     * Modifica ubicacion
     * * @param id de la carrera
     * @param nuevaUbicacion
     * @return Carrera response actualizada
     */
    @Transactional
    public CarreraResponse actualizarUbicacion(Long id, String nuevaUbicacion) {
        int filasAfectadas = carreraRepository.actualizarUbicacion(id, nuevaUbicacion);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar");
        }
        return consultarPorId(id);
    }
    
    /**
     * Modifica fecha
     * * @param id  de la carrera
     * @param nuevaFecha Nueva fecha de la carrera
     * @return Carrera response actualizada
     */
        @Transactional
    public CarreraResponse actualizarFecha(Long id, LocalDate nuevaFecha) {
        int filasAfectadas = carreraRepository.actualizarFecha(id, nuevaFecha);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar");
        }
        return consultarPorId(id);
    }
    
    /**
     * Consulta odos los triatletas inscritos en la carrera
     * * @param id  de la carrera
     * @return Lista de AtletaResponse 
     */
    public List<AtletaResponse> consultarAtletasInscritos(Long id) {
        CarreraDTO carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carrera no encontrada."));

        List<AtletaResponse> atletas= new ArrayList<>();
        List<String> identificaciones = carrera.getIdentificacionesAtletas();

        if (identificaciones == null || identificaciones.isEmpty()) {
            return atletas;
        }

        for (String idAtleta : identificaciones) {
                AtletaResponse atleta = restClient.get()
                        .uri("http://localhost:9000/api/atletas/" + idAtleta)
                        .retrieve()
                        .body(AtletaResponse.class);
                if (atleta != null) {
                    atletas.add(atleta);
                }

        }

        return atletas;
    }
    
    /**
     *Consultar la categoría de la carrera
     * @param id de la carrera
     * @return Categoria response 
     */
    public CategoriaResponse consultarCategoriaDeCarrera(Long id) {
        CarreraDTO carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carrera no encontrada."));

        Long idCategoria = carrera.getIdCategoria();

        try {
            return restClient.get()
                    .uri("http://localhost:9002/api/categorias/" + idCategoria)
                    .retrieve()
                    .body(CategoriaResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo obtener la categoría ");
        }
    }
    
    /**
     * Eliminar a un atleta de una carrera 
     * * @param idCarrera Id de la carrera
     * @param idAtleta Id del atleta
     */
    @Transactional
    public void eliminarAtletaDeCarrera(Long idCarrera, String idAtleta) {
        CarreraDTO carrera = carreraRepository.findById(idCarrera)
                .orElseThrow(() -> new RuntimeException("Carrera no encontrada."));

        if (carrera.getIdentificacionesAtletas() != null) {
            carrera.getIdentificacionesAtletas().remove(idAtleta);
            carreraRepository.save(carrera);
        }

        try {
            restClient.patch()
                    .uri("http://localhost:9000/api/triatletas/" + idAtleta + "/removerCarrera")
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("Error");
        }
    }
    
    /**
     * Inscribe un atleta en la lista
     */
    @Transactional
    public void registrarAtleta(Long idCarrera, String idAtleta) {
        CarreraDTO carrera = carreraRepository.findById(idCarrera)
                .orElseThrow(() -> new RuntimeException("Carrera no encontrada."));
                
        if (!carrera.getIdentificacionesAtletas().contains(idAtleta)) {
            carrera.getIdentificacionesAtletas().add(idAtleta);
            carreraRepository.save(carrera);
        }
    }
}
