/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Edu.Udistrital.BackEnd.Triatletas.Service;


import Edu.Udistrital.BackEnd.Triatletas.Model.AtletaDTO;
import Edu.Udistrital.BackEnd.Triatletas.Model.AtletaResponse;
import Edu.Udistrital.BackEnd.Triatletas.Model.CarreraResponse;
import Edu.Udistrital.BackEnd.Triatletas.Model.Persona;
import Edu.Udistrital.BackEnd.Triatletas.Repository.AtletaRepository;
import jakarta.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
public class AtletaService {
    
    private final AtletaRepository atletaRepository;
    private final EmailService emailService;
    private final ModelMapper modelMapper;
    private final RestClient restClient;
    
     /**
     * Calcula la categoría de un triatleta basado en su edad.
     * 
     * Rango de categorías:
     * - Pre-benjamín: 7 años
     * - Benjamín: 8-9 años
     * - Alevín: 10-11 años
     * - Infantil: 12-13 años
     * - Cadete: 14-15 años
     * - Juvenil: 16-17 años
     * - Junior: 18-19 años
     * - Sub23: 20-23 años
     * - Absoluta: 24-39 años
     * - Veterano 1: 40-49 años
     * - Veterano 2: 50-59 años
     * - Veterano 3: 60+ años
     * 
     * @param edad Edad del triatleta en años
     * @return String con la categoría calculada
     * @throws RuntimeException si la edad es menor a 7 años
     */
    private String calcularCategoria(int edad) {
        // Validar edad mínima
        if (edad < 7) {
            throw new RuntimeException("La edad mínima permitida para competir es de 7 años.");
        }
        
        // Categorías en Edad Escolar
        if (edad == 7) return "Pre-benjamín";
        if (edad >= 8 && edad <= 9) return "Benjamín";
        if (edad >= 10 && edad <= 11) return "Alevín";
        if (edad >= 12 && edad <= 13) return "Infantil";
        
        // Categorías Competitivas
        if (edad >= 14 && edad <= 15) return "Cadete";
        if (edad >= 16 && edad <= 17) return "Juvenil";
        if (edad >= 18 && edad <= 19) return "Junior";
        if (edad >= 20 && edad <= 23) return "Sub23";
        if (edad >= 24 && edad <= 39) return "Absoluta";
        if (edad >= 40 && edad <= 49) return "Veterano 1";
        if (edad >= 50 && edad <= 59) return "Veterano 2";
        
        // Categoría para 60 años o más
        return "Veterano 3";
    }
    
     /**
     * Consulta un triatleta por su número de identificación.
     * 
     * @param identificacion Número de identificación del triatleta
     * @return AtletaResponse con los datos del triatleta encontrado
     * @throws RuntimeException si el triatleta no existe
     */
    public AtletaResponse consultarPorIdentificacion(String identificacion) {
        Persona atleta = atletaRepository.findByIdentificacion(identificacion)
                .orElseThrow(() -> new RuntimeException("Atleta no encontrado"));
        return modelMapper.map(atleta, AtletaResponse.class);
    }
    
     /**
     * Lista todos los triatletas de un género específico.
     * 
     * @param genero Género a filtrar ('M' o 'F')
     * @return Lista de AtletaResponse filtrados por género
     */
    public List<AtletaResponse> listarPorGenero(String genero) {
        return atletaRepository.findByGenero(genero)
                .stream()
                .map(atleta -> modelMapper.map(atleta, AtletaResponse.class))
               .toList();
    }
    
     /**
     * Lista todos los triatletas de una especialidad específica.
     * 
     * @param especialidad Especialidad a filtrar
     * @return Lista de AtletaResponse filtrados por especialidad
     */
    public List<AtletaResponse> listarPorEspecialidad(String especialidad) {
        return atletaRepository.findByEspecialidad(especialidad)
                .stream()
                .map(atleta -> modelMapper.map(atleta, AtletaResponse.class))
                .toList();
    }
    
