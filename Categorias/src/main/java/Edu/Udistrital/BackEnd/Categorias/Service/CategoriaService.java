/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Categorias.Service;

import Edu.Udistrital.BackEnd.Categorias.Model.CarreraResponse;
import Edu.Udistrital.BackEnd.Categorias.Model.CategoriaDTO;
import Edu.Udistrital.BackEnd.Categorias.Model.CategoriaResponse;
import Edu.Udistrital.BackEnd.Categorias.Repository.CategoriaRepository;
import jakarta.transaction.Transactional;
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
public class CategoriaService {
    
    private final ModelMapper modelMapper;
    private final RestClient restClient;
    private final CategoriaRepository categoriaRepository;
    
    /**
     * Registra una categoria
     * @param dto Objeto CategoriaDTO con los datos
     * @return CategoriaResponse con la nueva categoria
     * @throws RuntimeException si hay error 
     */
    @Transactional
    public CategoriaResponse registrarCategoria(CategoriaDTO dto) {
        
        return modelMapper.map(categoriaRepository.save(dto) , CategoriaResponse.class);
    }
    
    /**
     * Elimina una categoria
     * @param id de la categoria
     * @throws RuntimeException si la categoria
     */
    @Transactional
    public void eliminarCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("la categoria no existe.");
        }
        categoriaRepository.deleteById(id);
    }
    
      /**
     * Consulta categoria por id
     * 
     * @param id
     * @return Categoria Response con los datos
     * @throws RuntimeException si no hay categoria
     */
    public CategoriaResponse consultarPorId(Long id) {
        CategoriaDTO categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("categoriano encontrada"));
        return modelMapper.map(categoria, CategoriaResponse.class);
    }
    
     /**
     * Modifica descripcion
     * @param id  de la categoria
     * @param nuevaDesc nueva descripcion
     * @return Categoria response actualizada
     */
        @Transactional
    public CategoriaResponse actualizarDesc(Long id, String nuevaDesc) {
        int filasAfectadas = categoriaRepository.actualizarDesc(id, nuevaDesc);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar");
        }
        return consultarPorId(id);
    }
    
      /**
     * Modifica la recomendacion 
     * @param id  de la categoria
     * @param nuevaRecom nueva recomendacion
     * @return categoriaResponse actualizada
     */
        @Transactional
    public CategoriaResponse actualizarRecom(Long id, String nuevaRecom) {
        int filasAfectadas = categoriaRepository.actualizarRecomendacion(id, nuevaRecom);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar");
        }
        return consultarPorId(id);
    }
    
     /**
     * Lista todas las categorias 
     * 
     * @return Lista de Categoria Response con todas
     */
    public List<CategoriaResponse> listarTodas() {
        
        List<CategoriaDTO> categorias = categoriaRepository.findAll();
        
        return categorias .stream()
                .map(categoria-> modelMapper.map(categoria, CategoriaResponse.class))
                .toList();
    }
    
    /**
     * Consultar todas las carreras de categoria
     */
    public List<CarreraResponse> consultarCarreras(Long id) {
       
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("La categoría no existe");
        }

        try {
            CarreraResponse[] carreras = restClient.get()
                    .uri("http://localhost:9001/api/carreras/Categoria/" + id)
                    .retrieve()
                    .body(CarreraResponse[].class);
                    
            return List.of(carreras);
            
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar carreras");
        }
    }
    
    /**
     * Elimina una carrera de una categoría
     */
    public void eliminarCarreraDeCategoria(Long id, Long idCarrera) {
        
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("La categoría no existe");
        }

        try {
            restClient.patch()
                    .uri("http://localhost:9001/api/carreras/" + idCarrera + "/eliminarCategoria")
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("No se pudo eliminar la carrera de la categoría");
        }
    }
    
}
