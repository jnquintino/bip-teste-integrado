import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BeneficioService } from '../../services/beneficio.service';
import { Beneficio } from '../../models/beneficio.model';

@Component({
  selector: 'app-beneficio-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h4 class="mb-0">
          <i class="fas fa-edit me-2"></i>
          {{ isEdicao ? 'Editar Benefício' : 'Novo Benefício' }}
        </h4>
      </div>
      <div class="card-body">
        <form (ngSubmit)="salvar()" #beneficioForm="ngForm">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="nome" class="form-label">Nome *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="nome"
                  name="nome"
                  [(ngModel)]="beneficio.nome"
                  required
                  minlength="3"
                  maxlength="100"
                  #nomeInput="ngModel"
                >
                <div *ngIf="nomeInput.invalid && nomeInput.touched" class="text-danger">
                  <small *ngIf="nomeInput.errors?.['required']">Nome é obrigatório</small>
                  <small *ngIf="nomeInput.errors?.['minlength']">Nome deve ter pelo menos 3 caracteres</small>
                  <small *ngIf="nomeInput.errors?.['maxlength']">Nome deve ter no máximo 100 caracteres</small>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="valor" class="form-label">Valor *</label>
                <div class="input-group">
                  <span class="input-group-text">R$</span>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="valor"
                    name="valor"
                    [(ngModel)]="beneficio.valor"
                    required
                    min="0.01"
                    step="0.01"
                    #valorInput="ngModel"
                  >
                </div>
                <div *ngIf="valorInput.invalid && valorInput.touched" class="text-danger">
                  <small *ngIf="valorInput.errors?.['required']">Valor é obrigatório</small>
                  <small *ngIf="valorInput.errors?.['min']">Valor deve ser maior que zero</small>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="descricao" class="form-label">Descrição</label>
            <textarea 
              class="form-control" 
              id="descricao"
              name="descricao"
              [(ngModel)]="beneficio.descricao"
              rows="3"
              maxlength="255"
              #descricaoInput="ngModel"
            ></textarea>
            <div *ngIf="descricaoInput.invalid && descricaoInput.touched" class="text-danger">
              <small *ngIf="descricaoInput.errors?.['maxlength']">Descrição deve ter no máximo 255 caracteres</small>
            </div>
          </div>

          <div class="mb-3" *ngIf="isEdicao">
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="ativo"
                name="ativo"
                [(ngModel)]="beneficio.ativo"
              >
              <label class="form-check-label" for="ativo">
                Benefício ativo
              </label>
            </div>
          </div>

          <div class="d-flex justify-content-between">
            <a routerLink="/beneficios" class="btn btn-secondary">
              <i class="fas fa-arrow-left me-1"></i>
              Voltar
            </a>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="beneficioForm.invalid || salvando"
            >
              <i class="fas fa-save me-1"></i>
              {{ salvando ? 'Salvando...' : (isEdicao ? 'Atualizar' : 'Criar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 600;
      color: #495057;
    }
    
    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    .input-group-text {
      background-color: #f8f9fa;
      border-color: #ced4da;
      font-weight: 500;
    }
    
    .text-danger small {
      font-size: 0.8rem;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class BeneficioFormComponent implements OnInit {
  beneficio: Beneficio = {
    nome: '',
    descricao: '',
    valor: 0,
    ativo: true
  };
  
  isEdicao = false;
  salvando = false;

  constructor(
    private beneficioService: BeneficioService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdicao = true;
      this.carregarBeneficio(parseInt(id));
    }
  }

  carregarBeneficio(id: number): void {
    this.beneficioService.buscarPorId(id).subscribe({
      next: (beneficio) => {
        this.beneficio = beneficio;
      },
      error: (error) => {
        console.error('Erro ao carregar benefício:', error);
        alert('Erro ao carregar benefício. Tente novamente.');
        this.router.navigate(['/beneficios']);
      }
    });
  }

  salvar(): void {
    if (this.salvando) return;
    
    this.salvando = true;
    
    const operacao = this.isEdicao 
      ? this.beneficioService.atualizar(this.beneficio.id!, this.beneficio)
      : this.beneficioService.criar(this.beneficio);

    operacao.subscribe({
      next: (beneficio) => {
        alert(this.isEdicao ? 'Benefício atualizado com sucesso!' : 'Benefício criado com sucesso!');
        this.router.navigate(['/beneficios']);
      },
      error: (error) => {
        console.error('Erro ao salvar benefício:', error);
        alert('Erro ao salvar benefício. Tente novamente.');
        this.salvando = false;
      }
    });
  }
}