     /**
     * Valida que la especialidad sea permitida para la categoría del triatleta.
     * 
     * - Cadete solo puede participar en Sprint
     * - Junior puede participar en Sprint o Estándar
     * - Otras categorías pueden participar en cualquier especialidad
     * 
     * @param categoria Categoría del triatleta
     * @param especialidad Especialidad/distancia elegida
     * @throws RuntimeException si la especialidad no es válida para la categoría
     */
    private void validarEspecialidad(String categoria, String especialidad) {
        if ("Cadete".equalsIgnoreCase(categoria)) {
            if (!"Sprint".equalsIgnoreCase(especialidad)) {
                throw new RuntimeException("La categoría Cadete solo permite distancia Sprint.");
            }
        } else if ("Junior".equalsIgnoreCase(categoria)) {
            if (!"Sprint".equalsIgnoreCase(especialidad) && !"Estándar".equalsIgnoreCase(especialidad)) {
                throw new RuntimeException("La categoría Junior solo permite distancias Sprint y Estándar.");
            }
        }
    }
    
     /**
     * Lista triatletas por modalidad Cross.
     * 
     * @param modalidadCross true para triatletas con Cross, false para los que no
     * @return Lista de AtletaResponse filtrados por modalidad Cross
     */
    public List<AtletaResponse> listarPorModalidadCross(Boolean modalidadCross) {
        return atletaRepository.findByModalidadCross(modalidadCross)
                .stream()
                .map(atleta -> modelMapper.map(atleta, AtletaResponse.class))
                .toList();
    }
    
     /**
     * Lista todos los triatletas de una categoría de edad específica.
     * 
     * @param categoria Categoría a filtrar
     * @return Lista de AtletaResponse filtrados por categoría
     */
    public List<AtletaResponse> listarPorCategoria(String categoria) {
        return atletaRepository.findByCategoria(categoria)
                .stream()
                .map(atleta -> modelMapper.map(atleta, AtletaResponse.class))
                .toList();
    }
    
     /**
     * Lista todos los triatletas registrados en el sistema.
     * 
     * @return Lista de AtletaResponse con todos los triatletas
     */
    public List<AtletaResponse> listarTodos() {
        return atletaRepository.findAll()
                .stream()
                .map(atleta -> modelMapper.map(atleta, AtletaResponse.class))
                .toList();
    }
    
     /**
     * Actualiza la categoría de un triatleta.
     * 
     * @param identificacion Número de identificación del triatleta
     * @param nuevaCategoria Nueva categoría
     * @return AtletaResponse actualizado
     * @throws RuntimeException si no se puede actualizar
     */
    @Transactional
    public AtletaResponse actualizarCategoria(String identificacion, String nuevaCategoria) {
        int filasAfectadas = atletaRepository.actualizarCategoria(identificacion, nuevaCategoria);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar la categoría. Triatleta no encontrado.");
        }
        return consultarPorIdentificacion(identificacion);
    }
    
     /**
     * Actualiza el nombre de un triatleta.
     * 
     * @param identificacion Número de identificación del triatleta
     * @param nuevoNombre Nuevo nombre
     * @return AtletaResponse actualizado
     * @throws RuntimeException si no se puede actualizar
     */
    @Transactional
    public AtletaResponse actualizarNombre(String identificacion, String nuevoNombre) {
        int filasAfectadas = atletaRepository.actualizarNombre(identificacion, nuevoNombre);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar el nombre. Triatleta no encontrado.");
        }
        return consultarPorIdentificacion(identificacion);
    }
    
     /**
     * Actualiza el número de identificación de un triatleta.
     * 
     * @param identificacionActual Número de identificación actual
     * @param nuevaIdentificacion Nuevo número de identificación
     * @return AtletaResponse actualizado
     * @throws RuntimeException si no se puede actualizar
     */
    @Transactional
    public AtletaResponse actualizarIdentificacion(String identificacionActual, String nuevaIdentificacion) {
        int filasAfectadas = atletaRepository.actualizarIdentificacion(identificacionActual, nuevaIdentificacion);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar la identificación. Triatleta no encontrado.");
        }
        return consultarPorIdentificacion(nuevaIdentificacion);
    }
    
      /**
     * Elimina un triatleta del sistema.
     * 
     * @param identificacion Número de identificación del triatleta a eliminar
     */
    @Transactional
    public void eliminarAtleta(String identificacion) {
        atletaRepository.deleteByIdentificacion(identificacion);
    }
    
     /**
     * Registra un nuevo triatleta en el sistema.
     * 
     * @param dto Objeto AtletaDTO con los datos del nuevo triatleta
     * @return AtletaResponse con el triatleta registrado
     * @throws RuntimeException si hay error en validación o persistencia
     */
    @Transactional
    public AtletaResponse registrarAtleta(AtletaDTO dto) {
        // Calcula la categoría basada en edad 
        String categoriaCalculada = calcularCategoria(dto.getEdad());
         dto.setCategoria(categoriaCalculada);
         
        // Valida que la especialidad sea permitida para la categoría
        validarEspecialidad(categoriaCalculada, dto.getEspecialidad());
        

        // guardar en db
        Persona guardado = atletaRepository.save(dto);
        
        // Envia el correo
        emailService.enviarCorreoBienvenida(guardado.getCorreo(), guardado.getNombre());
      
        return modelMapper.map(guardado, AtletaResponse.class);
    }
    
     /**
     * Actualiza todos los datos del atleta
     * 
     * @param identificacion Número de identificación del triatleta a actualizar
     * @param dto Objeto AtletaDTO con todos los datos nuevos
     * @return AtletaResponse con el triatleta actualizado
     * @throws RuntimeException si el triatleta no existe o hay error en actualización
     */
    @Transactional
    public AtletaResponse actualizarAtletaCompleto(String identificacion, AtletaDTO dto) {
        // Verifica que el atleta existe
        AtletaDTO atletaExistente = atletaRepository.findByIdentificacion(identificacion)
            .orElseThrow(() -> new RuntimeException("Triatleta no encontrado"));

        // Validar que la especialidad sea permitida para la categoría
        validarEspecialidad(dto.getCategoria(), dto.getEspecialidad());

        AtletaDTO atletaActualizado = atletaRepository.save(atletaExistente);

        // Retorna el atleta actualizado 
        return modelMapper.map(atletaActualizado, AtletaResponse.class);
    }
    
