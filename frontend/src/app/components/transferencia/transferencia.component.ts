import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BeneficioService } from '../../services/beneficio.service';
import { Beneficio, Transferencia } from '../../models/beneficio.model';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h4 class="mb-0">
          <i class="fas fa-exchange-alt me-2"></i>
          Transferência entre Benefícios
        </h4>
      </div>
      <div class="card-body">
        <form (ngSubmit)="transferir()" #transferenciaForm="ngForm">
          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label for="fromId" class="form-label">Benefício Origem *</label>
                <select 
                  class="form-select" 
                  id="fromId"
                  name="fromId"
                  [(ngModel)]="transferencia.fromId"
                  required
                  #fromIdInput="ngModel"
                >
                  <option value="">Selecione o benefício origem</option>
                  <option *ngFor="let beneficio of beneficios" [value]="beneficio.id">
                    {{ beneficio.nome }} - R$ {{ beneficio.valor | number:'1.2-2' }}
                  </option>
                </select>
                <div *ngIf="fromIdInput.invalid && fromIdInput.touched" class="text-danger">
                  <small>Benefício origem é obrigatório</small>
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="mb-3">
                <label for="toId" class="form-label">Benefício Destino *</label>
                <select 
                  class="form-select" 
                  id="toId"
                  name="toId"
                  [(ngModel)]="transferencia.toId"
                  required
                  #toIdInput="ngModel"
                >
                  <option value="">Selecione o benefício destino</option>
                  <option *ngFor="let beneficio of beneficios" [value]="beneficio.id">
                    {{ beneficio.nome }} - R$ {{ beneficio.valor | number:'1.2-2' }}
                  </option>
                </select>
                <div *ngIf="toIdInput.invalid && toIdInput.touched" class="text-danger">
                  <small>Benefício destino é obrigatório</small>
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="mb-3">
                <label for="valor" class="form-label">Valor *</label>
                <div class="input-group">
                  <span class="input-group-text">R$</span>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="valor"
                    name="valor"
                    [(ngModel)]="transferencia.valor"
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

          <!-- Validação de origem e destino iguais -->
          <div *ngIf="transferencia.fromId && transferencia.toId && transferencia.fromId === transferencia.toId" 
               class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Não é possível transferir para o mesmo benefício
          </div>

          <!-- Informações do benefício origem -->
          <div *ngIf="beneficioOrigem" class="alert alert-info">
            <h6><i class="fas fa-info-circle me-2"></i>Informações do Benefício Origem</h6>
            <p class="mb-1"><strong>Nome:</strong> {{ beneficioOrigem.nome }}</p>
            <p class="mb-1"><strong>Saldo atual:</strong> R$ {{ beneficioOrigem.valor | number:'1.2-2' }}</p>
            <p class="mb-0" *ngIf="transferencia.valor > 0">
              <strong>Saldo após transferência:</strong> 
              R$ {{ (beneficioOrigem.valor - transferencia.valor) | number:'1.2-2' }}
              <span *ngIf="transferencia.valor > beneficioOrigem.valor" class="text-danger">
                (Saldo insuficiente!)
              </span>
            </p>
          </div>

          <!-- Informações do benefício destino -->
          <div *ngIf="beneficioDestino" class="alert alert-success">
            <h6><i class="fas fa-check-circle me-2"></i>Informações do Benefício Destino</h6>
            <p class="mb-1"><strong>Nome:</strong> {{ beneficioDestino.nome }}</p>
            <p class="mb-1"><strong>Saldo atual:</strong> R$ {{ beneficioDestino.valor | number:'1.2-2' }}</p>
            <p class="mb-0" *ngIf="transferencia.valor > 0">
              <strong>Saldo após transferência:</strong> 
              R$ {{ (beneficioDestino.valor + transferencia.valor) | number:'1.2-2' }}
            </p>
          </div>

          <div class="d-flex justify-content-between">
            <a routerLink="/beneficios" class="btn btn-secondary">
              <i class="fas fa-arrow-left me-1"></i>
              Voltar
            </a>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="transferenciaForm.invalid || processando || transferencia.fromId === transferencia.toId"
            >
              <i class="fas fa-exchange-alt me-1"></i>
              {{ processando ? 'Processando...' : 'Transferir' }}
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
    
    .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    .alert h6 {
      font-weight: 600;
      margin-bottom: 0.5rem;
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
export class TransferenciaComponent implements OnInit {
  beneficios: Beneficio[] = [];
  transferencia: Transferencia = {
    fromId: 0,
    toId: 0,
    valor: 0
  };
  processando = false;

  constructor(private beneficioService: BeneficioService) {}

  ngOnInit(): void {
    this.carregarBeneficios();
  }

  carregarBeneficios(): void {
    this.beneficioService.listar().subscribe({
      next: (beneficios) => {
        this.beneficios = beneficios;
      },
      error: (error) => {
        console.error('Erro ao carregar benefícios:', error);
        alert('Erro ao carregar benefícios. Tente novamente.');
      }
    });
  }

  get beneficioOrigem(): Beneficio | undefined {
    return this.beneficios.find(b => b.id === this.transferencia.fromId);
  }

  get beneficioDestino(): Beneficio | undefined {
    return this.beneficios.find(b => b.id === this.transferencia.toId);
  }

  transferir(): void {
    if (this.processando) return;
    
    this.processando = true;
    
    this.beneficioService.transferir(this.transferencia).subscribe({
      next: (mensagem) => {
        alert(mensagem);
        this.transferencia = { fromId: 0, toId: 0, valor: 0 };
        this.carregarBeneficios();
        this.processando = false;
      },
      error: (error) => {
        console.error('Erro na transferência:', error);
        alert('Erro na transferência: ' + error.error);
        this.processando = false;
      }
    });
  }
}
