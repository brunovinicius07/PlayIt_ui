import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BlockMusicService } from '../../service/blockmusic.service';

@Component({
  selector: 'app-blockmusic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './blockmusic.component.html',
  styleUrls: ['./blockmusic.component.scss']
})
export class BlockMusicComponent implements OnInit {

  idRepertoire!: number;

  form = this.fb.group({
    nameBlockMusic: ['', Validators.required]
  });

  blocks: any[] = [];

  modalOpen = false;
  editMode = false;
  editingId: number | null = null;

  openMenuIndex: number | null = null;
  copiedId: number | null = null;

  deleteModalOpen = false;
  blockToDelete: any = null;

  repertoireName: string = '';


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private blockService: BlockMusicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idRepertoire = Number(this.route.snapshot.paramMap.get('id'));

    const idUser = Number(localStorage.getItem("idUser"));

    this.blockService.getRepertoireById(this.idRepertoire).subscribe({
      next: (rep: any) => this.repertoireName = rep.nameRepertoire,
      error: () => this.repertoireName = "Repertório"
    });

    this.loadBlocks();
  }

  // ==========================================
  // 🔙 Voltar
  // ==========================================
  goBack() {
    this.router.navigate(['/repertoire']);
  }

  // ==========================================
  // 🔥 Carregar blocos
  // ==========================================
  loadBlocks() {
    const idUser = Number(localStorage.getItem("idUser"));

    this.blockService.getAllByUser(idUser).subscribe({
      next: (res) => {
        this.blocks = res.filter(b => b.idRepertoire === this.idRepertoire);
      },
      error: (err) => console.error('Erro ao carregar blocos', err)
    });
  }

  // ==========================================
  // 🎨 MODAL DE CRIAR / EDITAR
  // ==========================================
  openModal(edit = false, block?: any, event?: MouseEvent) {
    event?.stopPropagation();
    this.modalOpen = true;
    this.editMode = edit;
    this.openMenuIndex = null;

    document.body.classList.add('menu-open'); // 🔥 blur igual Repertoire

    if (edit && block) {
      this.editingId = block.idBlockMusic;
      this.form.patchValue({ nameBlockMusic: block.nameBlockMusic });
    } else {
      this.editingId = null;
      this.form.reset();
    }
  }

  closeModal() {
    this.modalOpen = false;
    document.body.classList.remove('menu-open');
  }

  save() {
    if (this.form.invalid) return;

    const idUser = Number(localStorage.getItem("idUser"));

    const payload = {
      nameBlockMusic: this.form.value.nameBlockMusic,
      idRepertoire: this.idRepertoire,
      idUser: idUser
    };

    // EDITAR
    if (this.editMode && this.editingId) {
      this.blockService.update(this.editingId, payload).subscribe({
        next: () => {
          this.loadBlocks();
          this.closeModal();
          this.form.reset();
        },
        error: (err) => console.error('Erro ao atualizar bloco', err)
      });
    }
    // CRIAR
    else {
      this.blockService.create(payload).subscribe({
        next: () => {
          this.loadBlocks();
          this.closeModal();
          this.form.reset();
        },
        error: (err) => console.error('Erro ao criar bloco', err)
      });
    }
  }

  toggleMenu(i: number, event: MouseEvent) {
    event.stopPropagation();

    const isOpening = this.openMenuIndex !== i;
    this.openMenuIndex = isOpening ? i : null;

    document.body.classList.toggle("menu-open", this.openMenuIndex !== null);

    // Só faz cálculo quando estiver abrindo
    if (!isOpening) return;

    setTimeout(() => {
      const container = document.querySelector('.scroll-container') as HTMLElement;
      const cards = document.querySelectorAll('.card');
      const card = cards[i] as HTMLElement;
      const menu = card.querySelector('.dropdown-menu') as HTMLElement;

      if (!container || !card || !menu) return;

      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const padding = 40; // aumentei aqui para subir mais

      // ========================================================
      // 🔥 1 — SE O MENU FICAR FORA DA PARTE INFERIOR DA TELA
      // ========================================================
      if (menuRect.bottom > containerRect.bottom) {
        const diff = (menuRect.bottom - containerRect.bottom) + padding;
        container.scrollBy({
          top: diff,
          behavior: "smooth"
        });
      }

      // ========================================================
      // 🔥 2 — SE O MENU FICAR FORA DA PARTE SUPERIOR DA TELA
      // ========================================================
      if (menuRect.top < containerRect.top) {
        const diff = (containerRect.top - menuRect.top) + padding;
        container.scrollBy({
          top: -diff,
          behavior: "smooth"
        });
      }

      // ========================================================
      // 🔥 3 — GARANTIR QUE O CARD INTEIRO FIQUE VISÍVEL
      // ========================================================
      if (cardRect.bottom > containerRect.bottom) {
        container.scrollBy({
          top: (cardRect.bottom - containerRect.bottom) + padding,
          behavior: "smooth"
        });
      }

      if (cardRect.top < containerRect.top) {
        container.scrollBy({
          top: -(containerRect.top - cardRect.top + padding),
          behavior: "smooth"
        });
      }

    }, 10);
  }



  openBlock(idBlock: number, event?: MouseEvent) {
    event?.stopPropagation();
    console.log("Abrir bloco:", idBlock);
  }

  copyLink(id: number, event?: MouseEvent) {
    event?.stopPropagation();

    const link = `${location.origin}/repertoire/${this.idRepertoire}/blockmusic/${id}`;
    navigator.clipboard.writeText(link);

    this.copiedId = id;
    setTimeout(() => this.copiedId = null, 2000);
  }

  delete(block: any, e: MouseEvent) {
    e.stopPropagation();
    this.blockToDelete = block;
    this.deleteModalOpen = true;

    // 🔥 aplica blur no fundo igual o modal
    document.body.classList.add("menu-open");

    this.openMenuIndex = null;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.blockToDelete = null;

    document.body.classList.remove("menu-open");
  }

  closeMenu() {
    this.openMenuIndex = null;
    document.body.classList.remove('menu-open');
  }


  confirmDelete() {
    if (!this.blockToDelete) return;

    this.blockService.delete(this.blockToDelete.idBlockMusic)
      .subscribe(() => {
        this.loadBlocks();
        this.closeDeleteModal();
      });
  }

  // ==========================================
  // 🔀 Drag & Drop
  // ==========================================
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
  }

  onDrag(event: any) {
    const container = document.querySelector('.scroll-container') as HTMLElement;
    if (this.openMenuIndex !== null) return;
    if (!container) return;

    const pointerY = event.pointerPosition?.y;
    const box = container.getBoundingClientRect();

    const top = box.top + 80;
    const bottom = box.bottom - 80;

    if (pointerY < top) container.scrollTop -= 25;
    else if (pointerY > bottom) container.scrollTop += 25;
  }

}
