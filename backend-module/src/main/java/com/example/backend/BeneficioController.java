package com.example.backend;

import com.example.backend.dto.BeneficioDTO;
import com.example.backend.dto.TransferenciaDTO;
import com.example.backend.service.BeneficioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/beneficios")
@Tag(name = "Benefícios", description = "API para gerenciamento de benefícios")
public class BeneficioController {

    @Autowired
    private BeneficioService beneficioService;

    @GetMapping
    @Operation(summary = "Listar todos os benefícios ativos", 
               description = "Retorna uma lista de todos os benefícios ativos")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de benefícios retornada com sucesso")
    })
    public ResponseEntity<List<BeneficioDTO>> listarTodos() {
        List<BeneficioDTO> beneficios = beneficioService.findAll();
        return ResponseEntity.ok(beneficios);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar benefício por ID", 
               description = "Retorna um benefício específico pelo seu ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Benefício encontrado"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado")
    })
    public ResponseEntity<BeneficioDTO> buscarPorId(
            @Parameter(description = "ID do benefício") @PathVariable Long id) {
        Optional<BeneficioDTO> beneficio = beneficioService.findById(id);
        return beneficio.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Criar novo benefício", 
               description = "Cria um novo benefício no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Benefício criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<BeneficioDTO> criar(@Valid @RequestBody BeneficioDTO beneficioDTO) {
        BeneficioDTO beneficioCriado = beneficioService.save(beneficioDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(beneficioCriado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar benefício", 
               description = "Atualiza um benefício existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Benefício atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<BeneficioDTO> atualizar(
            @Parameter(description = "ID do benefício") @PathVariable Long id,
            @Valid @RequestBody BeneficioDTO beneficioDTO) {
        Optional<BeneficioDTO> beneficioAtualizado = beneficioService.update(id, beneficioDTO);
        return beneficioAtualizado.map(ResponseEntity::ok)
                                 .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir benefício", 
               description = "Marca um benefício como inativo (exclusão lógica)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Benefício excluído com sucesso"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado")
    })
    public ResponseEntity<Void> excluir(
            @Parameter(description = "ID do benefício") @PathVariable Long id) {
        boolean excluido = beneficioService.delete(id);
        return excluido ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/transferir")
    @Operation(summary = "Transferir valor entre benefícios", 
               description = "Transfere um valor de um benefício para outro")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Transferência realizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou saldo insuficiente"),
        @ApiResponse(responseCode = "404", description = "Benefício não encontrado")
    })
    public ResponseEntity<String> transferir(@Valid @RequestBody TransferenciaDTO transferenciaDTO) {
        try {
            beneficioService.transferir(transferenciaDTO);
            return ResponseEntity.ok("Transferência realizada com sucesso");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar benefícios por nome", 
               description = "Busca benefícios que contenham o nome especificado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de benefícios encontrados")
    })
    public ResponseEntity<List<BeneficioDTO>> buscarPorNome(
            @Parameter(description = "Nome para busca") @RequestParam String nome) {
        List<BeneficioDTO> beneficios = beneficioService.searchByNome(nome);
        return ResponseEntity.ok(beneficios);
    }
}