/** Metodo de consultar por carrera
 * 
 * @param identificacion
 * @return respuestaFinal datos del atleta y de la carrera si tiene
 */

    public Map<String, Object> consultarCarrera(String identificacion) {
        
        AtletaDTO atleta = atletaRepository.findByIdentificacion(identificacion)
                .orElseThrow(() -> new RuntimeException("Atleta no encontrado"));
                
        if (atleta.getIdCarrera() == null) {
            throw new RuntimeException("El atleta no está registrado en ninguna carrera.");
        }
        
        // consulta del otro microservicio
        CarreraResponse datosCarrera = restClient.get()
                .uri("/" + atleta.getIdCarrera())
                .retrieve()
                .body(CarreraResponse.class);
        
        AtletaResponse atletaResponse = modelMapper.map(atleta, AtletaResponse.class);
        
        Map<String, Object> respuestaFinal = new HashMap<>();
        respuestaFinal.put("atleta", atletaResponse);
        respuestaFinal.put("carrera", datosCarrera); 

        return respuestaFinal;
    }
    
    /* Registrar competidor en carrera
    */
    public AtletaResponse registrarEnCarrera(String identificacion, Long idCarrera) {
        
        
        AtletaDTO atleta = atletaRepository.findByIdentificacion(identificacion)
                .orElseThrow(() -> new RuntimeException("Atleta no encontrado"));

        try {
            restClient.post()
                    
                    .uri("/" + idCarrera + "/registrarAtleta/" + identificacion) 
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("Error: no se pudo registrar en la carrera");
        }

        atleta.setIdCarrera(idCarrera);
        AtletaDTO atletaActualizado = atletaRepository.save(atleta);

        return modelMapper.map(atletaActualizado, AtletaResponse.class);
    }
    
    /**
     * elimina la carrera 
     * * @param identificacion Número de identificación 
     */
    @Transactional
    public void eliminarCarrera(String identificacion) {
        
        AtletaDTO atleta = atletaRepository.findByIdentificacion(identificacion)
                .orElseThrow(() -> new RuntimeException("Atleta no encontrado "));
               
        atleta.setIdCarrera(null);
        atletaRepository.save(atleta);
    }
}
