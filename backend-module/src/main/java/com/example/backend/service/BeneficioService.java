package com.example.backend.service;

import com.example.backend.dto.BeneficioDTO;
import com.example.backend.dto.TransferenciaDTO;
import com.example.backend.entity.Beneficio;
import com.example.backend.repository.BeneficioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BeneficioService {
    
    @Autowired
    private BeneficioRepository beneficioRepository;
    
    public List<BeneficioDTO> findAll() {
        return beneficioRepository.findByAtivoTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<BeneficioDTO> findById(Long id) {
        return beneficioRepository.findByIdAndAtivoTrue(id)
                .map(this::convertToDTO);
    }
    
    public BeneficioDTO save(BeneficioDTO beneficioDTO) {
        Beneficio beneficio = convertToEntity(beneficioDTO);
        beneficio = beneficioRepository.save(beneficio);
        return convertToDTO(beneficio);
    }
    
    public Optional<BeneficioDTO> update(Long id, BeneficioDTO beneficioDTO) {
        return beneficioRepository.findByIdAndAtivoTrue(id)
                .map(existingBeneficio -> {
                    existingBeneficio.setNome(beneficioDTO.getNome());
                    existingBeneficio.setDescricao(beneficioDTO.getDescricao());
                    existingBeneficio.setValor(beneficioDTO.getValor());
                    existingBeneficio.setAtivo(beneficioDTO.getAtivo());
                    return convertToDTO(beneficioRepository.save(existingBeneficio));
                });
    }
    
    public boolean delete(Long id) {
        return beneficioRepository.findByIdAndAtivoTrue(id)
                .map(beneficio -> {
                    beneficio.setAtivo(false);
                    beneficioRepository.save(beneficio);
                    return true;
                })
                .orElse(false);
    }
    
    public void transferir(TransferenciaDTO transferenciaDTO) {
        Long fromId = transferenciaDTO.getFromId();
        Long toId = transferenciaDTO.getToId();
        BigDecimal valor = transferenciaDTO.getValor();
        
        // Validações básicas
        if (fromId.equals(toId)) {
            throw new IllegalArgumentException("Não é possível transferir para o mesmo benefício");
        }
        
        // Busca os benefícios
        Optional<Beneficio> fromOpt = beneficioRepository.findByIdAndAtivoTrue(fromId);
        Optional<Beneficio> toOpt = beneficioRepository.findByIdAndAtivoTrue(toId);
        
        if (fromOpt.isEmpty()) {
            throw new IllegalArgumentException("Benefício origem não encontrado: " + fromId);
        }
        
        if (toOpt.isEmpty()) {
            throw new IllegalArgumentException("Benefício destino não encontrado: " + toId);
        }
        
        Beneficio from = fromOpt.get();
        Beneficio to = toOpt.get();
        
        // Validação de saldo
        if (from.getValor().compareTo(valor) < 0) {
            throw new IllegalStateException("Saldo insuficiente. Saldo atual: " + from.getValor() + ", Valor solicitado: " + valor);
        }
        
        // Realiza a transferência
        from.setValor(from.getValor().subtract(valor));
        to.setValor(to.getValor().add(valor));
        
        beneficioRepository.save(from);
        beneficioRepository.save(to);
    }
    
    public List<BeneficioDTO> searchByNome(String nome) {
        return beneficioRepository.findByNomeContainingAndAtivoTrue(nome)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private BeneficioDTO convertToDTO(Beneficio beneficio) {
        BeneficioDTO dto = new BeneficioDTO();
        dto.setId(beneficio.getId());
        dto.setNome(beneficio.getNome());
        dto.setDescricao(beneficio.getDescricao());
        dto.setValor(beneficio.getValor());
        dto.setAtivo(beneficio.getAtivo());
        dto.setVersion(beneficio.getVersion());
        return dto;
    }
    
    private Beneficio convertToEntity(BeneficioDTO dto) {
        Beneficio beneficio = new Beneficio();
        beneficio.setId(dto.getId());
        beneficio.setNome(dto.getNome());
        beneficio.setDescricao(dto.getDescricao());
        beneficio.setValor(dto.getValor());
        beneficio.setAtivo(dto.getAtivo());
        beneficio.setVersion(dto.getVersion());
        return beneficio;
    }
}
