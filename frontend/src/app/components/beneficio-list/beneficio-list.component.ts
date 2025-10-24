import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BeneficioService } from '../../services/beneficio.service';
import { Beneficio } from '../../models/beneficio.model';

@Component({
  selector: 'app-beneficio-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h4 class="mb-0">
          <i class="fas fa-list me-2"></i>
          Lista de Benefícios
        </h4>
      </div>
      <div class="card-body">
        <!-- Filtro de busca -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar por nome..."
                [(ngModel)]="filtroNome"
                (input)="buscar()"
              >
            </div>
          </div>
          <div class="col-md-6 text-end">
            <a routerLink="/beneficios/novo" class="btn btn-primary">
              <i class="fas fa-plus me-1"></i>
              Novo Benefício
            </a>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="carregando" class="loading">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <p class="mt-2">Carregando benefícios...</p>
        </div>

        <!-- Tabela de benefícios -->
        <div *ngIf="!carregando" class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let beneficio of beneficios">
                <td>{{ beneficio.id }}</td>
                <td>{{ beneficio.nome }}</td>
                <td>{{ beneficio.descricao || '-' }}</td>
                <td>
                  <span class="badge bg-success fs-6">
                    R$ {{ beneficio.valor | number:'1.2-2' }}
                  </span>
                </td>
                <td>
                  <span [class]="beneficio.ativo ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ beneficio.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <a 
                      [routerLink]="['/beneficios/editar', beneficio.id]" 
                      class="btn btn-sm btn-outline-primary"
                      title="Editar"
                    >
                      <i class="fas fa-edit"></i>
                    </a>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger"
                      (click)="excluir(beneficio.id!)"
                      title="Excluir"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Mensagem quando não há benefícios -->
          <div *ngIf="beneficios.length === 0" class="text-center py-4">
            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
            <p class="text-muted">Nenhum benefício encontrado</p>
            <a routerLink="/beneficios/novo" class="btn btn-primary">
              <i class="fas fa-plus me-1"></i>
              Criar primeiro benefício
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.8rem;
    }
    
    .btn-group .btn {
      margin-right: 2px;
    }
    
    .table th {
      background-color: #f8f9fa;
      font-weight: 600;
      border-top: none;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
    }
  `]
})
export class BeneficioListComponent implements OnInit {
  beneficios: Beneficio[] = [];
  carregando = false;
  filtroNome = '';

  constructor(private beneficioService: BeneficioService) {}

  ngOnInit(): void {
    this.carregarBeneficios();
  }

  carregarBeneficios(): void {
    this.carregando = true;
    this.beneficioService.listar().subscribe({
      next: (beneficios) => {
        this.beneficios = beneficios;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar benefícios:', error);
        this.carregando = false;
        alert('Erro ao carregar benefícios. Tente novamente.');
      }
    });
  }

  buscar(): void {
    if (this.filtroNome.trim()) {
      this.carregando = true;
      this.beneficioService.buscarPorNome(this.filtroNome).subscribe({
        next: (beneficios) => {
          this.beneficios = beneficios;
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro na busca:', error);
          this.carregando = false;
          alert('Erro na busca. Tente novamente.');
        }
      });
    } else {
      this.carregarBeneficios();
    }
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir este benefício?')) {
      this.beneficioService.excluir(id).subscribe({
        next: () => {
          alert('Benefício excluído com sucesso!');
          this.carregarBeneficios();
        },
        error: (error) => {
          console.error('Erro ao excluir benefício:', error);
          alert('Erro ao excluir benefício. Tente novamente.');
        }
      });
    }
  }
}
