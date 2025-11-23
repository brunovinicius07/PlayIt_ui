import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { RepertoireService } from '../../service/repertoire.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-repertoire',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  templateUrl: './repertoire.component.html',
  styleUrls: ['./repertoire.component.scss']
})
export class RepertoireComponent implements OnInit {

  form!: FormGroup;
  modalOpen = false;
  editMode = false;

  openMenuIndex: number | null = null;
  editingId: number | null = null;
  copiedId: number | null = null;

  repertorios: any[] = [];

  // 🔥 MODAL DE EXCLUSÃO
  deleteModalOpen = false;
  repertoireToDelete: any = null;

  constructor(
    private fb: FormBuilder,
    private repertoireService: RepertoireService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nameRepertoire: ['', Validators.required]
    });

    this.loadRepertoires();

    window.addEventListener('click', (e: any) => {
      const clickedAdd = e.target.closest?.('.btn-add');

      // Se clicou no botão de adicionar, não fecha o menu
      if (clickedAdd) return;

      // Fecha o menu normalmente
      this.openMenuIndex = null;
    });


    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.openMenuIndex = null;
        this.closeDeleteModal();
        this.closeModal();
      }

      if (e.key === 'Enter' && this.modalOpen) {
        e.preventDefault();      // impede submit automático do form
        this.save();             // 🔥 chama salvar
      }

      if (e.key === 'Enter' && this.deleteModalOpen) {
        e.preventDefault();
        this.confirmDelete();  // 🔥 chama exclusão
      }
    });
  }

  toggleMenu(i: number, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === i ? null : i;
  }

  openModal(edit = false, rep?: any, event?: MouseEvent) {
    event?.stopPropagation(); // 🔥 impede o click do card

    this.openMenuIndex = null; // fecha o menu
    this.modalOpen = true;
    this.editMode = edit;

    if (edit && rep) {
      this.editingId = rep.idRepertoire;
      this.form.patchValue({ nameRepertoire: rep.nameRepertoire });
    } else {
      this.editingId = null;
      this.form.reset();
    }
  }


  closeModal() {
    this.modalOpen = false;
  }

  createRepertoire() {
    if (this.form.invalid) return;

    const idUser = Number(localStorage.getItem("idUser"));
    const nameRepertoire = this.form.value.nameRepertoire;

    this.repertoireService.create({ idUser, nameRepertoire }).subscribe(() => {
      this.modalOpen = false;
      this.form.reset();
      this.loadRepertoires();
    });
  }

  save() {
    const idUser = Number(localStorage.getItem("idUser"));
    const nameRepertoire = this.form.value.nameRepertoire;

    if (this.editMode && this.editingId !== null) {
      this.repertoireService.update(this.editingId, { idUser, nameRepertoire }).subscribe(() => {
        this.closeModal();
        this.loadRepertoires();
      });
    } else {
      this.repertoireService.create({ idUser, nameRepertoire }).subscribe(() => {
        this.closeModal();
        this.loadRepertoires();
      });
    }
  }

  // ==========================
  // 🔥 MODAL DE EXCLUSÃO
  // ==========================
  deleteRepertoire(rep: any, event?: MouseEvent) {
    event?.stopPropagation(); // 🔥 impede o card de navegar
    this.repertoireToDelete = rep;
    this.deleteModalOpen = true;
    this.openMenuIndex = null;
  }


  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.repertoireToDelete = null;
  }

  confirmDelete() {
    if (!this.repertoireToDelete) return;

    this.repertoireService.delete(this.repertoireToDelete.idRepertoire)
      .subscribe(() => {
        this.loadRepertoires();
        this.closeDeleteModal();
      });
  }

  openRepertoire(id: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.router.navigate(['/repertoire', id]);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.repertorios, event.previousIndex, event.currentIndex);
  }

  loadRepertoires() {
    const idUser = Number(localStorage.getItem("idUser"));

    this.repertoireService.getAll(idUser).subscribe({
      next: (data) => {
        this.repertorios = data;
      },
      error: (err) => console.error("Erro ao carregar repertórios", err)
    });
  }

  copyLink(id: number, event?: MouseEvent) {
    event?.stopPropagation();

    const link = `${location.origin}/repertoire/${id}`;
    navigator.clipboard.writeText(link);

    this.copiedId = id;

    // 🔥 Depois de 4 segundos reseta o estado
    setTimeout(() => {
      this.copiedId = null;
    }, 2000);
  }
}
